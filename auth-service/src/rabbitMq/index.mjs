import { listenForPermissions } from './listenForPermissions.mjs'
import { listenForAuthRequests } from './listenForAuthRequests.mjs'

export const rabbitMQListener = () => {
    listenForPermissions();
    listenForAuthRequests()
}