package com.nhs.individual.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.charset.StandardCharsets;
import java.util.List;

@Configuration
@EnableWebMvc
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Map static resources
        registry
                .addResourceHandler("/static/**")
                .addResourceLocations("classpath:/static/");

        registry
                .addResourceHandler("/resources/**")
                .addResourceLocations("classpath:/resources/");

        // Swagger resources
        registry
                .addResourceHandler("/swagger-ui/**")
                .addResourceLocations("classpath:/META-INF/resources/swagger-ui/");

        registry
                .addResourceHandler("/webjars/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/");
    }

    @Override
    public void extendMessageConverters(@NonNull List<HttpMessageConverter<?>> converters) {
        // Ensure UTF-8 encoding for String responses without overriding default converters
        // This method extends converters instead of replacing them (keeps Jackson converter)
        StringHttpMessageConverter stringConverterToReplace = null;
        for (HttpMessageConverter<?> converter : converters) {
            if (converter instanceof StringHttpMessageConverter) {
                stringConverterToReplace = (StringHttpMessageConverter) converter;
                break;
            }
        }
        
        if (stringConverterToReplace != null) {
            // Replace existing StringHttpMessageConverter with UTF-8 version
            converters.remove(stringConverterToReplace);
            @SuppressWarnings("null")
            java.nio.charset.Charset utf8 = StandardCharsets.UTF_8;
            StringHttpMessageConverter utf8Converter = new StringHttpMessageConverter(utf8);
            converters.add(utf8Converter);
        }
    }
}