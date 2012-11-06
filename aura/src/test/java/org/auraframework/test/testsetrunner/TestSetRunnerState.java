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
package org.auraframework.test.testsetrunner;

import java.util.Collection;
import java.util.Collections;
import java.util.Enumeration;
import java.util.Map;
import java.util.SortedMap;

import javax.annotation.concurrent.GuardedBy;
import javax.annotation.concurrent.ThreadSafe;

import junit.framework.Test;
import junit.framework.TestSuite;

import org.auraframework.system.Annotations.Model;
import org.auraframework.system.AuraContext;
import org.auraframework.test.ComponentJSTestSuiteTest.ComponentTestCase;
import org.auraframework.test.TestInventory;
import org.auraframework.test.TestInventory.Type;
import org.auraframework.util.ServiceLocator;

import com.google.common.collect.Maps;

/**
 * An encapsulation of all of the state held by the {@link TestSetRunnerModel}. This state is not kept
 * in the model itself because it is currently impossible to create lazy singleton objects that
 * adhere to the contract of {@link Model}.
 *
 * FIXME: This setup is not scoped to a user or page state. Two users can stomp on each other's test
 * results.
 *
 * FIXME: There is no stickiness to ensure that client side polls are reaching the server that is
 * running tests on its behalf if the deploy has multiple appServers.
 *
 * FIXME: Individual tests are tracked with just a bag of properties rather than as a strongly typed
 * client-visible model.
 */
@ThreadSafe
public class TestSetRunnerState {
    /**
     * A helper to allow for lazy initialization of the the {@link TestSetRunnerState}.
     */
    private static class SingletonHolder {
        private static TestSetRunnerState INSTANCE = new TestSetRunnerState();
    }

    /**
     * The inventory tracks all test cases available for execution.
     */
    @GuardedBy("this")
    private static Map<String, Test> inventory = Maps.newHashMap();

    /**
     * Parallel to the inventory, this map is used as a data bag to store various properties about
     * tests (e.g. status, exceptions, etc...)
     */
    @GuardedBy("this")
    private static SortedMap<String, Map<String, Object>> testsWithPropsMap = Maps.newTreeMap();

    /**
     * @return the singleton instance.
     */
    public static TestSetRunnerState getInstance() {
        return SingletonHolder.INSTANCE;
    }

    private TestSetRunnerState() {
        populateInventory();
    }

    /**
     * @return an unmodifiable view of the test inventory.
     */
    public synchronized Map<String, Test> getInventory() {
        return Collections.unmodifiableMap(inventory);
    }

    /**
     * @return an unmodifiable view of the test properties map.
     */
    public synchronized Map<String, Map<String, Object>> getTestsWithPropertiesMap() {
        return Collections.unmodifiableMap(testsWithPropsMap);
    }

    /**
     * Populates the model by querying for all implementations of {@link TestInventory}.
     */
    private synchronized void populateInventory() {
        // Load the inventory in a separate thread.
        InventoryPopulator populator = new InventoryPopulator();
        Thread t = new Thread(populator, "TestSetRunnerState Inventory Populator");
        t.start();
        try {
            t.join();
        } catch (InterruptedException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }

    /**
     * We load the test inventory in a separate thread because some test constructors start/stop the
     * {@link AuraContext}. If we load them in the requesting thread, they end up corrupting the
     * context for the {@link TestSetRunnerController}.
     */
    private class InventoryPopulator implements Runnable {
        @Override
        public void run() {
            Collection<TestInventory> inventories = ServiceLocator.get()
                    .getAll(TestInventory.class);
            for (TestInventory i : inventories) {
                for (Type type : TestInventory.Type.values()) {
                    TestSuite suite = i.getTestSuite(type);
                    if (suite.testCount() > 0)
                        addSuite(suite);
                }
            }

            for (Test t : inventory.values()) {
                Map<String, Object> testWithProps = Maps.newHashMap();
                testWithProps.put("name", t.toString());
                testWithProps.put("selected", false);
                testWithProps.put("status", "Not Run Yet");
                testWithProps.put("exception", "");
                testWithProps.put("isHidden", "");
                String url = "";
                if (t instanceof ComponentTestCase) {
                    url = ((ComponentTestCase) t).getTestUrlForManualRun();
                }

                testWithProps.put("jsConsole", url);
                testsWithPropsMap.put(t.toString(), testWithProps);
            }
        }

        /**
         * @param suite
         *        the suite to add to the model.
         */
        private void addSuite(TestSuite suite) {
            for (Enumeration<Test> e = suite.tests(); e.hasMoreElements();) {
                Test test = e.nextElement();
                if (test instanceof TestSuite) {
                    addSuite((TestSuite) test);
                } else {
                    inventory.put(test.toString(), test);
                }
            }
        }
    }

    /**
     * Modify a property of a test
     *
     * @param test
     *        identifies the test
     * @param key
     *        the key of the property
     * @param value
     *        the new value
     */
    public synchronized void setTestProp(String test, String key, Object value) {
        Map<String, Object> testProps = testsWithPropsMap.get(test);
        testProps.put(key, value);
    }
}
