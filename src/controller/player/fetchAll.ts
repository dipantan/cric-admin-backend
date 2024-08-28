import { Request, Response } from 'express';
import dbConfig from '../../config/db';

const fetchAll = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit?.toString() || '10';
    const page = req.query.page?.toString() || '1';
    const search = req.query.search?.toString() || '';

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    let baseSql = 'FROM players';

    if (search) {
      baseSql += ` WHERE fullname LIKE '%${search}%' OR firstname LIKE '%${search}%' OR lastname LIKE '%${search}%'`;
    }

    // Count total number of players matching the search criteria
    const countSql = `SELECT COUNT(*) AS total ${baseSql}`;
    const countResult: any = await dbConfig(countSql, []);

    const total = countResult[0]?.total || 0;

    // Fetch the players with limit and offset
    const sql = `SELECT id, firstname, lastname, fullname, image_path, dateofbirth, gender, battingstyle, bowlingstyle, country, position ${baseSql} LIMIT ${limit} OFFSET ${offset}`;

    const players: any = await dbConfig(sql, []);

    const totalPages = Math.ceil(total / parseInt(limit as string));

    const metadata = {
      total,
      totalPages,
      currentPage: parseInt(page as string) || 1,
      limit: parseInt(limit as string),
    };

    const finalPlayers = players.map((player: { country: string; career: string }) => {
      return {
        ...player,
        country: JSON.parse(player.country),
      };
    });

    const response = finalPlayers;

    res.send({
      status: true,
      message: 'Players retrieved successfully',
      data: response,
      metadata,
    });
  } catch (error) {
    res.status(500).send({
      message: 'Internal server error ' + error,
    });
  }
};

export default fetchAll;
