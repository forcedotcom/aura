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
package org.auraframework.integration.test.validation;

import javax.inject.Inject;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.service.DefinitionService;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;

public final class ComponentValidationTest extends AuraImplTestCase {
    @Inject
    DefinitionService definitionService;

    @Test
    public void testAbstractReference() {
        DefDescriptor<ComponentDef> cmp = getAuraTestingUtil().addSourceAutoCleanup(ComponentDef.class,
                "<aura:component><aura:component /></aura:component>",
                StringSourceLoader.DEFAULT_NAMESPACE, StringSourceLoader.NamespaceAccess.INTERNAL);
        Exception expected = null;
        try {
            definitionService.getDefinition(cmp);
        } catch (Exception e) {
            expected = e;
        }
        assertNotNull("Expected an exception instantiating a raw component", expected);
        assertEquals("Expected an InvalidDefinitionException", InvalidDefinitionException.class, expected.getClass());
    }
}
