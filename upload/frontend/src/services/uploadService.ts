import axios, { AxiosRequestConfig } from "axios";
import { uploadUrl } from "../config/api";

export function upload(file: File, options?: AxiosRequestConfig<FormData>) {
  let data = new FormData();
  data.append("upload", file);

  let config = {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    ...options,
  };

  return axios.post(uploadUrl, data, config);
}
