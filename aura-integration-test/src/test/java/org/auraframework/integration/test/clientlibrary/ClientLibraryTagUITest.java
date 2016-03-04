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
package org.auraframework.integration.test.clientlibrary;

import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.util.WebDriverTestCase;
import org.auraframework.test.util.WebDriverTestCase.CheckAccessibility;
import org.junit.Ignore;

@CheckAccessibility(false)
public class ClientLibraryTagUITest extends WebDriverTestCase {
    public ClientLibraryTagUITest(String name) {
        super(name);
    }


    /**
     * Verify that Javascript and Style resources marked as uncombinable are available at the client. WalltimeLocale is
     * an uncombinable JS resource.
     *
     * @throws Exception
     */
    public void testNonCombinableResources() throws Exception {
        open("/clientLibraryTest/clientLibraryTest.app");
        waitForAuraFrameworkReady();
        Boolean walltimeLocale = (Boolean)auraUITestingUtil.getEval("return !!WallTime");
        assertTrue(walltimeLocale);
    }

    /**
     * Verify that resource change depending on Mode. Mixture of combinable and uncombinable resources
     */
    @Ignore("missing resources to test - need to inject extra client libs")
    public void testModeDependentResources() throws Exception {
        open("/clientLibraryTest/clientLibraryTest.app", Mode.PTEST);

        // Mode independent resources
        Object minuteThruMoment = auraUITestingUtil.getEval("return moment(new Date()).minutes()");
        assertNotNull(minuteThruMoment);

        Boolean walltime = (Boolean)auraUITestingUtil.getEval("return !!WallTime");
        assertTrue(walltime);

        assertEquals("awesome", auraUITestingUtil.getEval("return clientLibraryTest.cool;"));
    }
}
