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
package org.auraframework.integration.test;

import java.util.Enumeration;
import java.util.Set;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

import org.auraframework.util.ServiceLocator;
import org.auraframework.util.test.util.TestInventory;
import org.auraframework.util.test.util.TestInventory.Type;

/*This class was made for the maven surefire plugin to use to run the Integration Tests
 The regular AuraIntegrationTests.java class was rewritten to allow the tests to be run in parallel.
 The surefire plugin cannot run tests in parallel, so this class was created to run them in serial.*/

public class AuraIntegrationCoverageTests extends TestSuite {

    public static TestSuite suite() {
        return new AuraIntegrationCoverageTests();
    }

    private final String nameFragment;

    public AuraIntegrationCoverageTests() {
        String frag = System.getProperty("testNameContains");
        if (frag != null && !frag.trim().equals("")) {
            nameFragment = frag.toLowerCase();
        } else {
            nameFragment = null;
        }
        Set<TestInventory> inventories = ServiceLocator.get().getAll(TestInventory.class);
        for (TestInventory inventory : inventories) {
            for (Type type : new Type[] { Type.INTEGRATION, Type.WEBDRIVER, Type.JSTEST }) {
                TestSuite child = inventory.getTestSuite(type);
                if (child != null) {
                    addTest(child);
                }
            }
        }
    }

    @Override
    public void addTest(Test test) {
        if (test instanceof TestSuite) {
            for (Enumeration<Test> t = ((TestSuite) test).tests(); t.hasMoreElements();) {
                addTest(t.nextElement());
            }
            return;
        } else if (test instanceof TestCase) {
            if (nameFragment != null) {
                String testName = test.getClass().getName().toLowerCase() + "."
                        + ((TestCase) test).getName().toLowerCase();
                if (!testName.contains(nameFragment)) {
                    return;
                }
            }
            super.addTest(test);
        }
    }
}
