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

export default router;
