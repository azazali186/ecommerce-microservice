import { listnerForProductES } from "./listnerForProductES.mjs"


export const rabbitMQListener = () => {
    listnerForProductES()
    console.log("================================listnerForProductES===============================")
}