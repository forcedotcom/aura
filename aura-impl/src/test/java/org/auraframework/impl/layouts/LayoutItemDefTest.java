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
package org.auraframework.impl.layouts;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.LayoutsDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.AuraTestingUtilImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * @since 0.0.84
 * @hierarchy Aura.Unit Tests.Components.LayoutItemDef
 * @priority medium
 * @userStorySyncIdOrName a07B0000000FAQ6
 */
public class LayoutItemDefTest extends AuraImplTestCase {
    AuraTestingUtilImpl util;

    public LayoutItemDefTest(String name) {
        super(name);
    }

    @Override
    public void setUp() throws QuickFixException {
        util = new AuraTestingUtilImpl();
        /**
         * Aura.getContextService().startContext(AuraContext.Mode.UTEST,
         * util.getAdditionalLoaders(),
         */
        Aura.getContextService().startContext(AuraContext.Mode.UTEST, AuraContext.Format.HTML,
                AuraContext.Access.AUTHENTICATED);
    }

    @Override
    public void tearDown() {
        util.tearDown();
        Aura.getContextService().endContext();
    }

    public void testLayoutItemWithActionAndMarkup() throws Exception {
        DefDescriptor<LayoutsDef> dd = util.addSourceAutoCleanup(LayoutsDef.class, "<aura:layouts default='def'>"
                + "<aura:layout name='def'>"
                + "<aura:layoutItem container='target' action='{!c.act}'>text</aura:layoutItem>" + "</aura:layout>"
                + "</aura:layouts>");
        try {
            Aura.getDefinitionService().getDefinition(dd);
            fail("Expected QuickFixException");
        } catch (QuickFixException e) {
            assertEquals("layoutItem should have only either an action or markup but not both", e.getMessage());
        }
    }

    public void testLayoutItemWithoutActionOrMarkup() throws Exception {
        DefDescriptor<LayoutsDef> dd = util.addSourceAutoCleanup(LayoutsDef.class, "<aura:layouts default='def'>"
                + "<aura:layout name='def'>" + "<aura:layoutItem container='target'/>" + "</aura:layout>"
                + "</aura:layouts>");
        try {
            Aura.getDefinitionService().getDefinition(dd);
            fail("Expected QuickFixException");
        } catch (QuickFixException e) {
            assertEquals("layoutItem should have either an action or markup", e.getMessage());
        }
    }
}
