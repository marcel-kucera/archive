import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, urlencoded, Request, Response } from "express";
import fileUpload from "express-fileupload";
import { MongoError } from "mongodb";
import mongoose from "mongoose";
import morgan from "morgan";
import { initGFS, post, user } from "./models/models";
import { HandlerError as HandlerError } from "./modules/handlerErrors";
import { imagesRouter } from "./routers/images";
import { postsRouter } from "./routers/posts";
import { tagsRouter } from "./routers/tags";
import { usersRouter } from "./routers/users";

const app = express();

//Middleware
app.use(express.json({ type: ["text/plain", "application/json"] }));
app.use(urlencoded({ extended: false }));
app.use(cors({ origin: "*" }));
app.use(fileUpload({ limits: { fileSize: 50000 * 1024 * 1024 } }));
app.use(cookieParser());
app.use(morgan("dev"));

//Routers
app.use(postsRouter);
app.use(tagsRouter);
app.use(usersRouter);
app.use(imagesRouter);

app.get("/test", (req, res, next) => {
  res.send(new Error());
});

//Error handling middleware
app.use(function (
  err: HandlerError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err.error) {
    console.error(err.error);
    delete err.error; //Remove error data from response
  }
  res.status(err.status).send(err.message);
});

//Connect to Database and start server
mongoose
  .connect("mongodb://localhost/memes", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    //Reset Database
    await mongoose.connection.db.dropDatabase();
    //Start server on database connection
    initGFS();
    app.listen(3001, () => {
      console.log("Starting api server");
    });
  });
