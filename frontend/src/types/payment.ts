export type RechargeFormData = {
  cardholderName: string
  cardNumber: string
  expirationDate: string
  cvv: string
  amount: string
}

export type RechargeFormErrors = Partial<Record<keyof RechargeFormData, string>>
