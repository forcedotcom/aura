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
	public static TestSuite suite() throws Exception {
		TestSuite suite = new TestSuite();
		if (System.getProperty("skipCustomPerfTests") != null) {
			System.out.println("Skipping Custom Perf Tests");
			return suite;
		}
		
		System.out.println("Bootstrapping Custom Perf Tests");
		Set<TestInventory> inventories = ServiceLocator.get().getAll(TestInventory.class);
		
		// Get all the performance tests that extend from the framework class
		for (TestInventory inventory : inventories) {
            TestSuite child = inventory.getTestSuite(Type.PERFCUSTOM);
            if (child != null ) {
                for (Enumeration<?> tests = child.tests(); tests.hasMoreElements();) {
                	Test next = (Test)tests.nextElement();
                	if (FrameworkPerfAbstractTestCase.class.isAssignableFrom(next.getClass())) {
                		System.out.println("Adding Custom TestCase:" + next.toString());
                		suite.addTest(next);
                	}
                }
            }
        }
        suite.setName("Custom Perf tests");
        return suite;
    }
}
