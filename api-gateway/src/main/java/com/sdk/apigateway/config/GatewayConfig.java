package com.sdk.apigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route(r -> r.path("/api/auth-service/**")
                        .uri("lb://AUTH-SERVICE/"))
                .route(r -> r.path("/api/master-service/**")
                        .uri("lb://MASTER-SERVICE/"))
                .route(r -> r.path("/api/profile-service/**")
                        .uri("lb://PROFILE-SERVICE/"))
                // You can define more routes in a similar fashion
                .build();
    }
}

