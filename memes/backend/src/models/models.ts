import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";

const userScheme = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  password: { type: String, required: false },
});

const userTokenScheme = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
});

const postScheme = new mongoose.Schema({
  title: { type: String, required: true },
  tags: { type: Array, required: true },
  user: { type: mongoose.Types.ObjectId, required: true, ref: "user" },
  image: { type: mongoose.Types.ObjectId, required: true },
  type: { type: String, enum: ["image", "video"], required: true },
});

//Representing gridfs metadata
const fileScheme = new mongoose.Schema({
  metadata: {
    used: { type: Boolean, required: true },
    ext: { type: String, required: true },
    mime: { type: String, required: true },
  },
});

export const user = mongoose.model("user", userScheme);
export const userToken = mongoose.model("userToken", userTokenScheme);
export const post = mongoose.model("post", postScheme);
export const file = mongoose.model("fs.files", fileScheme);

export let gfs: GridFSBucket = undefined;

export function initGFS() {
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db);
}
