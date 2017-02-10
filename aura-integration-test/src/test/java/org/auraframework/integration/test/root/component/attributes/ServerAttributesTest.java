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
package org.auraframework.integration.test.root.component.attributes;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.instance.Component;
import org.auraframework.util.test.annotation.AuraTestLabels;
import org.junit.Test;

@AuraTestLabels("auraSanity")
public class ServerAttributesTest extends AuraImplTestCase {

    @Test
    public void testRenderingFunctionCallValueOnConcrete() throws Exception {
    	  //.final String expected = n;

          final String baseTemplate = "<aura:component render='server' extensible='true'>"
  						                + "<aura:attribute name='attribute1' type='String' default='base'/>"
  						                + "<aura:attribute name='attribute2' type='String' default='base'/>"
  						                + "<aura:set attribute='attribute1' value='base:set'/>"
                                    + "</aura:component>";

          final DefDescriptor<ComponentDef> base = createComponentDef(baseTemplate);


          final String concreteTemplate = "<aura:component render='server' extends='%s'>"
  						                + "<aura:set attribute='attribute1' value='concrete:set' />"
                                        + "</aura:component>";

          final DefDescriptor<ComponentDef> concrete = createComponentDef(String.format(concreteTemplate, base.getDescriptorName()));

          final Component component = instanceService.getInstance(concrete);
          // Everything should be on the concerete
          // The supers simply have PRV's pointing to the concrete.
          final	Object actual = component.getSuper().getAttributes().getRawValue("attribute1");
          
          assertTrue(actual instanceof PropertyReference);
          
          PropertyReference prv = (PropertyReference)actual;
          assertEquals(prv.getLeaf(), "attribute1");
    }


    private DefDescriptor<ComponentDef> createComponentDef(final String template) {
        return addSourceAutoCleanup(ComponentDef.class, template);
    }
}
