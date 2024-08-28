import { Request, Response } from 'express';
import dbConfig from '../../config/db';

const createRecommendedPlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    if (!id)
      return res.status(400).send({
        status: false,
        message: 'Id is required',
      });

    const ids = await dbConfig(`SELECT id FROM players WHERE id = ?`, [id]);

    if (ids.constructor === Array && ids.length === 0)
      return res.status(400).send({
        status: false,
        message: 'Id does not exist',
      });

    const result = await dbConfig(`INSERT INTO recommended_players (player_id) VALUES (?)`, [id]);

    res.status(201).send({
      status: true,
      message: 'Recommended player created successfully',
    });
  } catch (error) {
    res.status(500).send({
      message: 'Internal server error ' + error,
    });
  }
};

export default createRecommendedPlayer;
