# bunMart API Gateway

Spring Cloud Gateway that routes requests to backend services by path prefix. All backend services are configured to run on distinct ports locally; the gateway is configured to proxy to those ports.

## Ports (local)

| Service       | Port  | Gateway path(s) |
|---------------|-------|------------------|
| **api-gateway** | 8080 | — (entry point)  |
| product       | 8081 | `/api/v1/products/**`, `/api/v1/categories/**` |
| cart          | 8082 | `/api/v1/cart/**` |
| orders        | 8083 | `/api/v1/orders/**` |
| payments      | 8084 | `/api/v1/payments/**`, `/api/v1/stripe/**` |
| kitchen       | 8085 | `/api/v1/kitchen-orders/**` |
| notification  | 8086 | `/api/v1/notifications/**`, `/api/v1/templates/**` |
| shipping      | 8087 | `/api/v1/shipping/**` |
| pricing       | 8088 | `/api/v1/pricing/**` |
| reviews       | 8089 | `/api/v1/reviews/**` |
| users         | 8090 | `/api/v1/users/**` |

Each backend service has `server.port` set in its `application.properties` to the port in the table. The gateway routes in `application.yml` use `http://localhost:<port>` for local runs.

## Build

```bash
./gradlew build
```

## Runtime (Spring Boot 4 + Java 25)

This module is built with **Spring Boot 4.0.2** and **Spring Cloud Gateway 4.2.7**.  
Gateway 4.2 is built for Spring Boot 3.x, so **the application may fail to start** (e.g. `ClassNotFoundException` for Boot 3-only classes). The JAR builds successfully.

To get a **working runtime**, use **Spring Boot 3.3.x** and **Java 17 or 21** in this module:

- In `build.gradle`: set `org.springframework.boot` to `3.3.12` and Java toolchain to `17` or `21`.
- Ensure a JDK 17/21 is installed; then run:

  ```bash
  ./gradlew bootRun
  ```

## Configuration

- **Port:** `8080` (configurable via `server.port`).
- **Routes:** Defined in `src/main/resources/application.yml` under `spring.cloud.gateway.routes`. Each route maps a path prefix to a backend service URI (`http://localhost:<port>` for local).

Override URIs via environment or profile-specific config (e.g. Docker hostnames) when not running locally.
