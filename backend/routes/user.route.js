import { Router } from "express";
import {getUser, getUsers} from "../controllers/user.controller.js"
import autherize from "../middleware/auth.middleware.js";
const userRouter = Router();


userRouter.get("/",getUsers);

userRouter.get("/:id",autherize, getUser);

userRouter.post("/", (req, res) => {
  res.send({ title: "CREATE new User" });
});

userRouter.put("/:id", (req, res) => {
  res.send({ title: "UPDATE a User" });
});

userRouter.delete("/:id", (req, res) => {
  res.send({ title: "DElETE a User" });
});

export default userRouter;