FROM openjdk:17-slim
LABEL name=app developer=NguyenHoangSon
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
EXPOSE 8085
ENTRYPOINT ["java","-jar","/app.jar","--spring.profiles.active=ec2"]