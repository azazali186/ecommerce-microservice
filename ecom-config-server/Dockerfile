# Stage 1: Build with Maven
FROM maven:3.9-amazoncorretto-20-al2023 AS build
WORKDIR /workspace/app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN mvn dependency:go-offline

COPY src src
RUN mvn package -DskipTests

# Stage 2: Use OpenJDK 17 to run the application
FROM openjdk:20-jdk-slim

LABEL maintainer="ajaz.ali186@gmail.com" version="1.0" description="Ecommerce Microservice API Gateway"

VOLUME /tmp

# Copy the built JAR from the first stage
COPY --from=build /workspace/app/target/*.jar app.jar

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app.jar"]
