import { user, userToken } from "../models/models";
import { Document } from "mongoose";
import { MongoError } from "mongodb";
import { NextFunction, Request, Response } from "express";
import { CHECKS, LOCATION, validate } from "./validation";
import {
  databaseError,
  invalidFormError,
  tokenInvalidError,
} from "./handlerErrors";

export class DuplicateUsernameError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

async function createLoginToken(id: string) {
  let token = await userToken.create({ user: id });
  return token.id + ""; //TODO MAKE TOKENS MORE SECURE WITH RANDOM ID
}

export async function login(
  username: string,
  password: string
): Promise<string> {
  let currUser = await user.findOne({ name: username, password: password });
  if (!currUser) {
    return null;
  }
  return await createLoginToken(currUser.id);
}

export async function userFromToken(token: string): Promise<Document<any, {}>> {
  let currUserToken = await userToken.findById(token);
  if (!currUserToken) {
    return null;
  }
  let currUser = await user.findById(currUserToken.get("user"));
  return currUser;
}

export async function register(
  username: string,
  password: string
): Promise<string> {
  try {
    //Mongoose is unreliable creating the unique name index
    if (await user.findOne({ name: username })) {
      throw new DuplicateUsernameError();
    }

    let newUser = await user.create({ name: username, password: password });
    return await createLoginToken(newUser.id);
  } catch (error) {
    if (error instanceof MongoError && error.code == 11000) {
      throw new DuplicateUsernameError();
    } else {
      throw error;
    }
  }
}

export async function logout(token: string): Promise<boolean> {
  if ((await userToken.deleteOne({ _id: token })).n == 1) {
    return true;
  } else {
    return false;
  }
}

export function auth() {
  return async (req: Request, res: Response, next: NextFunction) => {
    //Validate
    let vRes = validate(req, [
      { name: "token", check: CHECKS.OBJECTID, location: LOCATION.COOKIES },
    ]);
    if (!vRes.passed) {
      next(invalidFormError(vRes));
      return;
    }

    //Get user from token
    try {
      let currUser = await userFromToken(req.cookies.token);
      if (!currUser) {
        next(tokenInvalidError());
      } else {
        req.user = currUser;
        next();
      }
    } catch (error) {
      next(databaseError(error));
    }
  };
}
