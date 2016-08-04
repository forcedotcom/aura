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
package org.auraframework.integration.test.root;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImplTestCase;
import org.junit.Test;

public class RootDefRegistryTest extends AuraImplTestCase {
    @Test
    public void testGetComponentDefWithExtends() throws Exception {
        DefDescriptor<ComponentDef> childDescriptor = definitionService.getDefDescriptor("test:extendsChild",
                ComponentDef.class);
        DefDescriptor<ComponentDef> parentDescriptor = definitionService.getDefDescriptor("test:extendsParent",
                ComponentDef.class);
        ComponentDef def = childDescriptor.getDef();
        assertEquals(parentDescriptor, def.getExtendsDescriptor());
        assertEquals(2, def.getModelDefDescriptors().size());
        assertEquals("java://org.auraframework.components.test.java.controller.TestController", def.getControllerDefDescriptors()
                .get(0).getQualifiedName());
        assertEquals("java://org.auraframework.components.test.java.model.TestModel", def.getModelDef().getDescriptor()
                .getQualifiedName());
    }
}
