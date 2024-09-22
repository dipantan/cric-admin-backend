import { Router } from "express";
import listUser from "./listUser";
import authenticateToken from "../../middleware/authenticateToken";
import dbConfig from "../../config/db";
import { WithdrawalRequestDto } from "./dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { ErrorResponse } from "../../utils";
import { ResultSetHeader } from "mysql2";

const router = Router();

router.get("/", authenticateToken, listUser);

router.get("/withdrawal", authenticateToken, async (req, res) => {
  try {
    const row = await dbConfig(`select * from withdrawal_requests`, []);
    res.send({
      status: true,
      message: "Withdrawal requests retrieved successfully",
      data: row,
    });
  } catch (error) {}
});

router.put("/withdrawal", authenticateToken, async (req, res) => {
  try {
    const withdrawal_requestsDto = plainToInstance(
      WithdrawalRequestDto,
      req.body
    );
    const error = await validate(withdrawal_requestsDto);
    if (error.length > 0) {
      const err: any = error.map((err: any) => {
        return Object.values(err.constraints)[0];
      });
      return res.status(400).send(ErrorResponse(err, 400));
    }

    // Check if withdrawal request exists
    const row = await dbConfig(
      `select * from withdrawal_requests where id = ? and status = ?`,
      [withdrawal_requestsDto.id, "pending"]
    );

    if (row.constructor === Array) {
      if (row.length === 0) {
        return res
          .status(400)
          .send(ErrorResponse("Withdrawal request not found", 400));
      } else {
        const result = (await dbConfig(
          `update withdrawal_requests set status = ? where id = ? and status = ?`,
          [withdrawal_requestsDto.status, withdrawal_requestsDto.id, "pending"]
        )) as ResultSetHeader;

        if (result.affectedRows === 0) {
          return res
            .status(400)
            .send(ErrorResponse("Withdrawal request not found", 400));
        }

        if (withdrawal_requestsDto.status === "approved") {
          const data: any = row[0];

          // Update user balance
          await dbConfig(`update user set wallet = wallet + ? where id = ?`, [
            data?.amount,
            data?.user_id,
          ]);

          // insert transaction
          await dbConfig(
            `insert into transaction (user_id, amount, type, message, date) values (?, ?, ?, ?, ?)`,
            [
              data?.user_id,
              data?.amount,
              "credit",
              `Withdrawal request ${withdrawal_requestsDto.status}`,
              new Date().toISOString(),
            ]
          );
        }

        res.send({
          status: true,
          message: "Withdrawal request updated successfully",
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(ErrorResponse("Internal server error", 500));
  }
});

router.get("/transaction", authenticateToken, async (req, res) => {
  try {
    const row = await dbConfig(`select * from transaction`);
    res.send({
      status: true,
      message: "Transaction retrieved successfully",
      data: row,
    });
  } catch (error) {
    res.status(500).send(ErrorResponse("Internal server error", 500));
  }
});

router.get("/order", authenticateToken, async (req, res) => {
  try {
    const row = await dbConfig(`select * from orders`);
    res.send({
      status: true,
      message: "Orders retrieved successfully",
      data: row,
    });
  } catch (error) {
    res.status(500).send(ErrorResponse("Internal server error", 500));
  }
});

export default router;
