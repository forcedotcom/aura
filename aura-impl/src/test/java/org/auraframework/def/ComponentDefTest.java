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
package org.auraframework.def;

import org.auraframework.impl.root.component.ComponentDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;

public class ComponentDefTest extends BaseComponentDefTest<ComponentDef> {

    public ComponentDefTest(String name) {
        super(name, ComponentDef.class, "aura:component");
    }

    /**
     * Test method for {@link ComponentDef#isAbstract()}.
     */
    public void testIsAbstract() throws Exception {
        String name = "fooApp" + System.currentTimeMillis();
        //This creates a StringSource to store the definition
        addSource(name, "", ComponentDef.class);
        ComponentDefImpl.Builder builder = new ComponentDefImpl.Builder();
        builder.setDescriptor(DefDescriptorImpl.getInstance("markup://string:" + name, ComponentDef.class));
        builder.isAbstract = true;
        //And then you can save the definition
        definitionService.save(builder.build());
        ComponentDef def = definitionService.getDefinition("string:" + name, ComponentDef.class);

        assertNotNull(def);
        assertFalse(def.isAbstract());

        assertFalse(define(baseTag, "", "").isAbstract());
        checkBoolean(String.format(baseTag, "abstract='%s'", ""));
    }
}
