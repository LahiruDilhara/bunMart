package com.nsbm.bunmart.order;

// Ensure these imports match your folder structure exactly
import com.nsbm.bunmart.order.model.Order;
import com.nsbm.bunmart.order.repositories.OrderRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BunMartApplication {

    public static void main(String[] args) {
        SpringApplication.run(BunMartApplication.class, args);
    }

    @Bean
    CommandLineRunner commandLineRunner(OrderRepository orderRepository) {
        return args -> {
            Order testOrder = new Order();
            testOrder.setUserId("user_123");
            testOrder.setStatus("SUCCESS_TEST");

            orderRepository.save(testOrder);
            System.out.println("################################################");
            System.out.println("DATA SENT: Check the 'orders' collection in Atlas!");
            System.out.println("################################################");
        };
    }
}