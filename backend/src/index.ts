import express from 'express';

type RechargeRequestBody = {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  cardholderName: string;
  amount: number;
  userId: string;
  userEmail: string;
};

type RechargeValidationErrors = Partial<Record<keyof RechargeRequestBody, string>>;

type TransactionStatus = 'approved' | 'rejected' | 'pending';

type TransactionStatusDetail =
  | 'accredited'
  | 'insufficient_funds'
  | 'invalid_card_number'
  | 'awaiting_payment'
  | 'in_process'
  | 'awaiting_processing';

type RechargeResponse = {
  id: string;
  card_number: string;
  cvv: string;
  transaction_amount: number;
  date_created: string;
  payer_id: string;
  payer_email: string;
  status: TransactionStatus;
  status_detail: TransactionStatusDetail;
  authorization_code: string | null;
  reference: string;
};

function isExpirationDateValid(value: string) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  return year > currentYear || (year === currentYear && month >= currentMonth);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

const app = express();
const PORT = 3000;

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.get('/', (_req, res) => {
  res.json({ message: 'API funcionando' });
});

app.post('/api/recharge', (req, res) => {
  const body = req.body as Partial<RechargeRequestBody>;
  const errors: RechargeValidationErrors = {};
  const cardholderName =
    typeof body.cardholderName === 'string'
      ? body.cardholderName.trim().replace(/\s+/g, ' ')
      : '';
  const cardNumber = typeof body.cardNumber === 'string' ? body.cardNumber : '';
  const expirationDate = typeof body.expirationDate === 'string' ? body.expirationDate : '';
  const cvv = typeof body.cvv === 'string' ? body.cvv : '';
  const amount = typeof body.amount === 'number' ? body.amount : Number.NaN;
  const userId = typeof body.userId === 'string' ? body.userId : '';
  const userEmail = typeof body.userEmail === 'string' ? body.userEmail : '';

  if (!cardholderName || cardholderName.length > 100 || !/^[\p{L}\s]+$/u.test(cardholderName)) {
    errors.cardholderName = 'Ingresa un nombre válido de máximo 100 caracteres.';
  }

  if (!/^\d{16}$/.test(cardNumber)) {
    errors.cardNumber = 'El número de tarjeta debe tener 16 dígitos.';
  }

  if (!/^\d{3}$/.test(cvv)) {
    errors.cvv = 'El CVV debe tener 3 dígitos.';
  }

  if (!isExpirationDateValid(expirationDate)) {
    errors.expirationDate = 'Ingresa una fecha válida y que no esté vencida.';
  }

  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > 100000000 ||
    !Number.isInteger(amount * 100)
  ) {
    errors.amount = 'Ingresa un monto válido mayor a $0.00.';
  }

  if (!isUuid(userId)) {
    errors.userId = 'El UUID del usuario no es válido.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
    errors.userEmail = 'El correo del usuario no es válido.';
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({ errors });
    return;
  }

  const transactionId = crypto.randomUUID();
  const rechargeResponse: RechargeResponse = {
    id: transactionId,
    status: 'approved',
    status_detail: 'accredited',
    transaction_amount: amount,
    date_created: new Date().toISOString(),
    payer_id: userId,
    payer_email: userEmail,
    authorization_code: null,
    reference: 'SNAILPAY-' + transactionId.toUpperCase(),
    card_number: cardNumber,
    cvv,
  };

  res.status(202).json(rechargeResponse);
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
