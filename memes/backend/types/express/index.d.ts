import { Document } from "mongoose";

import express = require("express");

declare global {
  namespace Express {
    interface Request {
      user?: Document<any, {}>;
    }
  }
}
