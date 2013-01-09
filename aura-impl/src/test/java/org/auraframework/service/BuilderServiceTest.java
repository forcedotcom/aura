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

import org.auraframework.Aura;
import org.auraframework.builder.ApplicationDefBuilder;
import org.auraframework.builder.ComponentDefBuilder;
import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.builder.ThemeDefBuilder;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.BaseComponentDef.RenderType;
import org.auraframework.def.BaseComponentDef.WhitespaceBehavior;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;

/**
 * @hierarchy Aura.Services.BuilderService
 * @userStory a07B0000000Eb3M
 */
public class BuilderServiceTest extends BaseServiceTest<BuilderService, BuilderServiceTest.Config> implements
        BuilderService {

    /**
     */
    private static final long serialVersionUID = 2631495357220899537L;

    public BuilderServiceTest(String name) {
        super(name);
    }

    @Override
    public ApplicationDefBuilder getApplicationDefBuilder() throws QuickFixException {
        ApplicationDefBuilder builder = service.getApplicationDefBuilder();
        assertNotNull(builder);
        builder.setAbstract(config.isAbstract);
        builder.setAccess(config.access);
        builder.setDescriptor(config.appDescriptor);
        builder.setExtensible(config.extensible);
        builder.setLocation(config.filename, config.line, config.col, config.lastMod);
        builder.setRenderType(config.renderType);

        ApplicationDef def = builder.build();
        assertNotNull(def);
        assertEquals(config.appDescriptor, def.getDescriptor());
        assertEquals(config.isAbstract, def.isAbstract());
        assertEquals(config.access, def.getAccess().name());
        assertEquals(config.extensible, def.isExtensible());

        verifyLocation(def.getLocation());

        assertEquals(config.renderType, def.getRender());

        return null;
    }

    @Override
    public ComponentDefBuilder getComponentDefBuilder() throws QuickFixException {
        ComponentDefBuilder builder = service.getComponentDefBuilder();
        assertNotNull(builder);
        builder.setAbstract(config.isAbstract);
        builder.setDescriptor(config.cmpDescriptor);
        builder.setExtensible(config.extensible);
        builder.setLocation(config.filename, config.line, config.col, config.lastMod);
        builder.setRenderType(config.renderType);

        ComponentDef def = builder.build();
        assertNotNull(def);
        assertEquals(config.cmpDescriptor, def.getDescriptor());
        assertEquals(config.isAbstract, def.isAbstract());
        assertEquals(config.extensible, def.isExtensible());

        verifyLocation(def.getLocation());

        assertEquals(config.renderType, def.getRender());

        return null;
    }

    @Override
    public ComponentDefRefBuilder getComponentDefRefBuilder() throws QuickFixException {
        ComponentDefRefBuilder builder = service.getComponentDefRefBuilder();
        builder.setDescriptor(config.cmpDescriptor);
        builder.setLocation(config.filename, config.line, config.col, config.lastMod);

        ComponentDefRef defRef = builder.build();
        assertNotNull(defRef);
        assertEquals(config.cmpDescriptor, defRef.getDescriptor());

        verifyLocation(defRef.getLocation());

        return null;
    }

    private void verifyLocation(Location location) {
        assertNotNull(location);
        assertEquals(location.getColumn(), config.col);
        assertEquals(location.getLine(), config.line);
        assertEquals(location.getFileName(), config.filename);
        assertEquals(location.getLastModified(), config.lastMod);
    }

    @Override
    public ThemeDefBuilder getThemeDefBuilder() throws QuickFixException {
        ThemeDefBuilder builder = service.getThemeDefBuilder();
        builder.setDescriptor(config.themeDescriptor);
        builder.setLocation(config.filename, config.line, config.col, config.lastMod);

        ThemeDef def = builder.build();
        assertNotNull(def);
        verifyLocation(def.getLocation());

        return null;
    }

    @Override
    public List<Config> getConfigs() {
        List<String> descs = Lists.newArrayList("test:foo");
        List<Boolean> booleans = Lists.newArrayList(true, false);

        List<Config> ret = Lists.newArrayList();

        for (String desc : descs) {
            for (Boolean isAbstract : booleans) {
                for (Access access : Access.values()) {
                    for (Boolean extensible : booleans) {
                        for (RenderType renderType : RenderType.values()) {
                            for (WhitespaceBehavior whitespaceBehavior : WhitespaceBehavior.values()) {
                                String name = "config" + ret.size();
                                Config config = new Config(name, desc);
                                config.isAbstract = isAbstract;
                                config.access = access.name();
                                config.extensible = extensible;
                                config.renderType = renderType;
                                config.whitespaceBehavior = whitespaceBehavior;
                                ret.add(config);
                            }
                        }
                    }
                }
            }
        }

        return ret;
    }

    public static class Config extends BaseServiceTest.Config {

        public final DefDescriptor<ApplicationDef> appDescriptor;
        public final DefDescriptor<ComponentDef> cmpDescriptor;
        public final DefDescriptor<ThemeDef> themeDescriptor;
        public boolean isAbstract;
        public String access;
        public boolean extensible;
        public int col = 10;
        public int line = 20;
        public String filename = "tmp";
        public long lastMod = System.currentTimeMillis();
        public RenderType renderType;
        public WhitespaceBehavior whitespaceBehavior;

        protected Config(String name, String desc) {
            super();
            DefinitionService defService = Aura.getDefinitionService();
            this.appDescriptor = defService.getDefDescriptor(desc, ApplicationDef.class);
            this.cmpDescriptor = defService.getDefDescriptor(desc, ComponentDef.class);
            this.themeDescriptor = defService.getDefDescriptor(this.cmpDescriptor, "css", ThemeDef.class);
        }

    }

}
