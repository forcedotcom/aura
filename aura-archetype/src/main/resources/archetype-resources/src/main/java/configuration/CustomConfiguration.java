package ${package}.configuration;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

/**
 * Spring configuration to autoscan all aura packages
 */
@Configuration
@ComponentScan(basePackages = {"${groupId}"}, lazyInit = true)
public class CustomConfiguration {
}