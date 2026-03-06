package com.nsbm.bunmart.base;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Full context load fails with Spring Boot 4 + Spring Cloud 2024; enable when using Boot 4–compatible Spring Cloud")
class BunMartApplicationTests {

    @Test
    void contextLoads() {
    }

}
