# Stage 1: Build with Maven
FROM maven:3-amazoncorretto-21-al2023 AS build
WORKDIR /app
COPY . .
COPY ./pom.xml ./
RUN mvn dependency:go-offline

RUN mvn package -DskipTests

# Stage 2: Use OpenJDK 20 to run the application
FROM openjdk:21

LABEL maintainer="ajaz.ali186@gmail.com" version="1.0" description="Ecommerce Microservice API Gateway"

VOLUME /tmp

# Copy the built JAR from the first stage
COPY --from=build /app/target/*.jar app.jar

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app.jar"]
