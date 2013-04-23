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
package configuration;

import java.lang.annotation.Annotation;
import java.util.Collection;

import org.auraframework.test.AnnotationTestFilter;
import org.auraframework.test.TestFilter;
import org.auraframework.test.TestInventory;
import org.auraframework.util.ServiceLoaderImpl.AuraConfiguration;
import org.auraframework.util.ServiceLoaderImpl.Impl;
import org.junit.Ignore;

import com.google.common.collect.Sets;

/**
 */
@AuraConfiguration
public class AuraUtilTestConfig {

    @Impl(name = "auraUtilTestInventory")
    public static TestInventory auraUtilTestInventory() throws Exception {
        return new TestInventory(AuraUtilTestConfig.class);
    }

    @Impl
    public static TestFilter auraTestFilter() {
        Collection<Class<? extends Annotation>> annotations = Sets.newHashSet();
        annotations.add(Ignore.class);
        return new AnnotationTestFilter(annotations);
    }
}
