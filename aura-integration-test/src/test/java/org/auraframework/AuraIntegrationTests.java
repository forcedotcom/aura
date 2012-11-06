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
package org.auraframework;

import java.util.Enumeration;
import java.util.Set;

import junit.framework.*;

import org.auraframework.test.TestInventory;
import org.auraframework.test.TestInventory.Type;
import org.auraframework.util.ServiceLocator;

public class AuraIntegrationTests extends TestSuite {

    public static TestSuite suite() {
        return new AuraIntegrationTests();
    }

    private final String nameFragment;

    public AuraIntegrationTests() {
        String frag = System.getProperty("testNameContains");
        if (frag != null && !frag.trim().equals("")) {
            nameFragment = frag.toLowerCase();
        } else {
            nameFragment = null;
        }
        Set<TestInventory> inventories = ServiceLocator.get().getAll(TestInventory.class);
        for (TestInventory inventory : inventories) {
            for (Type type : new Type[] { Type.INTEGRATION, Type.WEB }) {
                TestSuite child = inventory.getTestSuite(type);
                if (child != null) {
                    addTest(child);
                }
            }
        }
    }

    @Override
    public void runTest(Test test, TestResult result) {
        if (test instanceof TestSuite) {
            for (Enumeration<Test> t = ((TestSuite)test).tests(); t.hasMoreElements();) {
                runTest(t.nextElement(), result);
            }
        } else if (test instanceof TestCase) {
            if (nameFragment != null) {
                String testName = test.getClass().getName().toLowerCase() + "."
                        + ((TestCase)test).getName().toLowerCase();
                if (!testName.contains(nameFragment)) { return; }
            }
            test.run(result);
        }
    }
}
