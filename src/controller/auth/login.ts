import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import dbConfig from '../../config/db';

const login = async (req: Request, res: Response) => {
  try {
    const { email, pass } = req.body;
    const users = await dbConfig('SELECT * FROM user');

    if (users.constructor === Array) {
      const user: any = users?.find((user: any) => user.email === email);

      if (!user) return res.status(400).send('User not found');

      const isValidPassword = await bcrypt.compare(pass, user.pass);
      if (!isValidPassword)
        return res.status(403).send({
          status: false,
          message: 'Invalid password',
        });

      const secret = process.env.JWT_SECRET as string;

      const accessToken = jwt.sign({ email: user.email }, secret, {
        expiresIn: '7d',
        audience: 'http://localhost:3000',
      });

      res.json({ status: true, message: 'User logged in successfully', data: { accessToken } });
    }
  } catch (error) {
    res.status(500).send({
      message: 'Internal server error ' + error,
    });
  }
};

export default login;
