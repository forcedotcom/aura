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
package org.auraframework.test;

import junit.framework.TestSuite;

import org.auraframework.test.ComponentJSTestSuiteTest.NamespaceTestSuite;
import org.auraframework.test.annotation.HybridContainerTest;
import org.auraframework.test.annotation.ThreadHostileTest;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.test.annotation.WebDriverTest;

/**
 * Wrapper for tests that only run in the hybrid container
 * 
 */
@UnAdaptableTest
@HybridContainerTest
@WebDriverTest
@ThreadHostileTest
public class HybridContainerJSTestSuiteTest extends TestSuite {
    public static TestSuite suite() throws Exception {
        TestSuite suite = new NamespaceTestSuite("hybridContainerTest");
        suite.setName("Hybrid Container JS component tests");
        return suite;
    }
}
