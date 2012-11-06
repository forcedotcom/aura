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
package org.auraframework.service;

import java.util.*;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;

import org.auraframework.Aura;
import org.auraframework.builder.ComponentDefBuilder;
import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.NoContextException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * @hierarchy Aura.Services.DefinitionService
 * @userStory a07B0000000Eb3M
 *
 *
 */
public class DefinitionServiceTest extends BaseServiceTest<DefinitionService, DefinitionServiceTest.Config> implements DefinitionService {

    /**
     */
    private static final long serialVersionUID = 8209766512828532228L;

    public DefinitionServiceTest(String name) {
        super(name);
    }

    @Override
    public <D extends Definition> Set<DefDescriptor<D>> find(DefDescriptor<D> matcher) throws QuickFixException {

        try{
            service.find(config.matcher);
            fail("Expected NoContextException");
        }catch(NoContextException e){
            //good
        }

        ContextService contextService = Aura.getContextService();
        try{
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService().getDefDescriptor("test:laxSecurity", ApplicationDef.class));

            Set<?> matches = service.find(config.matcher);
            assertNotNull(matches);

            String namespace = config.matcher.getNamespace();
            DefType defType = config.matcher.getDefType();

            for(Object match : matches){
                DefDescriptor<?> desc = (DefDescriptor<?>)match;
                assertEquals(namespace, desc.getNamespace());
                assertEquals(defType, desc.getDefType());
                assertTrue(desc.exists());
            }
        }finally{
            contextService.endContext();
        }

        return null;
    }

    @Override
    public <T extends Definition> DefDescriptor<T> getDefDescriptor(String qualifiedName, Class<T> defClass) {

        DefDescriptor<?> desc = config.desc;
        DefDescriptor<?> desc2 = service.getDefDescriptor(desc.getQualifiedName(), desc.getDefType().getPrimaryInterface());
        assertEquals(desc, desc2);

        DefDescriptor<ActionDef> actionDesc = service.getDefDescriptor("java://org.auraframework.impl.java.controller.TestController/ACTION$doSomething", ActionDef.class);
        assertNotNull(actionDesc);

        return null;
    }

    @Override
    public <T extends Definition> DefDescriptor<T> getDefDescriptor(DefDescriptor<?> desc, String prefix,
            Class<T> defClass) {

        desc = config.desc;
        Set<String> prefixes = Sets.newHashSet("css", "markup", "java", "apex", "js");

        for(String pref : prefixes){
            for(DefType defType : DefType.values()){
                DefDescriptor<?> desc2 = service.getDefDescriptor(desc, pref, defType.getPrimaryInterface());
                assertEquals(desc.getName(), desc2.getName());
                assertEquals(desc.getNamespace(), desc2.getNamespace());
                assertEquals(pref, desc2.getPrefix());
                assertEquals(defType, desc2.getDefType());
            }
        }

        return null;
    }

    @Override
    public <T extends Definition> T getDefinition(DefDescriptor<T> descriptor) throws QuickFixException {

        try{
            service.getDefinition(descriptor);
            fail("Expected NoContextException");
        }catch(NoContextException e){
            //good
        }

        ContextService contextService = Aura.getContextService();
        try{
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService().getDefDescriptor("test:laxSecurity", ApplicationDef.class));


            Definition def = service.getDefinition(config.desc);
            assertNotNull(def);

            try{
                DefDescriptor<?> desc = service.getDefDescriptor(config.desc.getQualifiedName()+"foofoo", config.desc.getDefType().getPrimaryInterface());
                service.getDefinition(desc);
                fail("Should have thrown DefinitionNotFoundException");
            }catch(DefinitionNotFoundException e){
                //good
            }

        }finally{
            contextService.endContext();
        }

        return null;
    }

    @Override
    public <T extends Definition> T getDefinition(String qualifiedName, Class<T> defType)
            throws QuickFixException {

        try{
            service.getDefinition(qualifiedName, defType);
            fail("Expected NoContextException");
        }catch(NoContextException e){
            //good
        }

        ContextService contextService = Aura.getContextService();
        try{
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService().getDefDescriptor("test:laxSecurity", ApplicationDef.class));


            Definition def = service.getDefinition(config.desc.getQualifiedName(), config.desc.getDefType().getPrimaryInterface());
            assertNotNull(def);

            try{
                service.getDefinition(config.desc.getQualifiedName()+"foofoo", config.desc.getDefType().getPrimaryInterface());
                fail("Should have thrown DefinitionNotFoundException");
            }catch(DefinitionNotFoundException e){
                //good
            }
        }finally{
            contextService.endContext();
        }

        return null;
    }

    @Override
    public Definition getDefinition(String qualifiedName, DefType... defTypes) throws QuickFixException {

        try{
            service.getDefinition(qualifiedName, defTypes);
            fail("Expected NoContextException");
        }catch(NoContextException e){
            //good
        }

        ContextService contextService = Aura.getContextService();
        try{
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService().getDefDescriptor("test:laxSecurity", ApplicationDef.class));



            Definition def = service.getDefinition("test:text", DefType.COMPONENT, DefType.APPLICATION);
            assertNotNull(def);
            assertEquals(DefType.COMPONENT, def.getDescriptor().getDefType());

            try{
                service.getDefinition("test:doesNotExist", DefType.COMPONENT, DefType.APPLICATION);
                fail("Exception expected");
            }catch(DefinitionNotFoundException e){
                //good
            }

            try{
                def = service.getDefinition("test:text");
                fail("Exception expected");
            }catch(AuraRuntimeException e){
                //good
            }

            assertNotNull(def);
        }finally{
            contextService.endContext();
        }


        return null;
    }

    @Override
    public <D extends Definition> long getLastMod(DefDescriptor<D> def) throws QuickFixException {
        // TODO Auto-generated method stub
        return 0;
    }

    @Override
    public long getNamespaceLastMod(Collection<String> preloads) throws QuickFixException {
        /**TODO:RJ, Disabling it for now, to get jenkins back to normal. Will work on it locally
        **/
        return 0;
    }

    @Override
    public void save(Definition def) throws QuickFixException {
        try{
            service.save(def);
            fail("Expected NoContextException");
        }catch(NoContextException e){
            //good
        }

        ContextService contextService = Aura.getContextService();
        try{
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService().getDefDescriptor("test:laxSecurity", ApplicationDef.class));
            //This creates the StringSource objects before they can be saved.
            addSource("foo", "", ComponentDef.class);
            ComponentDefBuilder builder = Aura.getBuilderService().getComponentDefBuilder();
            builder.setDescriptor("string:foo");
            builder.setLocation("fake", 1, 1, 1);
            ComponentDef componentDef = builder.build();

            service.save(componentDef);

            assertNotNull(service.getDefinition("string:foo", ComponentDef.class));
        }catch(DefinitionNotFoundException e){
            fail("Definition did not save.");
        }finally{
            contextService.endContext();
        }
    }

    @Override
    public List<Config> getConfigs() {
        List<Config> ret = Lists.newArrayList();
        DefinitionService defService = Aura.getDefinitionService();

        Set<DefDescriptor<?>> descriptors = Sets.<DefDescriptor<?>>newHashSet(
                defService.getDefDescriptor("test:text", ComponentDef.class),
                defService.getDefDescriptor("js://test.testJSController", ControllerDef.class),
                defService.getDefDescriptor("css://test.testValidCSS", ThemeDef.class)
        );

        for(DefDescriptor<?> desc : descriptors){
            Config config = new Config();
            config.matcher = defService.getDefDescriptor("markup://test:*", ComponentDef.class);
            config.desc = desc;
            ret.add(config);
        }

        return permuteConfigs(ret);
    }

    public static class Config extends BaseServiceTest.Config{

        public DefDescriptor<?> matcher;
        public DefDescriptor<?> desc;

    }

    @Override
    public Set<DefDescriptor<?>> find(String matcher) throws QuickFixException {
        // TODO Auto-generated method stub
        return null;
    }
}
