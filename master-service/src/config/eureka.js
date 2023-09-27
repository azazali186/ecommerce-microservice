export default {
  instance: {
    instanceId: `${process.env.HOST || '192.168.30.28'}:master-service:${process.env.PORT || 5110}`,
    app: 'MASTER-SERVICE',
    hostName: process.env.HOST || '192.168.30.28',
    ipAddr: process.env.HOST || '192.168.30.28',
    statusPageUrl: `http://${process.env.HOST || '192.168.30.28'}:${process.env.PORT || 5110}/info`,
    healthCheckUrl: `http://${process.env.HOST || '192.168.30.28'}:${process.env.PORT || 5110}/health`,
    port: {
      '$': process.env.PORT || 5110,
      '@enabled': 'true',
    },
    vipAddress: 'master-service',
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
