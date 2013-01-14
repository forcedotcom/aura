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

import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ActionDef;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.RendererDef;
import org.auraframework.instance.Action;
import org.auraframework.instance.Application;
import org.auraframework.instance.Component;
import org.auraframework.instance.Instance;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.NoContextException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

/**
 * @hierarchy Aura.Services.InstanceService
 * @userStory a07B0000000Eb3M
 */
public class InstanceServiceTest extends BaseServiceTest<InstanceService, InstanceServiceTest.Config> implements
        InstanceService {

    private static final long serialVersionUID = 2254271986212533647L;

    public InstanceServiceTest(String name) {
        super(name);
    }

    @Override
    public <T extends Instance<D>, D extends Definition> T getInstance(DefDescriptor<D> descriptor)
            throws DefinitionNotFoundException, QuickFixException {

        try {
            service.getInstance(descriptor);
            fail("Expected NoContextException");
        } catch (NoContextException e) {
            // good
        }

        ContextService contextService = Aura.getContextService();
        try {
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService()
                    .getDefDescriptor("test:laxSecurity", ApplicationDef.class));
            DefDescriptor<ComponentDef> cmpDesc = Aura.getDefinitionService().getDefDescriptor("test:text",
                    ComponentDef.class);
            Component instance = service.getInstance(cmpDesc);
            assertNotNull(instance);
        } finally {
            contextService.endContext();
        }

        return null;
    }

    @Override
    public <T extends Instance<D>, D extends Definition> T getInstance(DefDescriptor<D> descriptor,
            Map<String, Object> attributes) throws QuickFixException {

        try {
            service.getInstance(descriptor, attributes);
            fail("Expected NoContextException");
        } catch (NoContextException e) {
            // good
        }

        ContextService contextService = Aura.getContextService();
        try {
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService()
                    .getDefDescriptor("test:laxSecurity", ApplicationDef.class));

            attributes = Maps.newConcurrentMap();
            attributes.put("value", "foo");

            // Try a component
            DefDescriptor<ComponentDef> cmpDesc = Aura.getDefinitionService().getDefDescriptor("test:text",
                    ComponentDef.class);
            Component instance = service.getInstance(cmpDesc, attributes);
            assertNotNull(instance);
            assertEquals("foo", instance.getAttributes().getValue("value"));

            // Try an application
            DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                    "test:fakeApplication", ApplicationDef.class);
            Application app = service.getInstance(appDesc, attributes);
            assertNotNull(app);
            assertEquals("foo", app.getAttributes().getValue("value"));

            // Try an action
            DefDescriptor<ActionDef> actionDesc = Aura.getDefinitionService().getDefDescriptor(
                    "java://org.auraframework.impl.java.controller.TestController/ACTION$doSomething", ActionDef.class);
            Action action = service.getInstance(actionDesc, null);
            assertNotNull(action);

            // Try a renderer

            DefDescriptor<RendererDef> rendererDesc = Aura.getDefinitionService().getDefDescriptor("js://foo.bar",
                    RendererDef.class);
            try {
                service.getInstance(rendererDesc, null);
                fail("Expected exception");
            } catch (AuraRuntimeException e) {
                // good
            }

        } finally {
            contextService.endContext();
        }

        return null;
    }

    @Override
    public <T extends Instance<D>, D extends Definition> T getInstance(D definition)
            throws DefinitionNotFoundException, QuickFixException {

        try {
            service.getInstance(definition);
            fail("Expected NoContextException");
        } catch (NoContextException e) {
            // good
        }

        ContextService contextService = Aura.getContextService();
        try {
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService()
                    .getDefDescriptor("test:laxSecurity", ApplicationDef.class));

            // Try a component
            DefDescriptor<ComponentDef> cmpDesc = Aura.getDefinitionService().getDefDescriptor("test:text",
                    ComponentDef.class);
            Component instance = service.getInstance(cmpDesc.getDef());
            assertNotNull(instance);

            // Try an application
            DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                    "test:fakeApplication", ApplicationDef.class);
            Application app = service.getInstance(appDesc.getDef());
            assertNotNull(app);

            // Try an action
            DefDescriptor<ActionDef> actionDesc = Aura.getDefinitionService().getDefDescriptor(
                    "java://org.auraframework.impl.java.controller.TestController/ACTION$doSomething", ActionDef.class);
            Action action = service.getInstance(actionDesc.getDef());
            assertNotNull(action);

            // Try a renderer
            DefDescriptor<RendererDef> rendererDesc = Aura.getDefinitionService().getDefDescriptor("js://aura.html",
                    RendererDef.class);
            try {
                service.getInstance(rendererDesc.getDef());
                fail("Expected exception");
            } catch (AuraRuntimeException e) {
                // good
            }

        } finally {
            contextService.endContext();
        }

        return null;
    }

    @Override
    public <T extends Instance<D>, D extends Definition> T getInstance(D definition, Map<String, Object> attributes)
            throws DefinitionNotFoundException, QuickFixException {

        try {
            service.getInstance(definition, attributes);
            fail("Expected NoContextException");
        } catch (NoContextException e) {
            // good
        }

        ContextService contextService = Aura.getContextService();
        try {
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService()
                    .getDefDescriptor("test:laxSecurity", ApplicationDef.class));

            attributes = Maps.newConcurrentMap();
            attributes.put("value", "foo");

            // Try a component
            DefDescriptor<ComponentDef> cmpDesc = Aura.getDefinitionService().getDefDescriptor("test:text",
                    ComponentDef.class);
            Component instance = service.getInstance(cmpDesc.getDef(), attributes);
            assertNotNull(instance);
            assertEquals("foo", instance.getAttributes().getValue("value"));

            // Try an application
            DefDescriptor<ApplicationDef> appDesc = Aura.getDefinitionService().getDefDescriptor(
                    "test:fakeApplication", ApplicationDef.class);
            Application app = service.getInstance(appDesc.getDef(), attributes);
            assertNotNull(app);
            assertEquals("foo", app.getAttributes().getValue("value"));

            // Try an action
            DefDescriptor<ActionDef> actionDesc = Aura.getDefinitionService().getDefDescriptor(
                    "java://org.auraframework.impl.java.controller.TestController/ACTION$doSomething", ActionDef.class);
            Action action = service.getInstance(actionDesc.getDef(), null);
            assertNotNull(action);

            // Try a renderer

            DefDescriptor<RendererDef> rendererDesc = Aura.getDefinitionService().getDefDescriptor("js://aura.html",
                    RendererDef.class);
            try {
                service.getInstance(rendererDesc.getDef(), null);
                fail("Expected exception");
            } catch (AuraRuntimeException e) {
                // good
            }

        } finally {
            contextService.endContext();
        }

        return null;
    }

    @Override
    public <T extends Instance<D>, D extends Definition> T getInstance(String qualifiedName, Class<D> defClass)
            throws DefinitionNotFoundException, QuickFixException {

        try {
            service.getInstance(qualifiedName, defClass);
            fail("Expected NoContextException");
        } catch (NoContextException e) {
            // good
        }

        ContextService contextService = Aura.getContextService();
        try {
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService()
                    .getDefDescriptor("test:laxSecurity", ApplicationDef.class));

            // Try a component
            Component instance = service.getInstance("test:text", ComponentDef.class);
            assertNotNull(instance);

            // Try an application
            Application app = service.getInstance("test:fakeApplication", ApplicationDef.class);
            assertNotNull(app);

            // Try an action
            Action action = service.getInstance(
                    "java://org.auraframework.impl.java.controller.TestController/ACTION$doSomething", ActionDef.class);
            assertNotNull(action);

            // Try a renderer
            try {
                service.getInstance("js://aura.html", RendererDef.class);
                fail("Expected exception");
            } catch (AuraRuntimeException e) {
                // good
            }

        } finally {
            contextService.endContext();
        }

        return null;
    }

    @Override
    public <T extends Instance<D>, D extends Definition> T getInstance(String qualifiedName, Class<D> defClass,
            Map<String, Object> attributes) throws DefinitionNotFoundException, QuickFixException {

        try {
            service.getInstance(qualifiedName, defClass);
            fail("Expected NoContextException");
        } catch (NoContextException e) {
            // good
        }

        ContextService contextService = Aura.getContextService();
        try {
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService()
                    .getDefDescriptor("test:laxSecurity", ApplicationDef.class));

            attributes = Maps.newConcurrentMap();
            attributes.put("value", "foo");

            // Try a component
            Component instance = service.getInstance("test:text", ComponentDef.class, attributes);
            assertNotNull(instance);
            assertEquals("foo", instance.getAttributes().getValue("value"));

            // Try an application
            Application app = service.getInstance("test:fakeApplication", ApplicationDef.class, attributes);
            assertNotNull(app);
            assertEquals("foo", app.getAttributes().getValue("value"));

            // Try an action
            Action action = service.getInstance(
                    "java://org.auraframework.impl.java.controller.TestController/ACTION$doSomething", ActionDef.class,
                    null);
            assertNotNull(action);

            // Try a renderer
            try {
                service.getInstance("js://aura.html", RendererDef.class, null);
                fail("Expected exception");
            } catch (AuraRuntimeException e) {
                // good
            }

        } finally {
            contextService.endContext();
        }

        return null;
    }

    @Override
    public Instance<?> getInstance(String qualifiedName, DefType... defTypes) throws DefinitionNotFoundException,
            QuickFixException {

        try {
            service.getInstance(qualifiedName, defTypes);
            fail("Expected NoContextException");
        } catch (NoContextException e) {
            // good
        }

        ContextService contextService = Aura.getContextService();
        try {
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService()
                    .getDefDescriptor("test:laxSecurity", ApplicationDef.class));

            // Try a component
            Component instance = (Component) service.getInstance("test:text", DefType.COMPONENT, DefType.APPLICATION);
            assertNotNull(instance);

            // Try an application
            Application app = (Application) service.getInstance("test:fakeApplication", DefType.COMPONENT,
                    DefType.APPLICATION);
            assertNotNull(app);

            // Try an action
            Action action = (Action) service.getInstance(
                    "java://org.auraframework.impl.java.controller.TestController/ACTION$doSomething",
                    DefType.COMPONENT, DefType.ACTION);
            assertNotNull(action);

            // Try a renderer
            try {
                service.getInstance("js://aura.html", DefType.RENDERER, DefType.STYLE);
                fail("Expected exception");
            } catch (AuraRuntimeException e) {
                // good
            }

        } finally {
            contextService.endContext();
        }

        return null;
    }

    @Override
    public Instance<?> getInstance(String qualifiedName, Map<String, Object> attributes, DefType... defTypes)
            throws DefinitionNotFoundException, QuickFixException {

        try {
            service.getInstance(qualifiedName, attributes, defTypes);
            fail("Expected NoContextException");
        } catch (NoContextException e) {
            // good
        }

        ContextService contextService = Aura.getContextService();
        try {
            contextService.startContext(config.mode, config.format, config.access, Aura.getDefinitionService()
                    .getDefDescriptor("test:laxSecurity", ApplicationDef.class));

            attributes = Maps.newConcurrentMap();
            attributes.put("value", "foo");

            // Try a component
            Component instance = (Component) service.getInstance("test:text", attributes, DefType.COMPONENT,
                    DefType.APPLICATION);
            assertNotNull(instance);
            assertEquals("foo", instance.getAttributes().getValue("value"));

            // Try an application
            Application app = (Application) service.getInstance("test:fakeApplication", attributes, DefType.COMPONENT,
                    DefType.APPLICATION);
            assertNotNull(app);
            assertEquals("foo", app.getAttributes().getValue("value"));

            // Try an action
            Action action = (Action) service.getInstance(
                    "java://org.auraframework.impl.java.controller.TestController/ACTION$doSomething", attributes,
                    DefType.COMPONENT, DefType.ACTION);
            assertNotNull(action);

            // Try a renderer
            try {
                service.getInstance("js://aura.html", attributes, DefType.RENDERER, DefType.STYLE);
                fail("Expected exception");
            } catch (AuraRuntimeException e) {
                // good
            }

        } finally {
            contextService.endContext();
        }

        return null;
    }

    @Override
    public List<Config> getConfigs() {
        List<Config> ret = Lists.newArrayList();

        Config config = new Config();
        ret.add(config);
        return permuteConfigs(ret);
    }

    public static class Config extends BaseServiceTest.Config {
    }

}
