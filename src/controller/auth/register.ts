import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import dbConfig from '../../config/db';

const register = async (req: Request, res: Response) => {
  try {
    const { email, pass } = req.body;

    const hashedPassword = await bcrypt.hash(pass, 10);

    const user = [email, hashedPassword, true];

    await dbConfig('INSERT INTO user SET email = ?, pass = ?, admin = ?', user);

    res.status(201).send({
      status: true,
      message: 'User created successfully',
    });
  } catch (error) {
    res.status(500).send({
      message: 'Internal server error ' + error,
    });
  }
};

export default register;
