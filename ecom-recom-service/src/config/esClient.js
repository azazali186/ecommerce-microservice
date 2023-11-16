import { Client } from "@elastic/elasticsearch";
import { HttpConnection } from "@elastic/transport";
import http from "http";

const agent = new http.Agent({ keepAlive: true });

export const esClient = new Client({
  Connection: HttpConnection,
  node: process.env.ES_CLIENT_URL || "http://192.168.30.28:9200", // Adjust based on your Elasticsearch config
  auth: {
    apiKey: "dTBkajE0c0IwM0RrOWRhempLSWM6UmhQTGhBWEJSN2U5YlV5Zi11WlZYZw=="
  },
  log: "trace",
  maxRetries: 5,
  agent: {
    https: agent,
    http: agent,
  },
});
