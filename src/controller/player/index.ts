import { Router } from "express";
import authenticateToken from "../../middleware/authenticateToken";
import fetchAll from "./fetchAll";
import createRecommendedPlayer from "./createRecommendedPlayer";
import createTopPlayers from "./createTopPlayers";
import fetchRecommendedPlayer from "./fetchRecommendedPlayer";
import fetchTopPlayers from "./fetchTopPlayers";
import dbConfig from "../../config/db";
import { ResultSetHeader } from "mysql2";
import { ErrorResponse } from "../../utils";

const router = Router();

router.get("/", authenticateToken, fetchAll);
router.post(
  "/create-recommended-players",
  authenticateToken,
  createRecommendedPlayer
);
router.post("/create-top-players", authenticateToken, createTopPlayers);
router.get(
  "/fetch-recommended-players",
  authenticateToken,
  fetchRecommendedPlayer
);
router.get("/fetch-top-players", authenticateToken, fetchTopPlayers);

router.delete(
  "/delete-recommended-players/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const request = await dbConfig(
        `DELETE FROM recommended_players WHERE player_id = ?`,
        [id]
      );
      const result = request as ResultSetHeader;

      if (result.affectedRows === 0) {
        return res.status(400).send({
          status: false,
          message: "Player not found",
        });
      }
      res.send({
        status: true,
        message: "Player deleted successfully",
      });
    } catch (error) {
      res.status(500).send({
        message: "Internal server error " + error,
      });
    }
  }
);

router.delete(
  "/delete-top-players/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const request = await dbConfig(
        `DELETE FROM top_players WHERE player_id = ?`,
        [id]
      );
      const result = request as ResultSetHeader;

      if (result.affectedRows === 0) {
        return res.status(400).send({
          status: false,
          message: "Player not found",
        });
      }
      res.send({
        status: true,
        message: "Player deleted successfully",
      });
    } catch (error) {
      res.status(500).send({
        message: "Internal server error " + error,
      });
    }
  }
);

router.put("/price/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const sql = `update prices set curr_price = ? where player_id = ?`;
    const query = await dbConfig(sql, [amount, id]);

    const result = query as ResultSetHeader;

    if (result.affectedRows === 0) {
      return res.status(400).send({
        status: false,
        message: "Player not found",
      });
    }
    res.send({
      status: true,
      message: "Player price updated successfully",
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Internal server error",
    });
  }
});

router.get("/price/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `select * from prices where player_id = ?`;
    const query = await dbConfig(sql, [id]);

    if (query.constructor === Array) {
      if (query.length === 0) {
        return res.status(400).send({
          status: false,
          message: "Player not found",
        });
      } else {
        res.send({
          status: true,
          message: "Player price retrieved successfully",
          data: query[0],
        });
      }
    }
  } catch (error) {
    res.status(500).send(ErrorResponse("Internal server error", 500));
  }
});

router.get("/sections", async (req, res) => {
  try {
    const data: Record<string, any[]> = {};
    const types = ["Batsman", "Wicketkeeper", "Bowler", "Allrounder"];

    // Use a for loop or Promise.all for handling async operations
    for (const type of types) {
      const sql = `SELECT id, fullname, image_path, JSON_EXTRACT(country, '$.name') AS country_name, JSON_EXTRACT(country, '$.image_path') AS country_image FROM players WHERE JSON_EXTRACT(position, '$.name') = ?`;
      const query = await dbConfig(sql, [type]); // Use parameterized queries for safety

      // Ensure `data[type]` exists as an array
      if (!data[type]) {
        data[type] = [];
      }

      // Add results to the corresponding type
      if (Array.isArray(query)) {
        data[type].push(...query);
      }
    }

    res.send({
      status: true,
      message: "Players retrieved successfully",
      data,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send(ErrorResponse("Internal server error", 500));
  }
});

router.get("/sections/all", async (req, res) => {
  try {
    const sql = `select sections.player_id, players.fullname, players.image_path, JSON_EXTRACT(players.position, '$.name') AS position_name, JSON_EXTRACT(players.country, '$.name') AS country_name, JSON_EXTRACT(players.country, '$.image_path') AS country_image from sections inner join players on sections.player_id = players.id`;
    const query = await dbConfig(sql);

    if (query.constructor === Array) {
      if (query.length === 0) {
        return res.status(400).send({
          status: false,
          message: "Players not found",
        });
      } else {
        res.send({
          status: true,
          message: "Players retrieved successfully",
          data: query,
        });
      }
    }
  } catch (error) {
    res.status(500).send(ErrorResponse("Internal server error", 500));
  }
});

router.post("/sections", async (req, res) => {
  try {
    const id = req.body.id;

    const numericId = Number(id);
    if (isNaN(numericId) || !numericId) {
      return res.status(400).send({
        status: false,
        message: "Id is required",
      });
    }

    const ids = await dbConfig(`SELECT id FROM players WHERE id = ?`, [id]);

    if (ids.constructor === Array && ids.length === 0) {
      return res.status(400).send({
        status: false,
        message: "Id does not exist",
      });
    }

    const sql = `insert into cricexchange.sections (player_id) values (?)`;

    const query = (await dbConfig(sql, [id])) as ResultSetHeader;

    if (query.affectedRows === 0) {
      return res.status(400).send({
        status: false,
        message: "Player not found",
      });
    }

    res.send({
      status: true,
      message: "Player added successfully",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).send({
        status: false,
        message: "Player already exists",
      });
    }

    res.status(500).send({
      status: false,
      message: "Internal server error",
    });
  }
});

router.delete("/sections/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const numericId = Number(id);
    if (isNaN(numericId) || !numericId) {
      return res.status(400).send({
        status: false,
        message: "Id is required",
      });
    }

    const ids = await dbConfig(`SELECT id FROM players WHERE id = ?`, [id]);

    if (ids.constructor === Array && ids.length === 0) {
      return res.status(400).send({
        status: false,
        message: "Id does not exist",
      });
    }

    const sql = `delete from cricexchange.sections where player_id = ?`;

    const query = (await dbConfig(sql, [id])) as ResultSetHeader;

    if (query.affectedRows === 0) {
      return res.status(400).send({
        status: false,
        message: "Player not found",
      });
    }

    res.send({
      status: true,
      message: "Player removed successfully",
    });
  } catch (error) {
    res.status(500).send({
      status: false,
      message: "Internal server error",
    });
  }
});

export default router;
