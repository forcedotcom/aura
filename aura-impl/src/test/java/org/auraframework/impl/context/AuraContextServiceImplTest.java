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
package org.auraframework.impl.context;

import org.auraframework.Aura;
import org.auraframework.adapter.ContextAdapter;
import org.auraframework.impl.AuraImpl;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;

public class AuraContextServiceImplTest extends AuraImplTestCase {

    public AuraContextServiceImplTest(String name) {
        super(name, false);
    }

    public void testAuraContextServiceImpl() {
        ContextService contextService = Aura.getContextService();
        assertTrue(contextService instanceof AuraContextServiceImpl);
    }

    public void testTestContext() {
        // can only test the test context
        ContextService contextService = Aura.getContextService();
        ContextAdapter p = AuraImpl.getContextAdapter();
        assertFalse(p.isEstablished());
        contextService.startContext(Mode.DEV, Format.JSON, Access.AUTHENTICATED);
        assertTrue(p.isEstablished());
        assertNotNull(p.getCurrentContext());

        contextService.endContext();
        assertFalse(p.isEstablished());
    }
}
