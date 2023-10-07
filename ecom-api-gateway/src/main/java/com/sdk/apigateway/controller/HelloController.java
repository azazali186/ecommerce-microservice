package com.sdk.apigateway.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.micrometer.core.annotation.Timed;

@RestController
@RequestMapping("")
@Timed
public class HelloController {

    @GetMapping(value = "/", produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed("api")
    public String registerHandler() {
        return "Hello World";
    }
    
}
