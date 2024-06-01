import express from 'express';
const router = express.Router();

router.get('/generate', async (_req, res) => {
  res.status(200);
});

export default router;
