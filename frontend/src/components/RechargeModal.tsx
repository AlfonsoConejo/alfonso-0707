import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import snailPayLogo from '../assets/snailpay-logo.svg'
import type {
  RechargeFormData,
  RechargeFormErrors,
  RechargeRequest,
  SnailPayTransaction,
} from '../types/payment'
import { useAuth } from '../hooks/useAuth'

type RechargeModalProps = {
  isOpen: boolean
  onClose: () => void
}

const initialRechargeData: RechargeFormData = {
  cardholderName: '',
  cardNumber: '',
  expirationDate: '',
  cvv: '',
  amount: '',
}

const RECHARGE_TIMEOUT_MS = 10_000

function isExpirationDateValid(value: string) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value)

  if (!match) {
    return false
  }

  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  const today = new Date()
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()

  return year > currentYear || (year === currentYear && month >= currentMonth)
}

function getTransactionHistory(): SnailPayTransaction[] {
  try {
    const storedTransactions = localStorage.getItem('snailpayTransaction')

    if (!storedTransactions) {
      return []
    }

    const parsedTransactions: unknown = JSON.parse(storedTransactions)
    return Array.isArray(parsedTransactions) ? (parsedTransactions as SnailPayTransaction[]) : []
  } catch {
    return []
  }
}

function isSnailPayTransaction(value: unknown): value is SnailPayTransaction {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const transaction = value as Partial<SnailPayTransaction>

  return (
    typeof transaction.id === 'string' &&
    typeof transaction.status === 'string' &&
    typeof transaction.status_detail === 'string' &&
    typeof transaction.transaction_amount === 'number'
  )
}

function isTransactionError(value: unknown): value is SnailPayTransaction {
  return (
    isSnailPayTransaction(value) &&
    (value.status === 'rejected' || value.status === 'error')
  )
}

function getTransactionErrorMessage(statusDetail: SnailPayTransaction['status_detail']) {
  const messages: Partial<Record<SnailPayTransaction['status_detail'], string>> = {
    insufficient_funds: 'Fondos insuficientes para procesar la recarga.',
    invalid_card_number: 'El número de tarjeta no es válido.',
    internal_error: 'SnailPay tuvo un error interno. Intenta de nuevo más tarde.',
  }

  return messages[statusDetail] ?? 'La recarga fue rechazada por SnailPay.'
}

export default function RechargeModal({ isOpen, onClose }: RechargeModalProps) {
  const { user, addBalance } = useAuth()
  const [rechargeData, setRechargeData] = useState<RechargeFormData>(initialRechargeData)
  const [errors, setErrors] = useState<RechargeFormErrors>({})
  const [requestMessage, setRequestMessage] = useState('')
  const [serverErrors, setServerErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasEmptyFields = Object.values(rechargeData).some((value) => !value.trim())

  function resetForm() {
    setRechargeData(initialRechargeData)
    setErrors({})
    setRequestMessage('')
    setServerErrors([])
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const field = event.target.name as keyof RechargeFormData
    let value = event.target.value

    if (field === 'cardholderName') {
      value = value.replace(/[^\p{L}\s]/gu, '').slice(0, 100)
    }

    if (field === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 3)
    }

    if (field === 'cardNumber') {
      value = value.replace(/\D/g, '').slice(0, 16)
    }

    if (field === 'expirationDate') {
      const digits = value.replace(/\D/g, '').slice(0, 4)
      value = digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits
    }

    setRechargeData((currentData) => ({
      ...currentData,
      [field]: value,
    }))
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }))
    setRequestMessage('')
    setServerErrors([])
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationErrors: RechargeFormErrors = {}
    const normalizedName = rechargeData.cardholderName.trim().replace(/\s+/g, ' ')

    if (!normalizedName || !/\p{L}/u.test(normalizedName)) {
      validationErrors.cardholderName = 'Ingresa un nombre válido.'
    }

    if (!/^\d{16}$/.test(rechargeData.cardNumber)) {
      validationErrors.cardNumber = 'El número de tarjeta debe tener 16 dígitos.'
    }

    if (!/^\d{3}$/.test(rechargeData.cvv)) {
      validationErrors.cvv = 'El CVV debe tener 3 dígitos.'
    }

    if (!isExpirationDateValid(rechargeData.expirationDate)) {
      validationErrors.expirationDate = 'Ingresa una fecha válida y que no esté vencida.'
    }

    if (!/^\d+(?:\.\d{1,2})?$/.test(rechargeData.amount) || Number(rechargeData.amount) <= 0) {
      validationErrors.amount = 'Ingresa un monto válido mayor a $0.00.'
    }

    const rechargePayload: RechargeFormData = {
      ...rechargeData,
      cardholderName: normalizedName,
    }

    setRechargeData(rechargePayload)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    if (!user) {
      setServerErrors(['No se encontró una sesión activa.'])
      return
    }

    const requestBody: RechargeRequest = {
      ...rechargePayload,
      amount: Number(rechargePayload.amount),
      userId: user.id,
      userEmail: user.email,
    }

    setIsSubmitting(true)
    setRequestMessage('')
    setServerErrors([])
    const abortController = new AbortController()
    const timeoutId = window.setTimeout(() => abortController.abort(), RECHARGE_TIMEOUT_MS)

    try {
      const response = await fetch('http://localhost:3000/api/recharge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortController.signal,
      })
      const responseBody: unknown = await response.json()

      if (isSnailPayTransaction(responseBody)) {
        const transactionHistory = getTransactionHistory()

        localStorage.setItem(
          'snailpayTransaction',
          JSON.stringify([...transactionHistory, responseBody]),
        )
      }

      if (!response.ok) {
        if (isTransactionError(responseBody)) {
          setServerErrors([getTransactionErrorMessage(responseBody.status_detail)])
          return
        }

        const validationResponse = responseBody as { errors?: Record<string, string> }
        const messages = Object.values(validationResponse.errors ?? {}).filter(
          (message): message is string => Boolean(message),
        )
        setServerErrors(
          messages.length > 0 ? messages : ['No se pudo validar la solicitud de recarga.'],
        )
        return
      }

      const snailpayTransaction = responseBody as SnailPayTransaction

      const isApprovedTransaction =
        snailpayTransaction.status === 'approved' &&
        snailpayTransaction.status_detail === 'accredited'

      if (isApprovedTransaction) {
        addBalance(snailpayTransaction.transaction_amount)
        resetForm()
        onClose()
        toast.success('La recarga se procesó correctamente.')
      } else {
        setRequestMessage('Solicitud de recarga recibida.')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        setServerErrors(['SnailPay tardó demasiado en responder. Intenta de nuevo.'])
      } else {
        setServerErrors(['No fue posible conectar con SnailPay.'])
      }
    } finally {
      window.clearTimeout(timeoutId)
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-60 grid place-items-center bg-zinc-950/45 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <section
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl shadow-zinc-950/25 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="recharge-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="recharge-title" className="text-2xl font-bold text-zinc-900">
              Recarga de Saldo
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
              <img src={snailPayLogo} alt="" className="h-5 w-7 object-contain" />
              Powered by SnailPay
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar recarga"
            className="grid h-9 w-9 place-items-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#7BAE8A]/50"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-zinc-700" htmlFor="cardholder-name">
            Nombre completo
            <input
              id="cardholder-name"
              name="cardholderName"
              type="text"
              maxLength={100}
              pattern="[\p{L}\s]+"
              autoComplete="cc-name"
              placeholder="Nombre como aparece en la tarjeta"
              value={rechargeData.cardholderName}
              onChange={handleChange}
              aria-invalid={Boolean(errors.cardholderName)}
              className={[
                'h-12 rounded-lg border bg-zinc-50 px-3 text-base font-normal text-zinc-900 outline-none placeholder:text-zinc-400 focus:bg-white focus:ring-2',
                errors.cardholderName
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-zinc-300 focus:border-[#7BAE8A] focus:ring-[#7BAE8A]/20',
              ].join(' ')}
            />
            {errors.cardholderName && (
              <span className="text-xs font-medium text-red-700">{errors.cardholderName}</span>
            )}
          </label>

          <label className="grid gap-2 text-sm font-semibold text-zinc-700" htmlFor="card-number">
            Número de tarjeta
            <input
              id="card-number"
              name="cardNumber"
              type="text"
              maxLength={16}
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="0000 0000 0000 0000"
              value={rechargeData.cardNumber}
              onChange={handleChange}
              aria-invalid={Boolean(errors.cardNumber)}
              className={[
                'h-12 rounded-lg border bg-zinc-50 px-3 text-base font-normal text-zinc-900 outline-none placeholder:text-zinc-400 focus:bg-white focus:ring-2',
                errors.cardNumber
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-zinc-300 focus:border-[#7BAE8A] focus:ring-[#7BAE8A]/20',
              ].join(' ')}
            />
            {errors.cardNumber && (
              <span className="text-xs font-medium text-red-700">{errors.cardNumber}</span>
            )}
          </label>

          <div className="grid gap-1.5">
            <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-xs font-semibold text-zinc-700" htmlFor="expiration-date">
              Fecha de vencimiento
              <input
                id="expiration-date"
                name="expirationDate"
                type="text"
                maxLength={5}
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/AA"
                value={rechargeData.expirationDate}
                onChange={handleChange}
                aria-invalid={Boolean(errors.expirationDate)}
                className={[
                  'h-10 rounded-lg border bg-zinc-50 px-2 text-sm font-normal text-zinc-900 outline-none placeholder:text-zinc-400 focus:bg-white focus:ring-2',
                  errors.expirationDate
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-zinc-300 focus:border-[#7BAE8A] focus:ring-[#7BAE8A]/20',
                ].join(' ')}
              />
            </label>

            <label className="grid gap-1.5 text-xs font-semibold text-zinc-700" htmlFor="cvv">
              CVV
              <input
                id="cvv"
                name="cvv"
                type="password"
                maxLength={3}
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="000"
                value={rechargeData.cvv}
                onChange={handleChange}
                aria-invalid={Boolean(errors.cvv)}
                className={[
                  'h-10 rounded-lg border bg-zinc-50 px-2 text-sm font-normal text-zinc-900 outline-none placeholder:text-zinc-400 focus:bg-white focus:ring-2',
                  errors.cvv
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-zinc-300 focus:border-[#7BAE8A] focus:ring-[#7BAE8A]/20',
                ].join(' ')}
              />
            </label>
            </div>
            {(errors.expirationDate || errors.cvv) && (
              <div className="grid grid-cols-2 gap-3 text-xs font-medium text-red-700">
                <span className="min-w-0 break-all">{errors.expirationDate}</span>
                <span className="min-w-0 break-all">{errors.cvv}</span>
              </div>
            )}
          </div>

          <label className="grid gap-2 text-sm font-semibold text-zinc-700" htmlFor="recharge-amount">
            Monto de la recarga
            <input
              id="recharge-amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={rechargeData.amount}
              onChange={handleChange}
              aria-invalid={Boolean(errors.amount)}
              className={[
                'h-12 rounded-lg border bg-zinc-50 px-3 text-base font-normal text-zinc-900 outline-none placeholder:text-zinc-400 focus:bg-white focus:ring-2',
                errors.amount
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-zinc-300 focus:border-[#7BAE8A] focus:ring-[#7BAE8A]/20',
              ].join(' ')}
            />
            {errors.amount && (
              <span className="text-xs font-medium text-red-700">{errors.amount}</span>
            )}
          </label>

          {serverErrors.length > 0 && (
            <div className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-800" role="alert">
              <ul className="list-inside list-disc space-y-1">
                {serverErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={hasEmptyFields || isSubmitting}
            className="mt-2 h-12 rounded-lg bg-[#7BAE8A] px-4 text-base font-bold text-white transition-colors hover:bg-[#628F70] focus:outline-none focus:ring-3 focus:ring-[#7BAE8A]/30 disabled:cursor-not-allowed disabled:bg-[#7BAE8A]/50 disabled:hover:bg-[#7BAE8A]/50"
          >
            {isSubmitting ? 'Enviando solicitud...' : 'Recargar saldo'}
          </button>
          {requestMessage && (
            <p
              className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
              role="status"
            >
              {requestMessage}
            </p>
          )}
        </form>
      </section>
    </div>
  )
}
