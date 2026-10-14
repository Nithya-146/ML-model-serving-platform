# Build Stage
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S modeldock && adduser -S modeldock -G modeldock
USER modeldock:modeldock

COPY --from=builder /app/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=docker
EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
