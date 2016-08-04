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
package org.auraframework.impl.root.component;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.root.event.RegisterEventDefImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.AuraRuntimeException;
import org.junit.Test;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Abstract component validation
 */
public class AbstractComponentDefTest extends AuraImplTestCase {
    /**
     * Abstract component extends regular component.
     * 
     * @throws Exception
     */
    @Test
    public void testExtendsComponent() throws Exception {
        ComponentDefImpl.Builder builder = createAbstractBuilder();
        DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor("test:fakeComponent", ComponentDef.class);
        builder.extendsDescriptor = desc;
        ComponentDef cmp = builder.build();

        try {
            cmp.validateDefinition();
        } catch (AuraRuntimeException e) {
            fail("Should not have thrown AuraRuntimeException on abstract component extending component.");
        }
    }

    /**
     * Abstract component extends abstract component.
     * 
     * @throws Exception
     */
    @Test
    public void testExtendsAbstract() throws Exception {
        ComponentDefImpl.Builder builder = createAbstractBuilder();
        builder.setDescriptor(definitionService.getDefDescriptor("test:fakeAbstractChild", ComponentDef.class));
        DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor("test:fakeAbstractParent", ComponentDef.class);
        builder.extendsDescriptor = desc;
        ComponentDef cmp = builder.build();

        try {
            cmp.validateDefinition();
        } catch (AuraRuntimeException e) {
            fail("Should not have thrown AuraRuntimeException on abstract component extending abstract component.");
        }
    }

    /**
     * Abstract component implements interface component.
     * 
     * @throws Exception
     */
    @Test
    public void testImplementsIntf() throws Exception {
        Set<DefDescriptor<InterfaceDef>> interfaces = new HashSet<>();
        interfaces.add(definitionService.getDefDescriptor("test:fakeInterface", InterfaceDef.class));

        ComponentDefImpl.Builder builder = createAbstractBuilder();
        builder.interfaces = interfaces;

        ComponentDef cmp = builder.build();

        try {
            cmp.validateDefinition();
        } catch (AuraRuntimeException e) {
            fail("Should not have thrown AuraRuntimeException on abstract component implementing interface.");
        }
    }

    /**
     * Abstract component contains events.
     * 
     * @throws Exception
     */
    @Test
    public void testEvents() throws Exception {
        Map<String, RegisterEventDef> eventDefs = new HashMap<>();

        RegisterEventDefImpl.Builder regBuilder = new RegisterEventDefImpl.Builder();
        regBuilder.setDescriptor(definitionService.getDefDescriptor("test:anevent", EventDef.class));
        regBuilder.setAttName("fakey");
        regBuilder.setAccess(new DefinitionAccessImpl(null, "public", false));

        eventDefs.put("fakey", regBuilder.build());
        ComponentDefImpl.Builder builder = createAbstractBuilder();
        builder.events = eventDefs;
        ComponentDef cmp = builder.build();

        try {
            cmp.validateDefinition();
        } catch (AuraRuntimeException e) {
            fail("Should not have thrown AuraRuntimeException on abstract component containing events.");
        }
    }

    /**
     * Abstract component extends text component.
     * 
     * @throws Exception
     */
    @Test
    public void testTextComponent() throws Exception {
        ComponentDefImpl.Builder builder = createAbstractBuilder();
        DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor("test:text", ComponentDef.class);
        builder.extendsDescriptor = desc;
        ComponentDef cmp = builder.build();

        try {
            cmp.validateDefinition();
        } catch (AuraRuntimeException e) {
            fail("Should not have thrown AuraRuntimeException on abstract component extending text component.");
        }
    }

    /**
     * Helper method to create abstract component builder.
     * 
     * @return
     */
    private ComponentDefImpl.Builder createAbstractBuilder() {
        ComponentDefImpl.Builder builder = new ComponentDefImpl.Builder();
        builder.isAbstract = true;
        builder.isExtensible = true;
        builder.setDescriptor(definitionService.getDefDescriptor("test:fakeAbstract", ComponentDef.class));
        builder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
        return builder;
    }
}
