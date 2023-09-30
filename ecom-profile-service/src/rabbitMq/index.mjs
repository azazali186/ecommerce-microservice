import { listenForProfileRequest } from "./listenForProfileCreate.mjs"

export const rabbitMQListener = () =>{
    listenForProfileRequest()
}