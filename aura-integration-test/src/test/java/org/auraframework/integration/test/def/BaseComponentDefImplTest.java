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
package org.auraframework.integration.test.def;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.root.component.BaseComponentDefImpl;
import org.junit.Test;

@SuppressWarnings("unchecked")
public class BaseComponentDefImplTest extends AuraImplTestCase{

    @Test
    public void testHasFacetLocalDependenciesWhenServerDependedCmpOnFacet() throws Exception {
        // Arrange
        String cmpWithServerProvider =
                "<aura:component abstract='true' extensible='true' provider='java://org.auraframework.impl.java.provider.TestProviderAbstractBasic'>\n" +
                "</aura:component>";
        DefDescriptor<ComponentDef> facetCmp = addSourceAutoCleanup(ComponentDef.class, cmpWithServerProvider);

        String cmpMarkup = String.format("<aura:component> <%s/> </aura:component>", facetCmp.getDescriptorName());
        DefDescriptor<ComponentDef> desc = addSourceAutoCleanup(ComponentDef.class, cmpMarkup);

        // Act
        BaseComponentDefImpl<ComponentDef> def = (BaseComponentDefImpl<ComponentDef>) definitionService.getDefinition(desc);
        boolean actual = def.hasFacetLocalDependencies();

        // Assert
        assertTrue(actual);
    }

}
