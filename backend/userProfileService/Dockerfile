# userProfileService — multi-stage, Alpine runtime (Gradle image avoids network download)
FROM gradle:9.3.1-jdk25-alpine AS builder
RUN apk add --no-cache bash
WORKDIR /app
COPY proto /app/proto
COPY userProfileService /app/userProfileService
# protoc-gen-grpc-java is downloaded with .exe extension; chmod +x so it runs on Linux
RUN cd /app/proto && gradle generateProto --no-daemon || true && \
    find /home/gradle/.gradle/caches -name "protoc-gen-grpc-java*.exe" -exec chmod +x {} \; 2>/dev/null || true && \
    gradle publishToMavenLocal --no-daemon && \
    cd /app/userProfileService && gradle bootJar --no-daemon

FROM eclipse-temurin:25-jre-alpine
RUN adduser -D -s /bin/sh app
WORKDIR /app
COPY --from=builder /app/userProfileService/build/libs/*.jar app.jar
USER app
EXPOSE 6002
ENTRYPOINT ["java", "-jar", "app.jar"]
