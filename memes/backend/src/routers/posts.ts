import express from "express";
import { user, post, file } from "../models/models";
import { check, CHECKS } from "../modules/validation";
import { databaseError, notFoundError } from "../modules/handlerErrors";
import { getMediaType, NotFoundError, tagImageAsUsed } from "../modules/utils";
import { auth } from "../modules/auth";

export const postsRouter = express.Router();

postsRouter.post("/api/posts/get", (req, res, next) => {
  //Is searching
  let isSearching = false;
  if (req.body.search && Array.isArray(req.body.search)) {
    isSearching = true;
  }

  //Get posts
  let params = {};
  if (isSearching) {
    params = { tags: { $all: req.body.search } };
  }

  post
    .find(params)
    .populate("user", "name")
    .exec()
    .then((postsRes) => res.send(postsRes))
    .catch((err) => next(databaseError(err)));
});

postsRouter.post(
  "/api/posts/create",
  auth(),
  check([
    { name: "title", check: CHECKS.ASCII },
    { name: "tags", check: CHECKS.ASCIIARRAY },
    { name: "imageId", check: CHECKS.OBJECTID },
  ]),
  async (req, res, next) => {
    //Replace spaces in tags with _
    for (let i = 0; i < req.body.tags.length; i++) {
      req.body.tags[i] = req.body.tags[i].replaceAll(" ", "_");
    }

    //Mark image as used and get type
    let imageId = req.body.imageId;
    let type;
    try {
      await tagImageAsUsed(imageId);
      type = (await getMediaType(imageId)).split("/")[0];
    } catch (error) {
      if (error instanceof NotFoundError) {
        next(notFoundError(`image with id ${imageId}`));
        return;
      } else {
        next(databaseError(error));
        return;
      }
    }

    //Insert post
    post
      .create({
        title: req.body.title,
        tags: req.body.tags,
        user: req.user.id,
        image: imageId,
        type: type,
      })
      .then(() => res.send("ok"))
      .catch((err) => next(databaseError(err)));
  }
);
