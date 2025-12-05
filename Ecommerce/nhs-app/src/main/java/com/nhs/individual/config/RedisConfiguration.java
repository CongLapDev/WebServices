//package com.nhs.individual.config;
//
//import com.nhs.individual.Domain.RefreshToken;
//import org.springframework.beans.factory.annotation.Qualifier;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.boot.autoconfigure.cache.CacheProperties;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.data.redis.connection.jedis.JedisConnectionFactory;
//import org.springframework.data.redis.core.RedisTemplate;
//
//@Configuration
//public class RedisConfiguration {
//    @Value("spring.data.redis.host")
//    private String host;
//    @Value("spring.data.redis.port")
//    private String port;
//    @Bean
//    JedisConnectionFactory redisConnectionFactory(){
//        JedisConnectionFactory factory=new JedisConnectionFactory();
//        return  factory;
//    }
//    @Bean
//    @Qualifier("refreshTokenStore")
//    RedisTemplate<Integer, RefreshToken> redisRefreshToken() {
//        RedisTemplate<Integer, RefreshToken> redisTemplate = new RedisTemplate<>();
//        redisTemplate.setConnectionFactory(redisConnectionFactory());
//        return redisTemplate;
//    }
//    @Bean
//    @Qualifier("generalStore")
//    RedisTemplate<Integer,Object> redisTemplate() {
//        RedisTemplate<Integer, Object> redisTemplate = new RedisTemplate<>();
//        redisTemplate.setConnectionFactory(redisConnectionFactory());
//        return redisTemplate;
//    }
//
//}
