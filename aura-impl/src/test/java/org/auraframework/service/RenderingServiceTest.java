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

import java.io.IOException;
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.NoContextException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;

/**
 * @hierarchy Aura.Services.RenderingService
 * @userStory a07B0000000Eb3M
 */
public class RenderingServiceTest extends BaseServiceTest<RenderingService, RenderingServiceTest.Config> implements
        RenderingService {

    private static final long serialVersionUID = 2202770784015045204L;

    public RenderingServiceTest(String name) {
        super(name);
    }

    @Override
    public void render(BaseComponent<?, ?> component, Appendable out) throws QuickFixException, IOException {

        try {
            service.render(component, out);
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
            Component instance = Aura.getInstanceService().getInstance(cmpDesc);
            StringBuilder sb = new StringBuilder();
            service.render(instance, sb);
            goldFileText(sb.toString());

            cmpDesc = Aura.getDefinitionService().getDefDescriptor("test:testJSRenderer", ComponentDef.class);
            instance = Aura.getInstanceService().getInstance(cmpDesc);
            sb = new StringBuilder();
            try {
                service.render(instance, sb);
                fail("Expected an error");
            } catch (AuraRuntimeException e) {
                // good
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            contextService.endContext();
        }
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
