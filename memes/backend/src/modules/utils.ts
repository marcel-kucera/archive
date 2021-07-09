import { file } from "../models/models";

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(resource);
  }
}

export async function tagImageAsUsed(id: string) {
  let result = await file.updateOne({ _id: id }, { "metadata.used": true });
  if (result.nModified == 0) {
    throw new NotFoundError(`image with id ${id}`);
  }
}

export async function getMediaType(id: string): Promise<string> {
  let media = await file.findById(id);
  if (media) {
    return media.get("metadata.mime");
  } else {
    throw new NotFoundError(`image with id ${id}`);
  }
}
