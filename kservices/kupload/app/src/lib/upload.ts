import axios from "axios";
import { UPLOAD_URL } from "./config";

export function upload(file: File, onProgress: (progressEvent: any) => void, signal: AbortSignal) {
    let data = new FormData()
    data.append("upload", file, file.name)
    return axios.postForm(UPLOAD_URL, data, { withCredentials: true, onUploadProgress: onProgress, signal: signal })
}