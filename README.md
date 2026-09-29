# Snail Races

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
