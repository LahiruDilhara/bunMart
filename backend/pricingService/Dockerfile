# pricingService — multi-stage: glibc-based builder (for protoc-gen-grpc-java), Alpine runtime
FROM gradle:9.3.1-jdk25 AS builder
WORKDIR /app
COPY proto /app/proto
COPY pricingService /app/pricingService
RUN cd /app/proto && gradle publishToMavenLocal --no-daemon && \
    cd /app/pricingService && gradle bootJar --no-daemon

FROM eclipse-temurin:25-jre-alpine
RUN adduser -D -s /bin/sh app
WORKDIR /app
COPY --from=builder /app/pricingService/build/libs/*.jar app.jar
USER app
EXPOSE 6007
ENTRYPOINT ["java", "-jar", "app.jar"]
