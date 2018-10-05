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
package org.auraframework.integration.test.service;

import java.util.Map;

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.AppInitializer;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.cache.ApplicationInitializerCache;
import org.auraframework.instance.ApplicationInitializer;
import org.auraframework.integration.test.util.IntegrationTestCase;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.hamcrest.Matchers;
import org.junit.Assert;
import org.junit.Test;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.annotation.AnnotationUtils;

public class ApplicationInitializerIntegrationTest extends IntegrationTestCase {
    @Inject
    @Lazy
    private ApplicationInitializerCache applicationInitializerCache;

    @Test
    public void testApplicationsAreValid() throws Exception {
        contextService.startContext(Mode.DEV, Format.JSON, Authentication.AUTHENTICATED);
        for (String app : applicationInitializerCache.getApplicationList()) {
            DefDescriptor<ApplicationDef> descriptor = definitionService.getDefDescriptor(app, ApplicationDef.class);
            ApplicationDef def = definitionService.getDefinition(descriptor);
            Assert.assertThat("All defs shoult be real", def, Matchers.notNullValue());
        }
    }

    @Test
    public void testInitializers() throws Exception {
        Map<String,ApplicationInitializer> initializerMap;
        initializerMap = applicationContext.getBeansOfType(ApplicationInitializer.class);;
        AppInitializer annotation;

        for (ApplicationInitializer initializer : initializerMap.values()) {
            annotation = AnnotationUtils.findAnnotation(initializer.getClass(), AppInitializer.class);
            Assert.assertThat("Initializer "+initializer.getClass().getName()+" needs to have an annotation",
                    annotation, Matchers.notNullValue());
        }
    }
}
