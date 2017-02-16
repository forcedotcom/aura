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

import org.auraframework.integration.test.util.WebDriverTestCase;
import org.auraframework.integration.test.util.WebDriverTestCase.CheckAccessibility;
import org.auraframework.system.AuraContext.Mode;
import org.junit.Ignore;
import org.junit.Test;

@CheckAccessibility(false)
public class ClientLibraryTagUITest extends WebDriverTestCase {

    /**
     * Verify that resource change depending on Mode.
     */
    @Ignore("TODO W-2970512 missing resources to test - need to inject extra client libs")
	@Test
    public void testModeDependentResources() throws Exception {
        open("/clientLibraryTest/clientLibraryTest.app", Mode.PTEST);

        assertEquals("awesome", getAuraUITestingUtil().getEval("return clientLibraryTest.cool;"));
    }
}
