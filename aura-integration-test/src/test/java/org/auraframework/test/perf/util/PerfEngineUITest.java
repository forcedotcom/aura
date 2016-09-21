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
package org.auraframework.test.perf.util;

import javax.inject.Inject;

import junit.framework.TestSuite;

import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.TestContextManager;

@UnAdaptableTest
@ContextConfiguration(locations = {"/applicationContext.xml"})
public class PerfEngineUITest extends PerfEngineBaseTestSuite {

    @Inject
    private ApplicationContext applicationContext; // used for handling manual bean injections 

    public static TestSuite suite() throws Exception {
        return new PerfEngineUITest();
    }

    public PerfEngineUITest() throws Exception {
        this("Component Perf tests");
    }

    public PerfEngineUITest(String name) throws Exception {
        super(name);
    }

    @Override
    protected void initializeBeans() throws Exception {
        if (applicationContext == null) {
            TestContextManager testContextManager = new TestContextManager(getClass());
            testContextManager.prepareTestInstance(this);
        }
    }
}
