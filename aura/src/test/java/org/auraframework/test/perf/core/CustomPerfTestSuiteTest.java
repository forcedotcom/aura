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
package org.auraframework.test.perf.core;

import java.util.Enumeration;
import java.util.Set;
import java.util.logging.Logger;

import junit.framework.Test;
import junit.framework.TestSuite;

import org.auraframework.test.TestInventory;
import org.auraframework.test.TestInventory.Type;
import org.auraframework.test.annotation.PerfTestSuite;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.util.ServiceLocator;

@UnAdaptableTest
@PerfTestSuite
public class CustomPerfTestSuiteTest extends TestSuite {

    private static final Logger LOG = Logger.getLogger(CustomPerfTestSuiteTest.class.getSimpleName());

    public static TestSuite suite() throws Exception {
        return new CustomPerfTestSuiteTest();
    }

    private CustomPerfTestSuiteTest() throws Exception {
        super("Custom Perf tests");
        createTestCases();
    }

    private void createTestCases() throws Exception {
        if (System.getProperty("skipCustomPerfTests") != null) {
            LOG.info("Skipping " + getName());
            return;
        }

        LOG.info("Bootstrapping " + getName());

        Set<TestInventory> inventories = ServiceLocator.get().getAll(TestInventory.class);
        for (TestInventory inventory : inventories) {
            TestSuite child = inventory.getTestSuite(Type.PERFCUSTOM);
            addSuite(child);
        }
    }

    private void addSuite(TestSuite suite) {
        if (suite != null) {
            for (Enumeration<?> tests = suite.tests(); tests.hasMoreElements();) {
                Test next = (Test) tests.nextElement();
                if (next instanceof TestSuite) {
                    addSuite((TestSuite) next);
                } else if (next instanceof CustomPerfAbstractTestCase) {
                    LOG.info("Adding Custom TestCase:" + next.toString());
                    addTest(next);
                }
            }
        }
    }
}
