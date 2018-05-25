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
package org.auraframework.integration.test.root.intf;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.InterfaceDef;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Test;

public class InterfaceDefTest extends AuraImplTestCase {
    @Test
    public void testSerialize() throws Exception {
        DefDescriptor<InterfaceDef> desc = new DefDescriptorImpl<>("markup", "string", "interfacegoldfile",
                InterfaceDef.class);
        getAuraTestingUtil().addSourceAutoCleanup(desc,
                    "<aura:interface extends='aura:noDefaultPreloads'>\n"
                    +"    <aura:attribute type='String' name='foo' />\n"
                    +"</aura:interface>"
                    );
        InterfaceDef def = definitionService.getDefinition(desc);
        serializeAndGoldFile(def);
    }

    @Test
    public void testExtendsItself() throws Exception {
        DefDescriptor<InterfaceDef> extendsSelf = addSourceAutoCleanup(InterfaceDef.class, "");
        getAuraTestingUtil().updateSource(extendsSelf,
                String.format("<aura:interface extends='%s'> </aura:interface>", extendsSelf.getDescriptorName()));
        try {
            definitionService.getDefinition(extendsSelf);
            fail("An interface should not be able to extend itself.");
        } catch (InvalidDefinitionException expected) {
            assertEquals(extendsSelf.getQualifiedName() + " cannot extend itself", expected.getMessage());
        }
    }

    @Test
    public void testExtendsNonExistent() {
        DefDescriptor<InterfaceDef> cmpDesc = addSourceAutoCleanup(InterfaceDef.class,
                "<aura:interface extends='aura:iDontExist'></aura:interface>");
        try {
            definitionService.getDefinition(cmpDesc);
            fail("Did not get expected exception: " + DefinitionNotFoundException.class.getName());
        } catch (Exception e) {
            checkExceptionFull(e, DefinitionNotFoundException.class,
                    "No INTERFACE named markup://aura:iDontExist found : [" + cmpDesc.getQualifiedName()+"]",
                    cmpDesc.getQualifiedName());
        }
    }

    @Test
    public void testImplementsAnInterface() throws Exception {
        DefDescriptor<InterfaceDef> d = addSourceAutoCleanup(InterfaceDef.class,
                "<aura:interface implements='test:fakeInterface'> </aura:interface>");
        try {
            definitionService.getDefinition(d);
            fail("An interface cannot implement another interface, it can only extend it.");
        } catch (InvalidDefinitionException ignored) {
        }
    }
}
