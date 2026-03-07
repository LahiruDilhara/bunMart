# shippingService — multi-stage, Alpine runtime (Gradle image avoids network download)
FROM gradle:9.3.1-jdk25-alpine AS builder
RUN apk add --no-cache bash
WORKDIR /app
COPY proto /app/proto
COPY shippingService /app/shippingService
RUN cd /app/proto && gradle publishToMavenLocal --no-daemon && \
    cd /app/shippingService && gradle bootJar --no-daemon

FROM eclipse-temurin:25-jre-alpine
RUN adduser -D -s /bin/sh app
WORKDIR /app
COPY --from=builder /app/shippingService/build/libs/*.jar app.jar
USER app
EXPOSE 6011
ENTRYPOINT ["java", "-jar", "app.jar"]
