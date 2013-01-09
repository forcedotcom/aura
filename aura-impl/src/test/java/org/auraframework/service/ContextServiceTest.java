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
import java.util.Set;

import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.NoContextException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;

/**
 * @hierarchy Aura.Services.ContextService
 * @userStory a07B0000000Eb3M
 */
public class ContextServiceTest extends BaseServiceTest<ContextService, ContextServiceTest.Config> implements
        ContextService {
    private static final long serialVersionUID = 6488992999239427778L;

    public ContextServiceTest(String name) {
        super(name);
    }

    @Override
    public List<Config> getConfigs() {
        List<Config> ret = Lists.newArrayList(new Config());
        return permuteConfigs(ret);
    }

    @Override
    public void endContext() {
        try {
            assertNull(service.getCurrentContext());
            service.startContext(config.mode, config.format, config.access);
            AuraContext context = service.getCurrentContext();
            assertNotNull(context);
        } finally {
            service.endContext();
            assertNull(service.getCurrentContext());
            service.endContext();
            assertNull(service.getCurrentContext());
        }
    }

    @Override
    public AuraContext getCurrentContext() {
        try {
            assertNull(service.getCurrentContext());
            service.startContext(config.mode, config.format, config.access);
            AuraContext context = service.getCurrentContext();
            assertNotNull(context);
            assertEquals(context.getMode(), config.mode);
            assertEquals(context.getFormat(), config.format);
            assertEquals(context.getAccess(), config.access);
            service.startContext(config.mode, config.format, null);
            AuraContext context2 = service.getCurrentContext();
            assertNotSame(context, context2);
            assertNull(context2.getAccess());
        } finally {
            service.endContext();
        }
        assertNull(service.getCurrentContext());

        return null;
    }

    @Override
    public boolean isEstablished() {
        assertFalse(getService().isEstablished());
        try {
            service.startContext(config.mode, config.format, config.access);
            assertTrue(service.isEstablished());
        } finally {
            service.endContext();
        }
        assertFalse(getService().isEstablished());

        return false;
    }

    @Override
    public AuraContext startContext(Mode mode, Format format, Access access) {
        try {
            assertNull(service.getCurrentContext());
            service.startContext(config.mode, config.format, config.access);
            AuraContext context = service.getCurrentContext();
            assertNotNull(context);
            assertEquals(context.getMode(), config.mode);
            assertEquals(context.getFormat(), config.format);
            assertEquals(context.getAccess(), config.access);
        } finally {
            service.endContext();
        }

        return null;
    }

    @Override
    public AuraContext startContext(Mode mode, Set<SourceLoader> loaders, Format format, Access access)
            throws QuickFixException {
        StringSourceLoader loader = StringSourceLoader.getInstance();
        DefDescriptor<ComponentDef> desc = null;
        try {
            desc = loader.addSource(ComponentDef.class, "<aura:component/>", null).getDescriptor();

            assertNull(service.getCurrentContext());
            service.startContext(config.mode, config.format, config.access);
            AuraContext context = service.getCurrentContext();
            assertNotNull(context);
            assertEquals(context.getMode(), config.mode);
            assertEquals(context.getFormat(), config.format);
            assertEquals(context.getAccess(), config.access);
            ComponentDef def = context.getDefRegistry().getDef(desc);
            assertNotNull(def);
            assertEquals(desc, def.getDescriptor());
        } finally {
            service.endContext();
            loader.removeSource(desc);
        }

        return null;
    }

    @Override
    public void assertEstablished() {
        try {
            service.assertEstablished();
            fail("NoContextException should have been thrown");
        } catch (NoContextException e) {
            // Expected
        }
        service.startContext(config.mode, config.format, config.access);
        service.assertEstablished();
        service.endContext();

        try {
            service.assertEstablished();
            fail("NoContextException should have been thrown");
        } catch (NoContextException e) {
            // Expected
        }

    }

    public static class Config extends BaseServiceTest.Config {
    }

    @Override
    public void assertAccess(DefDescriptor<?> desc) {
    }

    @Override
    public AuraContext startContext(Mode mode, Format format, Access access,
            DefDescriptor<? extends BaseComponentDef> appDesc) {
        return null;
    }

    @Override
    public AuraContext startContext(Mode mode, Set<SourceLoader> loaders, Format format, Access access,
            DefDescriptor<? extends BaseComponentDef> appDesc) throws QuickFixException {
        return null;
    }
}
