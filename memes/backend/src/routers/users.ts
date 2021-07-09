import express from "express";
import { user } from "../models/models";
import {
  auth,
  DuplicateUsernameError,
  login,
  logout,
  register,
} from "../modules/auth";
import {
  databaseError,
  duplicateUsernameError,
  notFoundError,
  userAuthError,
} from "../modules/handlerErrors";
import { check, CHECKS, LOCATION } from "../modules/validation";

export const usersRouter = express.Router();

usersRouter.post(
  "/api/users/register",
  check([
    { name: "user", check: CHECKS.ASCII },
    { name: "password", check: CHECKS.ASCII },
  ]),
  (req, res, next) => {
    register(req.body.user, req.body.password)
      .then((token) => {
        res.cookie("token", token, { httpOnly: true }).send("ok");
      })
      .catch((err) => {
        if (err instanceof DuplicateUsernameError) {
          next(duplicateUsernameError());
        } else {
          next(databaseError(err));
        }
      });
  }
);

usersRouter.post(
  "/api/users/login",
  check([
    { name: "user", check: CHECKS.ASCII },
    { name: "password", check: CHECKS.ASCII },
  ]),
  async (req, res, next) => {
    login(req.body.user, req.body.password)
      .then((token) => {
        if (token) {
          res.cookie("token", token, { httpOnly: true }).send("ok");
        } else {
          next(userAuthError());
        }
      })
      .catch((err) => next(databaseError(err)));
  }
);

usersRouter.get(
  "/api/users/logout",
  check([
    { name: "token", check: CHECKS.OBJECTID, location: LOCATION.COOKIES },
  ]),
  async (req, res, next) => {
    try {
      if (await logout(req.cookies.token)) {
        res.send("ok");
      } else {
        next(notFoundError("token"));
      }
    } catch (error) {
      next(databaseError(error));
    }
  }
);

usersRouter.get("/api/users/get", (req, res, next) => {
  user
    .find({})
    .then((usersRes) => res.send(usersRes))
    .catch((err) => next(databaseError(err)));
});

usersRouter.get("/api/users/me", auth(), (req, res, next) => {
  res.send(req.user);
});
