export default {
  instance: {
    instanceId: `${process.env.HOST || '192.168.30.28'}:ecom-profile-service:${process.env.PORT || 3120}`,
    app: 'ECOM-PROFILE-SERVICE',
    hostName: process.env.HOST || '192.168.30.28',
    ipAddr: process.env.HOST || '192.168.30.28',
    statusPageUrl: `http://${process.env.HOST || '192.168.30.28'}:${process.env.PORT || 3120}/info`,
    healthCheckUrl: `http://${process.env.HOST || '192.168.30.28'}:${process.env.PORT || 3120}/health`,
    port: {
      '$': process.env.PORT || 3120,
      '@enabled': 'true',
    },
    vipAddress: 'ecom-profile-service',
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
