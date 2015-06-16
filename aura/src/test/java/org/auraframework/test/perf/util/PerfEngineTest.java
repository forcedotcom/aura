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

import java.lang.reflect.Constructor;
import java.util.List;
import java.util.Vector;
import java.util.logging.Level;
import java.util.logging.Logger;

import junit.framework.Test;
import junit.framework.TestSuite;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.util.ServiceLocator;
import org.auraframework.util.test.annotation.PerfTestSuite;
import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.auraframework.util.test.util.TestInventory;
import org.auraframework.util.test.util.TestInventory.Type;
import org.json.JSONArray;

@UnAdaptableTest
@PerfTestSuite
public class PerfEngineTest<T> extends TestSuite implements PerfTestFramework {

    private PerfConfigUtil perfConfigUtil;
    private PerfMetricsUtil perfMetricsUtil;

    private static final Logger LOG = Logger.getLogger(PerfEngineTest.class.getSimpleName());

    public static TestSuite suite() throws Exception {
        return new PerfEngineTest<>();
    }

    public PerfEngineTest() throws Exception {
        this("Component Perf tests");
    }

    public PerfEngineTest(String name) throws Exception {
        LOG.info("ComponentPerfTestEngine: " + name);
        setName(name);
        init();
    }

    private void init() throws Exception {
        perfConfigUtil = new PerfConfigUtil();
        runTests(discoverTests());
        // publishResults(new JSONArray());
    }

    @Override
    public void runTests(List<DefDescriptor<ComponentDef>> defs) throws Exception {
        for (DefDescriptor<ComponentDef> def : defs)
            addTest(new ComponentSuiteTest(def));
    }

    @Override
    public List<DefDescriptor<ComponentDef>> discoverTests() {
        return perfConfigUtil.getComponentTestsToRun();
    }

    @Override
    public JSONArray publishResults(JSONArray metrics) {
        // TODO Publish results via a JSONArray Response object
        // System.out.println("Publish metrics");
        return null;
    }

    private class ComponentSuiteTest extends TestSuite {
        ComponentSuiteTest(DefDescriptor<ComponentDef> descriptor) {
            super(descriptor.getName());
            TestInventory inventory = ServiceLocator.get().get(TestInventory.class, "auraTestInventory");
            Vector<Class<? extends Test>> testClasses = inventory.getTestClasses(Type.PERFCMP);

            for (Class<? extends Test> testClass : testClasses) {
                try {
                    Constructor<? extends Test> constructor = testClass.getConstructor(DefDescriptor.class);
                    PerfExecutorTest test = (PerfExecutorTest)constructor.newInstance(descriptor);
                    // addTest(patchPerfComponentTestCase(test, descriptor));
                    addTest(test);
                } catch (Exception e) {
                    LOG.log(Level.WARNING, "exception instantiating " + testClass.getName(), e);
                }
            }
        }
    }

}
