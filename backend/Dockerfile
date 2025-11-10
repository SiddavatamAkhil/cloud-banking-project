# Stage 1: Build the project with Maven
# Use an official Maven image with Java 17 to build the .jar file
FROM maven:3.9-eclipse-temurin-17 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the pom.xml first. This caches our dependencies.
COPY pom.xml .

# Copy the rest of the source code
COPY src ./src

# Run the Maven build to create the .jar file. We skip tests.
RUN mvn clean package -DskipTests

# ---
# Stage 2: Create the final, small image
# Use a slim Java 17 runtime (JRE) for the final app
FROM eclipse-temurin:17-jre-focal
WORKDIR /app

# Copy the .jar file that was built in Stage 1
COPY --from=build /app/target/*.jar app.jar

# Set the command to run your application when the container starts
ENTRYPOINT ["java", "-jar", "app.jar"]