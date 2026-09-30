# Snail Races

Aplicación web de apuestas simuladas en carreras de caracoles. Permite registrar usuarios, iniciar sesión, consultar un dashboard con estadísticas y recargar saldo mediante la pasarela ficticia SnailPay.

## Tecnologías

- React, TypeScript y Vite.
- Tailwind CSS para estilos.
- Express y TypeScript para la API simulada.
- LocalStorage para usuarios, sesión, saldo e historial de transacciones.
- Recharts para gráficas.
- Sonner para notificaciones.
- Vitest y React Testing Library para pruebas automatizadas.

## Requisitos previos

- Node.js 20 o superior.
- npm.

## Instalación y ejecución

Abre dos terminales desde la raíz del repositorio.

### Backend

```bash
cd backend
npm install
npm run dev
```

La API queda disponible en `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Persistencia local

La aplicación utiliza las siguientes claves de LocalStorage:

| Clave | Contenido |
| --- | --- |
| `registeredUsers` | Usuarios registrados, incluyendo hash de contraseña y saldo. |
| `currentUser` | Sesión activa del usuario. |
| `snailpayTransaction` | Historial de respuestas de transacciones de SnailPay. |

## API: recarga con SnailPay

Con el backend ejecutándose en `http://localhost:3000`, consume el siguiente endpoint:

```http
POST /api/recharge
Content-Type: application/json
```

Ejemplo de URL para Postman:

```txt
http://localhost:3000/api/recharge
```

Body JSON de ejemplo:

```json
{
  "cardNumber": "1234123412341234",
  "expirationDate": "12/26",
  "cvv": "543",
  "cardholderName": "Taylor Swift",
  "amount": 100.00,
  "userId": "11111111-1111-4111-8111-111111111111",
  "userEmail": "taylor.swift@example.com"
}
```

| Campo | Tipo | Descripción |
| --- | --- | --- |
| `cardNumber` | `string` | Número ficticio de tarjeta de 16 dígitos. |
| `expirationDate` | `string` | Fecha futura con formato `MM/AA`. |
| `cvv` | `string` | Código ficticio de tres dígitos. |
| `cardholderName` | `string` | Nombre de máximo 100 caracteres; solo letras y espacios. |
| `amount` | `number` | Monto en pesos mexicanos, mayor que cero y con máximo dos decimales. |
| `userId` | `string` | UUID del usuario autenticado. |
| `userEmail` | `string` | Correo del usuario autenticado. |

El endpoint devuelve `400 Bad Request` cuando alguno de los campos no cumple las validaciones. Las respuestas de operación incluyen `id`, `status`, `status_detail`, `transaction_amount`, `date_created`, `authorization_code`, `reference`, `payer_id`, `payer_email`, `card_number` y `cvv`.

## Simulaciones de SnailPay

Primero registra un usuario e inicia sesión. Después abre **Recargar** desde el dashboard.

Para todos los casos usa un nombre compuesto solo por letras, un CVV de tres dígitos, una fecha futura en formato `MM/AA` y un monto mayor a `0`. Los números de tarjeta son completamente ficticios.

| Caso | Número de tarjeta | Resultado esperado |
| --- | --- | --- |
| Cobro exitoso | `1234123412341234` | `202`, `status: approved`, `status_detail: accredited`. El saldo aumenta y se muestra la confirmación. |
| Fondos insuficientes | `1234567890123456` | `402`, `status: rejected`, `status_detail: insufficient_funds`. El saldo no cambia. |
| Tarjeta inválida | `0000000000000000` | `422`, `status: rejected`, `status_detail: invalid_card_number`. El saldo no cambia. |
| Error interno | `1111111111111111` | `500`, `status: error`, `status_detail: internal_error`. El saldo no cambia. |
| Timeout | `2222222222222222` | SnailPay demora 15 segundos. El frontend cancela la solicitud a los 10 segundos y muestra un mensaje de timeout; el saldo no cambia. |

Ejemplo de datos válidos para probar cualquiera de los escenarios:

```txt
Fecha de vencimiento: 12/26
CVV: 543
Nombre completo: Andrés Manuel López Obrador
Monto: 100.00
```

Los errores de validación de los campos se responden con `400 Bad Request` y no representan una transacción creada por SnailPay.

## Pruebas automatizadas

Las pruebas del frontend se ejecutan con Vitest y React Testing Library:

```bash
cd frontend
npm test
```

La suite cubre cinco flujos principales:

1. Registro de usuario con correo normalizado, hash de contraseña y saldo inicial.
2. Login correcto e incorrecto.
3. Redirección al login cuando se intenta abrir el dashboard sin sesión.
4. Recarga aprobada: guarda la transacción y actualiza el saldo.
5. Recarga rechazada por fondos insuficientes: guarda la transacción sin modificar el saldo.
