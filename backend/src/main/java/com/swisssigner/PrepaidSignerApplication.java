package com.swisssigner;

import com.swisssigner.config.SwisscomSignProperties;
import com.swisssigner.config.StripeProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({SwisscomSignProperties.class, StripeProperties.class})
public class PrepaidSignerApplication {
    public static void main(String[] args) {
        SpringApplication.run(PrepaidSignerApplication.class, args);
    }
}
