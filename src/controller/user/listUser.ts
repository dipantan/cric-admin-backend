import { Request, Response } from 'express';
import dbConfig from '../../config/db';

const listUser = async (req: Request, res: Response) => {
  try {
    const users = await dbConfig('SELECT * FROM user WHERE admin = ?', [false]);
    res.send({
      status: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    res.status(500).send({
      message: 'Internal server error ' + error,
    });
  }
};

export default listUser;
