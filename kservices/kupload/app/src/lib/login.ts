import axios, { type AxiosResponse } from "axios";
import { LOGIN_URL, USERDATA_URL } from "./config";

export function login(name: string, password: string) {
    return axios.post(LOGIN_URL, {
        name: name,
        password: password
    }, { withCredentials: true })
}

type UserData = {
    id: string
    name: string
    admin: boolean
}

export function getUserData(): Promise<AxiosResponse<UserData, any>> {
    return axios.get(USERDATA_URL, { withCredentials: true })
}