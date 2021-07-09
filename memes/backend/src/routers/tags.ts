import express from "express";
import { databaseError } from "../modules/handlerErrors";
import { post } from "../models/models";

export const tagsRouter = express.Router();

tagsRouter.post("/api/tags/get", (req, res, next) => {
  let isSearching = false;
  if (req.body.search) {
    isSearching = true;
  }

  let pipeline = [];
  if (isSearching) {
    pipeline = [
      { $match: { tags: { $regex: req.body.search } } },
      { $unwind: "$tags" },
      { $match: { tags: { $regex: req.body.search } } },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];
  } else {
    pipeline = [
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ];
  }

  post
    .aggregate(pipeline)
    .then((tagsRes) => res.send(tagsRes))
    .catch((err) => next(databaseError(err)));
});
