import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'API funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});