export default {
  instance: {
    instanceId: `${process.env.HOST || '192.168.30.28'}:ecom-catalogue-service:${process.env.PORT || 3130}`,
    app: 'ECOM-CATALOGUE-SERVICE',
    hostName: process.env.HOST || '192.168.30.28',
    ipAddr: process.env.HOST || '192.168.30.28',
    statusPageUrl: `http://${process.env.HOST || '192.168.30.28'}:${process.env.PORT || 3130}/info`,
    healthCheckUrl: `http://${process.env.HOST || '192.168.30.28'}:${process.env.PORT || 3130}/health`,
    port: {
      '$': process.env.PORT || 3130,
      '@enabled': 'true',
    },
    vipAddress: 'ecom-catalogue-service',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
  },
  eureka: {
    host: process.env.EUREKA_HOST || 'localhost',
    port: process.env.EUREKA_PORT || 3145,
    servicePath: '/eureka/apps/'
  },
};
