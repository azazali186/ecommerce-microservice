export default {
  instance: {
    instanceId: `${process.env.HOST || 'ecom-auth-service'}:ecom-auth-service:${process.env.PORT || 3100}`,
    app: 'ECOM-AUTH-SERVICE',
    hostName: process.env.HOST || 'ecom-auth-service',
    ipAddr: process.env.HOST || 'ecom-auth-service',
    statusPageUrl: `http://${process.env.HOST || 'ecom-auth-service'}:${process.env.PORT || 3100}/info`,
    healthCheckUrl: `http://${process.env.HOST || 'ecom-auth-service'}:${process.env.PORT || 3100}/health`,
    port: {
      '$': process.env.PORT || 3100,
      '@enabled': 'true',
    },
    vipAddress: 'ecom-auth-service',
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
