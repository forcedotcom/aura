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

import org.polyfillservice.api.components.ServiceConfig;
import org.polyfillservice.api.configurations.PolyfillApiConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;

import java.util.Arrays;
import java.util.List;

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
            "Array.prototype.@@iterator",
            "CustomEvent",
            "Date.now",
            "Event",
            "Function.name",
            "Function.prototype.bind",
            "Map",
            "Object.keys",
            "Object.assign",
            "Object.entries",
            "requestAnimationFrame",
            "WeakMap",
            "WeakSet",
            "Symbol",
            "compat.classList",
            "compat.freeze",
            "Set"
    );

    @Primary
    @Bean
    public ServiceConfig getAuraPolyfillServiceConfig() {
        return new ServiceConfig.Builder()
                .setPolyfills(this.polyfills)
                .setGated(true)
                .setMinify(true)
                .setLoadOnUnknownUA(true)
                .build();
    }
}
