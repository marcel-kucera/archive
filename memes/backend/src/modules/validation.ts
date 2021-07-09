import { NextFunction, Request, Response } from "express";
import validator from "validator";
import { invalidFormError } from "./handlerErrors";

export interface Field {
  name: string;
  check: CHECKS;
  location?: LOCATION;
}

export enum LOCATION { //TODO add cookies
  BODY,
  PARAMS,
  FILES,
  COOKIES,
}

export enum CHECKS {
  ASCII,
  ASCIIARRAY,
  OBJECTID,
  FILE,
}

export interface ValidationResult {
  passed: boolean;
  field?: string;
  reason?: INVALIDREASON;
}

export enum INVALIDREASON {
  MISSING = "is missing",
  WRONGTYPE = "has wrong datatype",
}

function failBuilder(field: string, reason: INVALIDREASON): ValidationResult {
  return { passed: false, field: field, reason: reason };
}

export function validate(req: Request, schema: Field[]): ValidationResult {
  for (let field of schema) {
    //Select location
    let value;
    switch (field.location) {
      case LOCATION.FILES: {
        value = req.files[field.name];
        break;
      }
      case LOCATION.PARAMS: {
        value = req.params[field.name];
        break;
      }
      case LOCATION.COOKIES: {
        value = req.cookies[field.name];
        break;
      }
      case LOCATION.BODY: {
        value = req.body[field.name];
        break;
      }
      default: {
        value = req.body[field.name];
        break;
      }
    }

    //Does value exist
    if (!value) {
      return failBuilder(field.name, INVALIDREASON.MISSING);
    }

    //Quick fail function
    let fail = () => {
      return failBuilder(field.name, INVALIDREASON.WRONGTYPE);
    };

    //Perform checks
    switch (field.check) {
      case CHECKS.ASCII: {
        if (!validator.isAscii(value + "")) {
          return fail(); //Not ascii
        }
        break;
      }
      case CHECKS.FILE: {
        if (Array.isArray(value)) {
          return failBuilder(field.name, INVALIDREASON.WRONGTYPE);
        }
        break;
      }
      case CHECKS.ASCIIARRAY: {
        if (Array.isArray(value)) {
          for (let arrayValue of value) {
            if (!validator.isAscii(arrayValue)) {
              return fail(); //Not ascii in array
            }
          }
        } else {
          return fail(); //Not an array
        }
        break;
      }
      case CHECKS.OBJECTID: {
        if (!validator.isMongoId(value + "")) {
          return fail(); //Not a mongoid
        }
      }
    }
  }
  return { passed: true };
}

//Check handler builder
export function check(schema: Field[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    let vRes = validate(req, schema);
    if (!vRes.passed) {
      next(invalidFormError(vRes));
    } else {
      next();
    }
  };
}
