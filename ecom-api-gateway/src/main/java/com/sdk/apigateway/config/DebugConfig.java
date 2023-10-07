package com.sdk.apigateway.config;

import org.springframework.boot.actuate.autoconfigure.endpoint.condition.ConditionalOnAvailableEndpoint;
import org.springframework.boot.actuate.metrics.export.prometheus.PrometheusScrapeEndpoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DebugConfig {
    @Bean
    @ConditionalOnAvailableEndpoint
    public PrometheusScrapeEndpoint prometheusScrapeEndpoint() {
        return new PrometheusScrapeEndpoint();
    }
}
