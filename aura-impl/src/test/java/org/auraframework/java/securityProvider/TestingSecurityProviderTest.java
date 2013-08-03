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
package org.auraframework.java.securityProvider;

import org.auraframework.Aura;
import org.auraframework.system.AuraContext;
import org.auraframework.test.AuraTestCase;
import org.auraframework.test.annotation.ThreadHostileTest;

/**
 * Tests {@link TestingSecurityProvider}
 */
@ThreadHostileTest("PRODUCTION")
public class TestingSecurityProviderTest extends AuraTestCase {
    public TestingSecurityProviderTest(String name) {
        super(name);
    }

    public void testProduction() throws Exception {
        assertFalse("Production should have no access", isAllowed(true, AuraContext.Mode.PROD));
    }

    public void testProductionWithPTest() throws Exception {
        assertTrue("Production with PTEST should have access", isAllowed(true, AuraContext.Mode.PTEST));
    }

    public void testNonProductionNonProdMode() throws Exception {
        assertTrue("non production with DEV should have access", isAllowed(false, AuraContext.Mode.DEV));
    }

    public void testNonProductionProdMode() throws Exception {
        assertTrue("non production with PROD should have access", isAllowed(false, AuraContext.Mode.PROD));
    }

    private boolean isAllowed(boolean isProduction, AuraContext.Mode mode) {
        try {
            getMockConfigAdapter().setIsProduction(isProduction);
            startContext(mode);

            TestingSecurityProvider securityProvider = new TestingSecurityProvider();
            return securityProvider.isAllowed(null);

        } finally {
            endContext();
        }
    }

    private void startContext(AuraContext.Mode mode) {
        Aura.getContextService().startContext(mode,
                AuraContext.Format.JSON, AuraContext.Access.AUTHENTICATED);
    }

    private void endContext() {
        Aura.getContextService().endContext();
    }
}
