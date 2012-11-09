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
package org.auraframework.impl;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.context.AuraRegistryProviderImpl;
import org.auraframework.impl.system.DefFactoryImpl;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.*;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import com.google.common.collect.Sets;

/**
 * Tests for DefinitionServiceImpl.
 *
 *
 * @since 0.0.178
 */
public class DefinitionServiceImplTest extends AuraImplTestCase {
    public DefinitionServiceImplTest(String name) {
        super(name);
        shouldSetupContext = false;
    }

    @Override
    public void tearDown() throws Exception {
        Aura.getContextService().endContext();
        super.tearDown();
    }

    /**
     * ContextService.assertAccess is called during getDefinition(DefDescriptor).
     */
    public void testGetDefinition_DefDescriptor_assertAccess() throws Exception {
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Access.PUBLIC);
        DefDescriptor<ComponentDef> desc = addSource("<aura:component></aura:component>", ComponentDef.class);
        try {
            Aura.getDefinitionService().getDefinition(desc);
            fail("Expected NoAccessException from assertAccess");
        } catch (NoAccessException e) {}
    }

    /**
     * ContextService.assertAccess is called during getDefinition(String, Class).
     */
    public void testGetDefinition_StringClass_assertAccess() throws Exception {
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Access.PUBLIC);
        DefDescriptor<ComponentDef> desc = addSource("<aura:component></aura:component>", ComponentDef.class);
        try {
            Aura.getDefinitionService().getDefinition(desc.getName(), ComponentDef.class);
            fail("Expected NoAccessException from assertAccess");
        } catch (NoAccessException e) {}
    }

    /**
     * ContextService.assertAccess is called during getDefinition(String, DefType...).
     */
    public void testGetDefinition_StringDefType_assertAccess() throws Exception {
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Access.PUBLIC);
        DefDescriptor<ComponentDef> desc = addSource("<aura:component></aura:component>", ComponentDef.class);
        try {
            Aura.getDefinitionService().getDefinition(desc.getName(), DefType.COMPONENT);
            fail("Expected NoAccessException from assertAccess");
        } catch (NoAccessException e) {}
    }

    /**
     * ContextService.assertAccess is called during save(Definition).
     */
    public void testSave_assertAccess() throws Exception {
        Aura.getContextService().startContext(Mode.DEV, Format.HTML, Access.PUBLIC);
        ComponentDef def = addSource("<aura:component></aura:component>", ComponentDef.class).getDef();
        Aura.getContextService().endContext();
        Aura.getContextService().startContext(Mode.PROD, Format.HTML, Access.PUBLIC);
        try {
            Aura.getDefinitionService().save(def);
            fail("Expected NoAccessException from assertAccess");
        } catch (NoAccessException e) {}
    }
    /**
     * DefinitionService.getLastMod() accepts a collection of descriptors and gives the last modified time of the group.
     * It can accept wild characters in descriptor name.
     */
    public void testGetLastMod() throws Exception{
        Aura.getContextService().startContext(Mode.DEV, Format.HTML, Access.PUBLIC);
        DefDescriptor<ComponentDef> def;
        //1. Handle non existing defs
        def = definitionService.getDefDescriptor("markup://string:fooBar", ComponentDef.class);
        assertEquals("Expected to see 0 when searching for non existing defs.", 0,
                     Aura.getDefinitionService().getLastMod(def));
        //3. Handle non existing namespace
        try{
            Aura.getDefinitionService().getNamespaceLastMod(Sets.newHashSet("foo"));
            fail("Should not be able to specify non existing namespace");
        }catch(AuraRuntimeException e){
            assertEquals("Loader not found for markup://foo", e.getMessage());
         }
        //4. Just a wild character

        DefDescriptor<ComponentDef> matcher = definitionService.getDefDescriptor("markup://*", ComponentDef.class);
        assertEquals(0, Aura.getDefinitionService().getLastMod(matcher));

        //5. Non existing def as reference
        this.addSource(String.format(baseComponentTag, "controller='js://string.barr'" ,""), ComponentDef.class);
        try{
            Aura.getDefinitionService().getNamespaceLastMod(Sets.newHashSet("string"));
            fail("Cannot find last mod when definitions are uncompilable.");
        }catch (DefinitionNotFoundException e){
            assertEquals("No CONTROLLER named js://string.barr found", e.getMessage());
        }

        /** TODO W-1312125
         * This throws a UnsupportedOperationException. We should restrict the usage of getLastMod() to just ApplicationDef and ComponentDef
         * This can be done by just changing the signature of the function to public <D extends RootDefinition> long getLastMod()
        * Collection<DefDescriptor<TypeDef>> typeMatchers = Lists.newArrayList();
        * typeMatchers.add(definitionService.getDefDescriptor("java://java.lang.String", TypeDef.class));
        * assertEquals(0 , Aura.getDefinitionService().getLastMod(typeMatchers));
        */

        //6. Defs with null location
        DefDescriptor<TypeDef> td = definitionService.getDefDescriptor("test://foo.bar", TypeDef.class);
        assertEquals(0, Aura.getDefinitionService().getLastMod(td));
    }

    /**
     * Test find(String) using regex's and look in different DefRegistry's for results.
     */
    public void testFindRegex() throws Exception {
        Aura.getContextService().startContext(Mode.DEV, Format.HTML, Access.PUBLIC);

        String baseContents = "<aura:application></aura:application>";
        addSource("houseboat", baseContents, ApplicationDef.class);
        addSource("houseparty", baseContents, ApplicationDef.class);
        addSource("pantsparty", baseContents, ApplicationDef.class);

        // Test wildcards
        assertEquals("find() fails with wildcard as prefix", 1, definitionService.find("*://string:houseboat").size());
        assertEquals("find() fails with wildcard as namespace", 1, definitionService.find("markup://*:houseboat").size());
        assertEquals("find() fails with wildcard as name", 1, definitionService.find("markup://string:houseboat").size());
        assertEquals("find() fails with wildcard at end of name", 2, definitionService.find("markup://string:house*").size());
        assertEquals("find() fails with wildcard at beginning of name", 
                2, definitionService.find("markup://string:*party").size());
        assertEquals("find() should not find nonexistent name with preceeding wildcard",
                0, definitionService.find("markup://string:*notherecaptain").size());

        // Look in NonCachingDefRegistry
        assertEquals("find() should find a single component", 1, definitionService.find("markup://ui:outputNumber").size());
        assertEquals("find() fails with wildcard as prefix", 3, definitionService.find("*://ui:outputNumber").size());
        assertEquals("find() is finding non-existent items", 0, definitionService.find("markup://ui:doesntexist").size());

        // Look in AuraStaticTypeDefRegistry (StaticDefRegistry)
        assertEquals("find() fails looking in StaticDefRegistry", 1, definitionService.find("aura://*:String").size());
        // Look in AuraStaticControllerDefRegistry (StaticDefRegistry)
        assertEquals("find() fails looking in StaticDefRegistry", 1, definitionService.find("aura://*:ComponentController").size());
        assertEquals("find() is finding non-existent items", 0, definitionService.find("aura://*:doesntexist").size());

        // Find css
        // This always returns 0 results - W-1426841
        //assertEquals("find() fails with wildcard as prefix", 1, definitionService.find("css://test.themeTest").size());
    }

    public static class AuraTestRegistryProviderWithNulls extends AuraRegistryProviderImpl {

        @Override
        public DefRegistry<?>[] getRegistries(Mode mode, Access access, Set<SourceLoader> extraLoaders) {
            return new DefRegistry<?>[]{
              createDefRegistry(new TestTypeDefFactory(), DefType.TYPE, "test")
            };
        }
        public static class TestTypeDefFactory extends DefFactoryImpl<TypeDef>{

            @Override
            public TypeDef getDef(DefDescriptor<TypeDef> descriptor) throws QuickFixException {
                return new TestTypeDef(descriptor, null);
            }

            @Override
            public Set<DefDescriptor<TypeDef>> find(DefDescriptor<TypeDef> matcher) {
                Set<DefDescriptor<TypeDef>> ret = new HashSet<DefDescriptor<TypeDef>>();
                ret.add(Aura.getDefinitionService().getDefDescriptor("test://foo.bar1", TypeDef.class));
                ret.add(Aura.getDefinitionService().getDefDescriptor("test://foo.bar2", TypeDef.class));
                ret.add(Aura.getDefinitionService().getDefDescriptor("test://foo.bar3", TypeDef.class));
                return ret;
            }
        }

        public static class TestTypeDef extends DefinitionImpl<TypeDef> implements TypeDef{
            private static final long serialVersionUID = 1L;

            public TestTypeDef(DefDescriptor<TypeDef> descriptor, Object object) {
                super(descriptor, null);
            }

            @Override
            public void serialize(Json json) throws IOException {
            }

            @Override
            public Object valueOf(Object stringRep) {
                return null;
            }

            @Override
            public Object wrap(Object o) {
                return null;
            }

            @Override
            public Object getExternalType(String prefix) throws QuickFixException {
                return null;
            }

            @Override
            public Object initialize(Object config, BaseComponent<?, ?> valueProvider) throws QuickFixException {
                return null;
            }

            @Override
            public void appendDependencies(Object instance, Set<DefDescriptor<?>> deps) throws QuickFixException {

            }

            @Override
            public void appendDependencies(Set<DefDescriptor<?>> dependencies) throws QuickFixException {
                dependencies.add(Aura.getDefinitionService().getDefDescriptor("test://foo.barA", TypeDef.class));
                dependencies.add(Aura.getDefinitionService().getDefDescriptor("test://foo.barB", TypeDef.class));
                dependencies.add(Aura.getDefinitionService().getDefDescriptor("test://foo.barC", TypeDef.class));
            }
        }

    }
}
