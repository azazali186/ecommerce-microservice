export default {
  instance: {
    instanceId: `${process.env.HOST || 'ecom-recom-service'}:ecom-recom-service:${process.env.PORT || 3199}`,
    app: 'ECOM-RECOM-SERVICE',
    hostName: process.env.HOST || 'ecom-recom-service',
    ipAddr: process.env.HOST || 'ecom-recom-service',
    statusPageUrl: `http://${process.env.HOST || 'ecom-recom-service'}:${process.env.PORT || 3199}/info`,
    healthCheckUrl: `http://${process.env.HOST || 'ecom-recom-service'}:${process.env.PORT || 3199}/health`,
    port: {
      '$': process.env.PORT || 3199,
      '@enabled': 'true',
    },
    vipAddress: 'ecom-recom-service',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
  },
  eureka: {
    host: process.env.EUREKA_HOST || '192.168.30.28',
    port: process.env.EUREKA_PORT || 3145,
    servicePath: '/eureka/apps/'
  },
};
