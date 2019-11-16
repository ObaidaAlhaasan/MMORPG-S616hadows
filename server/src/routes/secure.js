import express from 'express';

import ChatModel from '../models/ChatModel';

const router = express.Router();

router.post('/chat', async (request, response) => {
  if (!request.body || !request.body.message) {
    response.status(400).json({ message: 'invalid body', status: 400 });
  } else {
    const { message } = request.body;
    const { email } = request.user;
    const chat = await ChatModel.create({ email, message });
    response.status(200).json({ chat, message: 'message sent', status: 200 });
  }
});

export default router;
