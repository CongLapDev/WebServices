package com.nhs.individual;

import com.nhs.individual.config.SwaggerConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ComponentScan(basePackages = "com.nhs.individual")
@Import(SwaggerConfig.class)
@EnableScheduling
@EnableAsync
public class Main {
    public static void main(String[] args){
        SpringApplication.run(Main.class,args);
        System.out.println("✅ Application started on port 8085");
    }
}