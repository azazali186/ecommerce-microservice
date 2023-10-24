import { Client } from '@elastic/elasticsearch'

export const esClient = new Client({
    node: process.env.ES_CLIENT_URL || 'http://192.168.30.28:9200', // Adjust based on your Elasticsearch config
    log: 'trace'
})