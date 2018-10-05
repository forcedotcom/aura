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
package org.auraframework.impl.cache;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.auraframework.annotations.Annotations.AppInitializer;
import org.auraframework.instance.ApplicationInitializer;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Scope;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.stereotype.Component;

import com.google.common.collect.ImmutableMap;

@Lazy
@Component
@Scope(BeanDefinition.SCOPE_SINGLETON)
public class ApplicationInitializerCache implements ApplicationContextAware {
    private ApplicationContext applicationContext;

    private volatile boolean initialized;

    private Map<String, Map<String, ApplicationInitializer>> initializerMap = null;

    private final Map<String, ApplicationInitializer> EMPTY_MAP =
        new ImmutableMap.Builder<String, ApplicationInitializer>().build();
        
    private void setupInitializerMap() {
        if (initialized) {
            return;
        }
        synchronized (this) {
            if (initialized) {
                return;
            }
            Map<String, Map<String, ApplicationInitializer>> building = new HashMap<>();
            initializerMap = building;
            Map<String, ApplicationInitializer> appMap;
            Map<String, ApplicationInitializer> initializers;

            initializers = applicationContext.getBeansOfType(ApplicationInitializer.class);
            if (initializers != null) {
                for (ApplicationInitializer initializer : initializers.values()) {
                    AppInitializer annotation;

                    annotation = AnnotationUtils.findAnnotation(initializer.getClass(), AppInitializer.class);
                    if (annotation == null) {
                        // Whoops. What should we do.
                        continue;
                    }
                    for (String app : annotation.applications()) {
                        appMap = building.get(app);
                        if (appMap == null) {
                            appMap = new HashMap<>();
                            building.put(app, appMap);
                        }
                        appMap.put(annotation.name(), initializer);
                    }
                }
            }
            initializerMap = building;
            initialized = true;
        }
    }

    public Map<String, ApplicationInitializer> getInitializers(String applicationName) {
        setupInitializerMap();
        Map<String, ApplicationInitializer> value = initializerMap.get(applicationName);
        if (value != null) {
            return value;
        }
        return EMPTY_MAP;
    }

    public List<String> getApplicationList() {
        setupInitializerMap();
        return new ArrayList<>(initializerMap.keySet());
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }
}
