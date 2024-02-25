import { Router } from "express";
import dayjs from "dayjs";
import UserService from "../lib/services/user";

const summaryRouter = Router();

summaryRouter.get("/", async (req, res) => {
  const { date } = req.query;

  const searchDate = date
    ? dayjs(date as string).format("YYYY-MM-DD")
    : dayjs().format("YYYY-MM-DD");

  const users = await UserService.getAllUsers();

  const summaryData = await Promise.all(
    users.map(async (user) => {
      const summary = await UserService.getSummary(user.email, searchDate);
      return summary;
    })
  );

  res.status(200).json(summaryData);
});

summaryRouter.get("/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const user = await UserService.getUserByEmail(email);
  res.status(200).json(user);
});

export default summaryRouter;
