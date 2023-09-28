import { Client } from 'elasticsearch'

export const esClient = new Client({
    host: process.env.ES_CLIENT_URL || 'http://localhost:9200', // Adjust based on your Elasticsearch config
    log: 'trace'
})