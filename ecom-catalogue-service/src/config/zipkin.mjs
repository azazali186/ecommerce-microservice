
import { Tracer, BatchRecorder, jsonEncoder } from 'zipkin';
import CLSContext from 'zipkin-context-cls';
import { HttpLogger } from 'zipkin-transport-http';
import { expressMiddleware } from 'zipkin-instrumentation-express';



// Initialize Zipkin components
const ctxImpl = new CLSContext('zipkin'); // or use `new ExplicitContext()` if you don't want CLS
const localServiceName = 'catalogue-service'; // name of this service
const recorder = new BatchRecorder({
  logger: new HttpLogger({
    endpoint: 'http://192.168.30.28:3192/api/v2/spans', // Zipkin server URL
    jsonEncoder: jsonEncoder.JSON_V2
  })
});

const tracer = new Tracer({ ctxImpl, recorder, localServiceName });

export const zipkinMiddleware = expressMiddleware({ tracer, port: process.env.PORT || 3130 })