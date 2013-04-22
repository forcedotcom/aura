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
package org.auraframework.component.ui;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.throwable.AuraRuntimeException;

/**
 * This test has automation to verify implementation of ui:ouputText component.
 * 
 * @userStory a07T0000001isvq
 * @hierarchy Aura.Components.UI.OutputText
 * @priority medium
 */
public class OutputTextTest extends AuraImplTestCase {
    public OutputTextTest(String name) {
        super(name);
    }

    /**
     * Verify injecting javascript using 'value' attribute.
     * 
     * @throws Exception
     */
    public void testInjectingScriptTagIntoValue() throws Exception {
        String scriptTags = "<script>alert(\'blah\')</script>";
        String cmpMarkup = String.format(baseComponentTag, "", "<ui:outputText value='" + scriptTags + "'/>");
        DefDescriptor<ComponentDef> testCmp = addSourceAutoCleanup(ComponentDef.class, cmpMarkup);
        try {
            testCmp.getDef();
            fail("XML should not be assigned as value.");
        } catch (AuraRuntimeException e) {
            assertNotNull(e);
        }

    }
}
