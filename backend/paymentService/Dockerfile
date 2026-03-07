# paymentService — multi-stage, Alpine runtime (Gradle image avoids network download)
FROM gradle:9.3.1-jdk25-alpine AS builder
RUN apk add --no-cache bash
WORKDIR /app
COPY proto /app/proto
COPY paymentService /app/paymentService
RUN cd /app/proto && gradle publishToMavenLocal --no-daemon && \
    cd /app/paymentService && gradle bootJar --no-daemon

FROM eclipse-temurin:25-jre-alpine
RUN adduser -D -s /bin/sh app
WORKDIR /app
COPY --from=builder /app/paymentService/build/libs/*.jar app.jar
USER app
EXPOSE 6006
ENTRYPOINT ["java", "-jar", "app.jar"]
