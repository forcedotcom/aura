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
package org.auraframework.integration.test.css;

import org.auraframework.Aura;
import org.auraframework.impl.css.StyleTestCase;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;

public class FlavorsDefHandlerTest extends StyleTestCase {

    public FlavorsDefHandlerTest(String name) {
        super(name);
    }

    public void testInvalidChild() throws Exception {
        try {
            addFlavorAssortment("<aura:flavors><aura:foo/></aura:flavors>").getDef();
            fail("Should have thrown AuraException aura:foo isn't a valid child tag for aura:flaors");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "Found unexpected tag");
        }
    }

    public void testWithTextBetweenTag() throws Exception {
        try {
        	Aura.getDefinitionService().getDefinition(addFlavorAssortment("<aura:flavors>Test</aura:flavors>"));
            fail("Should have thrown AuraException because text is between aura:flavors tags");
        } catch (Exception e) {
            checkExceptionContains(e, InvalidDefinitionException.class, "No literal text");
        }
    }
}
