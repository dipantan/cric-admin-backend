import { Request, Response } from 'express';
import dbConfig from '../../config/db';

const fetchRecommendedPlayer = async (req: Request, res: Response) => {
  try {
    const data = await dbConfig(
      `select p.id, p.firstname, p.lastname, p.fullname, p.image_path, p.dateofbirth, p.gender, p.battingstyle, p.bowlingstyle, p.country, p.position from recommended_players rp join players p on rp.player_id = p.id`
    );

    res.send({
      status: true,
      message: 'Recommended players retrieved successfully',
      data,
    });
  } catch (error) {
    res.status(500).send({
      message: 'Internal server error ' + error,
    });
  }
};

export default fetchRecommendedPlayer;