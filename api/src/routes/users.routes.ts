import { Router } from "express";
import UserService from "../lib/services/user";

const usersRouter = Router();

usersRouter.get("/", async (_req, res) => {
  const users = await UserService.getAllUsers();
  res.status(200).json(users);
});

usersRouter.get("/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const user = await UserService.getUserByEmail(email);
  res.status(200).json(user);
});

usersRouter.delete("/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email);
  const user = await UserService.delete(email);
  res.status(200).json(user);
});

usersRouter.post("/", async (req, res) => {
  const { email, data } = req.body;
  const user = await UserService.create(email, data);
  res.status(201).json(user);
});

export default usersRouter;
