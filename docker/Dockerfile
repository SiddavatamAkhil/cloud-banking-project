
FROM maven:3.9.6-eclipse-temurin-17 as build
WORKDIR /app
COPY backend /app
RUN mvn -B -f pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
