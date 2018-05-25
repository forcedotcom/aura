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
package org.auraframework.impl.root.intf;

import java.util.HashSet;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.RegisterEventDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.junit.Assert;
import org.junit.Test;
import org.mockito.Mockito;

import com.google.common.collect.Maps;

public class InterfaceDefBuilderTest {
    @Test
    public void testGetSupersWithExtensions() {
        InterfaceDefImpl.Builder builder = new InterfaceDefImpl.Builder();
        builder.setDescriptor(new DefDescriptorImpl<>("markup", "aura", "testinterfacechild", InterfaceDef.class));
        builder.extendsDescriptors = new HashSet<DefDescriptor<InterfaceDef>>();
        DefDescriptor<InterfaceDef> intf1 = new DefDescriptorImpl<>("markup", "aura", "intf1", InterfaceDef.class);
        DefDescriptor<InterfaceDef> intf2 = new DefDescriptorImpl<>("markup", "aura", "intf2", InterfaceDef.class);
        builder.extendsDescriptors.add(intf1);
        builder.extendsDescriptors.add(intf2);
        InterfaceDef def = builder.build();
        
        // Supers
        Assert.assertEquals("Should have two supers", 2, def.getSupers().size());
        Assert.assertTrue("Supers should contain intf1", def.getSupers().contains(intf1));
        Assert.assertTrue("Supers should contain intf2", def.getSupers().contains(intf2));

        // Dependencies
        Assert.assertEquals("Should have two dependencies", 2, def.getDependencySet().size());
        Assert.assertTrue("dependencies should contain intf1", def.getDependencySet().contains(intf1));
        Assert.assertTrue("dependencies should contain intf2", def.getDependencySet().contains(intf2));
    }

    @Test
    public void testGetEmptySupers() {
        InterfaceDefImpl.Builder builder = new InterfaceDefImpl.Builder();
        builder.setDescriptor(new DefDescriptorImpl<>("markup", "aura", "testinterfacechild", InterfaceDef.class));
        InterfaceDef def = builder.build();
        Assert.assertEquals("Should have no supers", 0, def.getSupers().size());
        Assert.assertEquals("Should have no dependencies", 0, def.getDependencySet().size());
    }

    @Test
    public void testGetSupersWithEventDef() throws Exception {
        InterfaceDefImpl.Builder builder = new InterfaceDefImpl.Builder();
        RegisterEventDef red = Mockito.mock(RegisterEventDef.class);
        builder.events = Maps.newHashMap();
        builder.events.put("red", red);
        InterfaceDef def = builder.build();
        Assert.assertEquals("Should have no supers", 0, def.getSupers().size());
        Assert.assertEquals("Should have no dependencies", 0, def.getDependencySet().size());
        // This is not a very good test.
        Mockito.verify(red, Mockito.times(1)).appendDependencies(Mockito.any());
    }

    @Test
    public void testValidateDefinitionNullDescriptor() throws Exception {
        InterfaceDefImpl.Builder builder = new InterfaceDefImpl.Builder();
        InterfaceDef def = builder.build();
        Exception thrown = null;
        try {
            def.validateDefinition();
        } catch (InvalidDefinitionException expected) {
            thrown = expected;
        }
        Assert.assertNotNull("Should have thrown InvalidDefinitionException for AuraDescriptor<InterfaceDef> being null",
                thrown);
    }
}
