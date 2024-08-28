import { Request, Response } from 'express';
import dbConfig from '../../config/db';

const createTopPlayers = async (req: Request, res: Response) => {
  const types = ['batsman', 'wicketkeeper', 'bowler', 'allrounder'];
  try {
    const { id, type } = req.body;
    if (!id || !type) {
      return res.status(400).send({
        status: false,
        message: 'Id and type is required',
      });
    }

    const ids = await dbConfig(`SELECT id FROM players WHERE id = ?`, [id]);
    if (ids.constructor === Array && ids.length === 0) {
      return res.status(400).send({
        status: false,
        message: 'Id does not exist',
      });
    }

    if (!types.includes(type)) {
      return res.status(400).send({
        status: false,
        message: 'Invalid type',
      });
    }

    const result = await dbConfig(`INSERT INTO top_players (player_id, type) VALUES (?, ?)`, [
      id,
      type,
    ]);

    res.status(201).send({
      status: true,
      message: 'Top player created successfully',
    });
  } catch (error) {
    res.status(500).send({
      message: 'Internal server error ' + error,
    });
  }
};

export default createTopPlayers;
