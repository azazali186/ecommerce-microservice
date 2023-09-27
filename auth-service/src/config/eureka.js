export default {
  instance: {
    instanceId: `${process.env.HOST || '192.168.30.28'}:auth-service:${process.env.PORT || 5100}`,
    app: 'AUTH-SERVICE',
    hostName: process.env.HOST || '192.168.30.28',
    ipAddr: process.env.HOST || '192.168.30.28',
    statusPageUrl: `http://${process.env.HOST || '192.168.30.28'}:${process.env.PORT || 5100}/info`,
    healthCheckUrl: `http://${process.env.HOST || '192.168.30.28'}:${process.env.PORT || 5100}/health`,
    port: {
      '$': process.env.PORT || 5100,
      '@enabled': 'true',
    },
    vipAddress: 'auth-service',
    dataCenterInfo: {
      '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
      name: 'MyOwn',
    },
  },
  eureka: {
    host: process.env.EUREKA_HOST || 'localhost',
    port: process.env.EUREKA_PORT || 5145,
    servicePath: '/eureka/apps/'
  },
};
