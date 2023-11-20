import { listenForCatalogRequest } from './listenForCatalogRequest.mjs'
import { listenForProductStockRequest } from './listenForProductStockRequest.mjs'

export const rabbitMQListener = () => {
    listenForCatalogRequest();
    listenForProductStockRequest()
}