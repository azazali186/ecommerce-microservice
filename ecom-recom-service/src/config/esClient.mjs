import { Client } from "@elastic/elasticsearch";
import { HttpConnection } from "@elastic/transport";
import http from "http";
import fs from 'fs';


const agent = new http.Agent({ keepAlive: true });

export const esClient = new Client({
  node: process.env.ES_CLIENT_URL || "https://127.0.0.1:9200",
  auth: {
    apiKey: process.env.ELK_LOCAL_TOKEN || "X3B0NTY0c0JNWFdQZklnZjVFeHY6eGY0aklPMERSZm1IV2hkUU1xWl9IUQ==",
  },
  // caFingerprint: "47840e58e7dfe57f154e3c0bd2b70ffe5794e9a5d49b520ea27dd1db610cb2b7",
  tls: {
    ca: fs.readFileSync('/Users/janny/Study/ecommerce-microservice/ecom-recom-service/src/config/http_ca.crt'),
    rejectUnauthorized: false
  },
  log: "info",
  maxRetries: 5,
  requestTimeout: 60000, // 60 seconds
});
