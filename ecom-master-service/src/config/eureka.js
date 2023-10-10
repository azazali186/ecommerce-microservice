export default {
  instance: {
    instanceId: `${process.env.HOST || 'ecom-master-service'}:ecom-master-service:${process.env.PORT || 3110}`,
    app: 'ECOM-MASTER-SERVICE',
    hostName: process.env.HOST || 'ecom-master-service',
    ipAddr: process.env.HOST || 'ecom-master-service',
    statusPageUrl: `http://${process.env.HOST || 'ecom-master-service'}:${process.env.PORT || 3110}/info`,
    healthCheckUrl: `http://${process.env.HOST || 'ecom-master-service'}:${process.env.PORT || 3110}/health`,
    port: {
      '$': process.env.PORT || 3110,
      '@enabled': 'true',
    },
    vipAddress: 'ecom-master-service',
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
