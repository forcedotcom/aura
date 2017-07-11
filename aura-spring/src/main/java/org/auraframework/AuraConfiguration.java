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

import java.util.List;

import org.polyfill.api.components.ServiceConfig;
import org.polyfill.api.configurations.PolyfillApiConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;

import com.google.common.collect.Lists;

/**
 * Spring configuration to autoscan all aura packages
 */
@Configuration
@ComponentScan(basePackages = {"org.auraframework"}, lazyInit = true)
@Import(PolyfillApiConfig.class)
public class AuraConfiguration {
    @Primary
    @Bean
    public ServiceConfig getAuraPolyfillServiceConfig() {
        List<String> polyfills = Lists.newArrayList();
        polyfills.add("Array.prototype.find");
        polyfills.add("Array.prototype.findIndex");
        polyfills.add("Array.prototype.fill");
        polyfills.add("Array.prototype.keys");
        polyfills.add("Array.prototype.includes");
        polyfills.add("CustomEvent");
        polyfills.add("Date.now");
        polyfills.add("Event");
        polyfills.add("Function.name");
        polyfills.add("Function.prototype.bind");
        polyfills.add("Object.keys");
        polyfills.add("Object.assign");
        polyfills.add("requestAnimationFrame");
        polyfills.add("WeakMap");
        polyfills.add("WeakSet");
        polyfills.add("Symbol");
        polyfills.add("compat.classList");
        polyfills.add("compat.freeze");

        return new ServiceConfig()
                .setGated(true)
                .setMinify(true)
                .setLoadOnUnknownUA(true)
                .setPolyfills(polyfills);
    }
}
