/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.auraframework;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.polyfill.api.components.Feature;
import org.polyfill.api.components.Query;
import org.polyfill.api.components.ServiceConfig;
import org.polyfill.api.configurations.PolyfillApiConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;

/**
 * Spring configuration to autoscan all aura packages
 */
@Configuration
@ComponentScan(basePackages = {"org.auraframework"}, lazyInit = true)
@Import(PolyfillApiConfig.class)
public class AuraConfiguration {

    private List<String> polyfills = Arrays.asList(
            "Array.prototype.find",
            "Array.prototype.findIndex",
            "Array.prototype.fill",
            "Array.prototype.keys",
            "Array.prototype.includes",
            "Array.from",
            "CustomEvent",
            "Date.now",
            "Event",
            "Function.name",
            "Function.prototype.bind",
            "Map",
            "Object.keys",
            "Object.assign",
            "requestAnimationFrame",
            "WeakMap",
            "WeakSet",
            "Symbol",
            "compat.classList",
            "compat.freeze"
    );

    @Primary
    @Bean
    public ServiceConfig getAuraPolyfillServiceConfig() {
        return new ServiceConfig().setPolyfills(this.polyfills);
    }

    @Primary
    @Bean
    public Query defaultQuery() {
        List<Feature> polyfillRequestList = this.polyfills.stream()
                .map(Feature::new)
                .collect(Collectors.toList());
        return new Query.Builder(polyfillRequestList).build();
    }
}
