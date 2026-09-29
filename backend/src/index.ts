import express from 'express';

type RechargeRequestBody = {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  cardholderName: string;
  amount: string;
  userId: string;
  userEmail: string;
};

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'API funcionando' });
});

app.post('/api/recharge', (req, res) => {
  const recharge = req.body as RechargeRequestBody;

  res.status(202).json({
    message: 'Solicitud de recarga recibida.',
    userId: recharge.userId,
    userEmail: recharge.userEmail,
    amount: recharge.amount,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
