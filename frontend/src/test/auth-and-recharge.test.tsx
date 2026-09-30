import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'
import RechargeModal from '../components/RechargeModal'
import { AuthProvider } from '../context/AuthContext'
import LoginForm from '../pages/LoginForm'
import SignupForm from '../pages/SignupForm'
import type { AuthUser, RegisteredUser } from '../types/auth'
import type { SnailPayTransaction } from '../types/payment'
import { hashPassword } from '../../utils'

const authUser: AuthUser = {
  id: '11111111-1111-4111-8111-111111111111',
  fullName: 'Taylor Swift',
  email: 'taylor.swift@example.com',
  balance: 0,
}

function renderWithAuth(component: React.ReactNode, initialPath = '/') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[initialPath]}>{component}</MemoryRouter>
    </AuthProvider>,
  )
}

async function fillRechargeForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Nombre completo'), 'Taylor Swift')
  await user.type(screen.getByLabelText('Número de tarjeta'), '1234123412341234')
  await user.type(screen.getByLabelText('Fecha de vencimiento'), '1230')
  await user.type(screen.getByLabelText('CVV'), '543')
  await user.type(screen.getByLabelText('Monto de la recarga'), '100')
}

function createTransaction(
  status: SnailPayTransaction['status'],
  statusDetail: SnailPayTransaction['status_detail'],
): SnailPayTransaction {
  return {
    id: 'transaction-1',
    card_number: '1234123412341234',
    cvv: '543',
    transaction_amount: 100,
    date_created: '2026-09-29T12:00:00.000Z',
    payer_id: authUser.id,
    payer_email: authUser.email,
    status,
    status_detail: statusDetail,
    authorization_code: status === 'approved' ? 'AUTH-123' : null,
    reference: 'SNAILPAY-TRANSACTION-1',
  }
}

describe('flujos principales de autenticación y SnailPay', () => {
  it('registra un usuario, normaliza su correo y le asigna saldo inicial', async () => {
    const user = userEvent.setup()
    renderWithAuth(<SignupForm />)

    await user.type(screen.getByLabelText('Correo electrónico'), 'TAYLOR.SWIFT@EXAMPLE.COM')
    await user.type(screen.getByLabelText('Nombre completo'), 'Taylor Swift')
    await user.type(screen.getByLabelText('Contraseña'), 'secreta')
    await user.type(screen.getByLabelText('Confirmar contraseña'), 'secreta')
    await user.click(screen.getByRole('button', { name: 'Registrarme' }))

    await waitFor(() => {
      const users = JSON.parse(localStorage.getItem('registeredUsers') ?? '[]') as RegisteredUser[]

      expect(users).toHaveLength(1)
      expect(users[0]).toMatchObject({
        fullName: 'Taylor Swift',
        email: 'taylor.swift@example.com',
        balance: 0,
      })
      expect(users[0].passwordHash).not.toBe('secreta')
    })
  })

  it('permite login correcto y rechaza una contraseña incorrecta', async () => {
    const user = userEvent.setup()
    const passwordHash = await hashPassword('secreta')
    const registeredUser: RegisteredUser = { ...authUser, passwordHash }
    localStorage.setItem('registeredUsers', JSON.stringify([registeredUser]))
    renderWithAuth(<LoginForm />)

    await user.type(screen.getByLabelText('Correo electrónico'), authUser.email)
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario o contraseñas incorrectos')

    await user.clear(screen.getByLabelText('Contraseña'))
    await user.type(screen.getByLabelText('Contraseña'), 'secreta')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => {
      expect(
        JSON.parse(
          localStorage.getItem('currentUser') ?? '{}'
        )
      ).toMatchObject(authUser)
    })
  })

  it('redirige al login cuando se intenta abrir el dashboard sin sesión', () => {
    renderWithAuth(<App />, '/app/dashboard')

    expect(screen.getByText('Inicia sesión')).toBeInTheDocument()
  })

  it('acredita una recarga aprobada y guarda la transacción', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    localStorage.setItem('currentUser', JSON.stringify(authUser))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => createTransaction('approved', 'accredited'),
    }))
    renderWithAuth(<RechargeModal isOpen onClose={onClose} />)

    await fillRechargeForm(user)
    await user.click(screen.getByRole('button', { name: 'Recargar saldo' }))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledOnce()
      expect(JSON.parse(localStorage.getItem('currentUser') ?? '{}').balance).toBe(100)
      expect(JSON.parse(localStorage.getItem('snailpayTransaction') ?? '[]')).toHaveLength(1)
    })
  })

  it('guarda una respuesta 402 sin modificar el saldo', async () => {
    const user = userEvent.setup()
    localStorage.setItem('currentUser', JSON.stringify(authUser))
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => createTransaction('rejected', 'insufficient_funds'),
    }))
    renderWithAuth(<RechargeModal isOpen onClose={vi.fn()} />)

    await fillRechargeForm(user)
    await user.click(screen.getByRole('button', { name: 'Recargar saldo' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Fondos insuficientes para procesar la recarga.',
    )
    expect(JSON.parse(localStorage.getItem('currentUser') ?? '{}').balance).toBe(0)
    expect(JSON.parse(localStorage.getItem('snailpayTransaction') ?? '[]')).toHaveLength(1)
  })
})
