/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.test.adapter;

import java.util.Map;

import org.auraframework.test.TestContext;
import org.auraframework.test.TestContextAdapter;
import org.auraframework.test.TestContextImpl;

import com.google.common.collect.Maps;

/**
 * Keep track of the current test.
 */
public class TestContextAdapterImpl implements TestContextAdapter {
	private final static Map<String, TestContext> allContexts = Maps
			.newConcurrentMap();
	private final ThreadLocal<TestContext> testContext = new ThreadLocal<TestContext>();

    @Override
    public TestContext getTestContext() {
        TestContext context = testContext.get();
        if (context == null) {
            return getTestContext("" + System.nanoTime());
        }
        return context;
    }

    @Override
    public TestContext getTestContext(String name) {
        TestContext context = allContexts.get(name);
        if (context == null){
            context = new TestContextImpl(name);
            allContexts.put(name, context);
        }
        testContext.set(context);
        return context;
    }

    @Override
    public void release() {
        TestContext context = testContext.get();
        if (context != null) {
            allContexts.remove(context.getName());
            testContext.set(null);
            context.getLocalDefs().clear();
        }
    }
}
