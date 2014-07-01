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
package org.auraframework.test;

import java.util.concurrent.TimeUnit;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

/**
 * Keep track of the current test.
 */
public class TestContextAdapterImpl implements TestContextAdapter {

    Cache<String, TestContext> allContexts =
            CacheBuilder.newBuilder().concurrencyLevel(8).expireAfterAccess(30, TimeUnit.MINUTES).maximumSize(100)
                    .build();

    private final ThreadLocal<TestContext> testContext = new ThreadLocal<>();

    @Override
    public TestContext getTestContext() {
        return testContext.get();
    }

    @Override
    public TestContext getTestContext(String name) {
        TestContext context = allContexts.getIfPresent(name);
        if (context == null) {
            context = new TestContextImpl(name);
            allContexts.put(name, context);
        }
        testContext.set(context);
        return context;
    }

    @Override
    public void clear() {
        testContext.set(null);
    }

    @Override
    public void release() {
        TestContext context = testContext.get();
        if (context != null) {
            allContexts.invalidate(context.getName());
            context.getLocalDefs().clear();
        }
        clear();
    }

}
