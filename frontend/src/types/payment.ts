export type RechargeFormData = {
  cardholderName: string
  cardNumber: string
  expirationDate: string
  cvv: string
  amount: string
}

export type RechargeFormErrors = Partial<Record<keyof RechargeFormData, string>>

export type RechargeRequest = Omit<RechargeFormData, 'amount'> & {
  amount: number
  userId: string
  userEmail: string
}

export type SnailPayTransactionStatus = 'approved' | 'rejected' | 'pending'

export type SnailPayTransactionStatusDetail =
  | 'accredited'
  | 'insufficient_funds'
  | 'invalid_card_number'
  | 'awaiting_payment'
  | 'in_process'
  | 'awaiting_processing'

export type SnailPayTransaction = {
  id: string
  card_number: string
  cvv: string
  transaction_amount: number
  date_created: string
  payer_id: string
  payer_email: string
  status: SnailPayTransactionStatus
  status_detail: SnailPayTransactionStatusDetail
  authorization_code: string | null
  reference: string
}
