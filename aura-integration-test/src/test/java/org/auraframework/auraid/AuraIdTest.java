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
package org.auraframework.auraid;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.EventDef;
import org.auraframework.def.InterfaceDef;
import org.auraframework.id.AuraId;
import org.auraframework.test.AuraTestCase;

public class AuraIdTest extends AuraTestCase {

    public AuraIdTest(String name) {
        super(name);
    }

    public void testApplication() {
        DefDescriptor<ApplicationDef> dd = Aura.getDefinitionService().getDefDescriptor("aura:application",
                ApplicationDef.class);
        verifyAuraIdProperties(AuraId.aura.APPLICATION, false, false, true, false, false, dd, null, "application",
                DefType.APPLICATION, "aura:application", "markup://aura:application");
    }

    public void testComponent() {
        DefDescriptor<ComponentDef> dd = Aura.getDefinitionService().getDefDescriptor("aura:label",
                ComponentDef.class);
        verifyAuraIdProperties(AuraId.aura.LABEL, false, true, false, false, false, dd, null, "label",
                DefType.COMPONENT, "aura:label", "markup://aura:label");

        // Test component that extends another
        dd = Aura.getDefinitionService().getDefDescriptor("ui:inputText", ComponentDef.class);
        verifyAuraIdProperties(AuraId.ui.INPUT_TEXT, false, true, false, false, false, dd, "ui:input", "inputText",
                DefType.COMPONENT, "ui:inputText", "markup://ui:inputText");
    }

    public void testEvent() {
        DefDescriptor<EventDef> dd = Aura.getDefinitionService().getDefDescriptor("aura:initialized",
                EventDef.class);
        verifyAuraIdProperties(AuraId.aura.INITIALIZED, true, false, false, false, false, dd, null, "initialized",
                DefType.EVENT, "aura:initialized", "markup://aura:initialized");
    }

    public void testAttribute() {
        verifyAuraIdProperties(AuraId.aura.APPLICATION__BODY, false, false, false, false, true, null, "application",
                "body", DefType.ATTRIBUTE, "aura:application/ATTRIBUTE$body",
                "markup://aura:application/ATTRIBUTE$body");
    }

    public void testInterface() {
        DefDescriptor<InterfaceDef> dd = Aura.getDefinitionService().getDefDescriptor("aura:rootComponent",
                InterfaceDef.class);
        verifyAuraIdProperties(AuraId.aura.ROOT_COMPONENT, false, false, false, true, false, dd, null, "rootComponent",
                DefType.INTERFACE, "aura:rootComponent", "markup://aura:rootComponent");
    }

    private void verifyAuraIdProperties(AuraId.ui cmp, boolean isEvent, boolean isComponent, boolean isApplication,
            boolean isInterface, boolean isAttribute, DefDescriptor<?> dd, String ownerExtends, String name,
            DefType defType, String fqn, String prefixedFqn) {
        assertEquals(isEvent, cmp.isEvent());
        assertEquals(isComponent, cmp.isComponent());
        assertEquals(isApplication, cmp.isApplication());
        assertEquals(isInterface, cmp.isInterface());
        assertEquals(isAttribute, cmp.isAttribute());
        assertEquals(dd, cmp.getDescriptor());
        assertEquals(ownerExtends, cmp.getOwnerOrExtendsFrom());
        assertEquals(name, cmp.getName());
        assertEquals(defType, cmp.getDefType());
        assertEquals(fqn, cmp.getFQN());
        assertEquals(prefixedFqn, cmp.getPrefixedFQN());
    }

    private void verifyAuraIdProperties(AuraId.aura cmp, boolean isEvent, boolean isComponent, boolean isApplication,
            boolean isInterface, boolean isAttribute, DefDescriptor<?> dd, String ownerExtends, String name,
            DefType defType, String fqn, String prefixedFqn) {
        assertEquals(isEvent, cmp.isEvent());
        assertEquals(isComponent, cmp.isComponent());
        assertEquals(isApplication, cmp.isApplication());
        assertEquals(isInterface, cmp.isInterface());
        assertEquals(isAttribute, cmp.isAttribute());
        assertEquals(dd, cmp.getDescriptor());
        assertEquals(ownerExtends, cmp.getOwnerOrExtendsFrom());
        assertEquals(name, cmp.getName());
        assertEquals(defType, cmp.getDefType());
        assertEquals(fqn, cmp.getFQN());
        assertEquals(prefixedFqn, cmp.getPrefixedFQN());
    }
}
