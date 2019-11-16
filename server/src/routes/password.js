import express from 'express';
import hbs from 'nodemailer-express-handlebars';
import nodemailer from 'nodemailer';
import path from 'path';
import crypto from 'crypto';

import UserModel from '../models/UserModel';

const email = process.env.EMAIL;
const password = process.env.PASSWORD;

const smtpTransport = nodemailer.createTransport({
  service: process.env.EMAIL_PROVIDER,
  auth: {
    user: email,
    pass: password,
  },
});

const handlebarsOptions = {
  viewEngine: {
    extName: '.hbs',
    defaultLayout: null,
    partialsDir: './templates/',
    layoutsDir: './templates/',
  },
  viewPath: path.resolve('./templates/'),
  extName: '.html',
};

smtpTransport.use('compile', hbs(handlebarsOptions));

const router = express.Router();

router.post('/forgot-password', async (request, response) => {
  const userEmail = request.body.email;
  const user = await UserModel.findOne({ email: userEmail });
  if (!user) {
    response.status(400).json({ message: 'invalid email', status: 400 });
    return;
  }

  // create user token
  const buffer = crypto.randomBytes(20);
  const token = buffer.toString('hex');

  // update user reset password token and exp
  await UserModel.findByIdAndUpdate(
    { _id: user._id }, { resetToken: token, resetTokenExp: Date.now() + 600000 },
  );

  // send user password reset email
  const emailOptions = {
    to: userEmail,
    from: email,
    template: 'forgot-password',
    subject: 'Zenva Phaser MMO Password Reset',
    context: {
      name: 'joe',
      url: `http://localhost:${process.env.PORT || 3000}/?token=${token}&scene=resetPassword`,
    },
  };
  await smtpTransport.sendMail(emailOptions);

  response.status(200).json({ message: 'An email has been sent to your email address. Password reset link is only valid for 10 minutes.', status: 200 });
});

router.post('/reset-password', async (request, response) => {
  const userEmail = request.body.email;
  const user = await UserModel.findOne({
    resetToken: request.body.token,
    resetTokenExp: { $gt: Date.now() },
    email: userEmail,
  });

  if (!user) {
    response.status(400).json({ message: 'invalid token', status: 400 });
    return;
  }

  // ensure password was provided, and that the password matches the verified password
  if (!request.body.password || !request.body.verifiedPassword
    || request.body.password !== request.body.verifiedPassword) {
    response.status(400).json({ message: 'passwords do not match', status: 400 });
    return;
  }

  // update user model
  user.password = request.body.password;
  user.resetToken = undefined;
  user.resetTokenExp = undefined;
  await user.save();

  // send user password update email
  const emailOptions = {
    to: userEmail,
    from: email,
    template: 'reset-password',
    subject: 'Zenva Phaser MMO Password Reset Confirmation',
    context: {
      name: user.username,
    },
  };
  await smtpTransport.sendMail(emailOptions);

  response.status(200).json({ message: 'password updated', status: 200 });
});

export default router;
