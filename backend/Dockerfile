FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
ARG MAVEN_CLI_OPTS="-B -ntp -Dmaven.wagon.http.retryHandler.count=8 -Dmaven.wagon.http.retryHandler.requestSentEnabled=true -Dmaven.wagon.http.pool=false -Dhttp.keepAlive=false -Dmaven.wagon.rto=90000 -Dmaven.wagon.httpconnectionTimeout=90000"

# Cache dependencies separately
COPY pom.xml ./
RUN set -eux; \
    for i in 1 2 3 4 5; do \
      mvn $MAVEN_CLI_OPTS dependency:go-offline -q && break; \
      echo "go-offline retry $i/5"; \
      find /root/.m2/repository -name "*.lastUpdated" -delete || true; \
      rm -rf /root/.m2/repository/io/netty/netty-buffer || true; \
      sleep 5; \
      [ "$i" -eq 5 ] && exit 1; \
    done
COPY src ./src
RUN set -eux; \
    for i in 1 2 3 4 5; do \
      mvn $MAVEN_CLI_OPTS package -DskipTests -q && break; \
      echo "package retry $i/5"; \
      find /root/.m2/repository -name "*.lastUpdated" -delete || true; \
      rm -rf /root/.m2/repository/io/netty/netty-buffer || true; \
      sleep 5; \
      [ "$i" -eq 5 ] && exit 1; \
    done

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=builder /app/target/*.jar app.jar
RUN mkdir -p /app/uploads
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
