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
package org.auraframework.components.ui;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;

/**
 * This test has automation to verify implementation of ui:ouputText component.
 */
public class OutputTextTest extends AuraImplTestCase {
    /**
     * Verify injecting javascript using 'value' attribute.
     * 
     * @throws Exception
     */
    @Test
    public void testInjectingScriptTagIntoValue() throws Exception {
        String scriptTags = "<script>alert(\'blah\')</script>";
        String cmpMarkup = String.format(baseComponentTag, "", "<ui:outputText value='" + scriptTags + "'/>");
        DefDescriptor<ComponentDef> testCmp = addSourceAutoCleanup(ComponentDef.class, cmpMarkup);
        try {
            testCmp.getDef();
            fail("XML should not be assigned as value.");
        } catch (InvalidDefinitionException e) {
            assertNotNull(e);
        }
    }
}
