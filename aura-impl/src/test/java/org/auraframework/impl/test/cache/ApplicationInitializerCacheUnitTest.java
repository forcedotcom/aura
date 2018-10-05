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
package org.auraframework.impl.test.cache;

import java.io.Serializable;
import java.util.HashMap;
import java.util.Map;

import org.auraframework.annotations.Annotations.AppInitializer;
import org.auraframework.impl.cache.ApplicationInitializerCache;
import org.auraframework.instance.ApplicationInitializer;
import org.hamcrest.Matchers;
import org.junit.Assert;
import org.junit.Test;
import org.mockito.Mockito;
import org.springframework.context.ApplicationContext;

import com.google.common.collect.ImmutableMap;

public class ApplicationInitializerCacheUnitTest {
    @Test
    public void testNoInitializers() {
        ApplicationInitializerCache cache = new ApplicationInitializerCache();
        ApplicationContext appContext = Mockito.mock(ApplicationContext.class);
        Mockito.doReturn(null).when(appContext).getBeansOfType(ApplicationInitializer.class);
        cache.setApplicationContext(appContext);
        Map<String, ApplicationInitializer> initializers = cache.getInitializers("nothing");
        Assert.assertThat("We should never get null", initializers, Matchers.notNullValue());
        Assert.assertThat("the map should be empty", initializers, Matchers.anEmptyMap());
    }

    @Test
    public void testEmptyInitializers() {
        ApplicationInitializerCache cache = new ApplicationInitializerCache();
        ApplicationContext appContext = Mockito.mock(ApplicationContext.class);
        Mockito.doReturn(new HashMap<>()).when(appContext).getBeansOfType(ApplicationInitializer.class);
        cache.setApplicationContext(appContext);
        Map<String, ApplicationInitializer> initializers = cache.getInitializers("nothing");
        Assert.assertThat("We should never get null", initializers, Matchers.notNullValue());
        Assert.assertThat("the map should be empty", initializers, Matchers.anEmptyMap());
    }

    public static class InitializerNoAnnotation implements ApplicationInitializer {
        @Override
        public Serializable provideConfiguration() { return "hi"; }
    }

    @Test
    public void testInitializerNoAnnotation() {
        ApplicationInitializerCache cache = new ApplicationInitializerCache();
        ApplicationContext appContext = Mockito.mock(ApplicationContext.class);
        Map<String,ApplicationInitializer> initializerMap = new ImmutableMap.Builder<String,ApplicationInitializer>()
            .put("bad", new InitializerNoAnnotation())
            .build();
        Mockito.doReturn(initializerMap).when(appContext).getBeansOfType(ApplicationInitializer.class);
        cache.setApplicationContext(appContext);
        // Just check that we can get something.
        Map<String, ApplicationInitializer> initializers = cache.getInitializers("nothing");
        Assert.assertThat("We should never get null", initializers, Matchers.notNullValue());
        Assert.assertThat("the map should be empty", initializers, Matchers.anEmptyMap());
    }

    @AppInitializer(name="foo", applications="app1")
    public static class InitializerApp1 implements ApplicationInitializer {
        @Override
        public Serializable provideConfiguration() { return "hi"; }
    }

    @AppInitializer(name="bar", applications={"app1", "app2"})
    public static class InitializerApp1App2 implements ApplicationInitializer {
        @Override
        public Serializable provideConfiguration() { return "hi"; }
    }

    @Test
    public void testTwoInitializer() {
        ApplicationInitializerCache cache = new ApplicationInitializerCache();
        ApplicationContext appContext = Mockito.mock(ApplicationContext.class);
        ApplicationInitializer app1 = new InitializerApp1();
        ApplicationInitializer app1app2 = new InitializerApp1App2();
        Map<String,ApplicationInitializer> initializerMap = new ImmutableMap.Builder<String,ApplicationInitializer>()
            .put("a", app1)
            .put("b", app1app2)
            .build();
        Mockito.doReturn(initializerMap).when(appContext).getBeansOfType(ApplicationInitializer.class);
        cache.setApplicationContext(appContext);

        // Check app1 first.
        Map<String, ApplicationInitializer> initializers = cache.getInitializers("app1");
        Assert.assertThat("We should never get null", initializers, Matchers.notNullValue());
        Assert.assertThat("the map should be empty", initializers, Matchers.aMapWithSize(2));
        Assert.assertThat("foo should be App1", initializers.get("foo"), Matchers.sameInstance(app1));
        Assert.assertThat("bar should be App1App2", initializers.get("bar"), Matchers.sameInstance(app1app2));

        // Check app2 first.
        initializers = cache.getInitializers("app2");
        Assert.assertThat("We should never get null", initializers, Matchers.notNullValue());
        Assert.assertThat("the map should be empty", initializers, Matchers.aMapWithSize(1));
        Assert.assertThat("bar should be App1App2", initializers.get("bar"), Matchers.sameInstance(app1app2));
    }
}
