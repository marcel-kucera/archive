import { ObjectId } from "bson";
import express from "express";
import FileType from "file-type";
import { MongoError } from "mongodb";
import { file, gfs } from "../models/models";
import { auth } from "../modules/auth";
import {
  databaseError,
  notFoundError,
  unknownError,
  wrongDatatypeError,
} from "../modules/handlerErrors";
import { getMediaType, NotFoundError } from "../modules/utils";
import { check, CHECKS, LOCATION } from "../modules/validation";

export const imagesRouter = express.Router();

imagesRouter.post(
  "/api/images/upload",
  auth(),
  check([{ name: "file", check: CHECKS.FILE, location: LOCATION.FILES }]),
  async (req, res, next) => {
    //Typescript shenanigans (already validated by check handler)
    let imageFile;
    if (!Array.isArray(req.files.file)) {
      imageFile = req.files.file.data;
    }

    //Get and validate filetype
    let fileType = await FileType.fromBuffer(imageFile);
    if (
      !fileType ||
      (fileType.mime.split("/")[0] != "video" &&
        fileType.mime.split("/")[0] != "image")
    ) {
      next(wrongDatatypeError());
      return;
    }

    //Save image and return imageid
    let writeStream = gfs.openUploadStream("file", {
      metadata: {
        used: false,
        ext: fileType.ext,
        mime: fileType.mime,
      },
    });
    writeStream.on("error", (err) => {
      next(unknownError(err));
    });
    writeStream.on("finish", () => {
      res.send(writeStream.id.toString());
    });
    writeStream.write(imageFile);
    writeStream.end();
  }
);

imagesRouter.get(
  "/api/images/get/:id",
  check([{ name: "id", check: CHECKS.OBJECTID, location: LOCATION.PARAMS }]),
  async (req, res, next) => {
    //Get filetype
    let contentId = req.params.id;
    let type;
    try {
      type = await getMediaType(contentId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        next(notFoundError(`image with id ${contentId}`));
        return;
      } else {
        next(databaseError(error));
        return;
      }
    }
    res.setHeader("Content-Type", type);
    console.log(type);

    //Open file stream
    let stream = gfs.openDownloadStream(new ObjectId(contentId));
    stream.on("error", (err: MongoError) => {
      if (err.code == "ENOENT") {
        next(notFoundError(`image with id ${contentId}`));
      } else {
        next(databaseError(err));
      }
    });

    //file stream as response
    stream.pipe(res);
  }
);

imagesRouter.get("/api/images/deleteExpired", async (req, res, next) => {
  let imagesRes;

  //Find images
  try {
    imagesRes = await file.find({
      uploadDate: {
        //Find images older than 30 minutes
        $lt: new Date(new Date().valueOf() - new Date(0).setMinutes(30)),
      },
      "metadata.used": false,
    });
  } catch (error) {
    next(databaseError(error));
    return;
  }

  //Delete images
  try {
    for (let expired of imagesRes) {
      if (expired._id) {
        gfs.delete(expired._id);
      }
    }
  } catch (error) {
    next(databaseError(error));
    return;
  }

  //Send deleted images
  res.send(imagesRes);
});
