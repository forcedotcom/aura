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
package org.auraframework.throwable.quickfix;

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.service.BuilderService;
import org.auraframework.service.DefinitionService;

/**
 * @since 0.0.171
 */
public class CreateApplicationDefQuickFix extends CreateBaseComponentDefQuickFix {

    public CreateApplicationDefQuickFix(Map<String, Object> attributes) {
        super("Create Application Definition", attributes, Aura.getDefinitionService().getDefDescriptor(
                "auradev:createApplicationDefQuickFix", ComponentDef.class));
    }

    public CreateApplicationDefQuickFix(DefDescriptor<?> descriptor) {
        this(createMap(descriptor));
    }

    @Override
    protected void fix() throws QuickFixException {
        BuilderService builderService = Aura.getBuilderService();
        DefinitionService definitionService = Aura.getDefinitionService();
        String descriptors = (String) getAttributes().get("descriptor");
        String[] split = CreateComponentDefQuickFix.descriptorPattern.split(descriptors);
        for (String descriptor : split) {
            ApplicationDef def = builderService.getApplicationDefBuilder().setDescriptor(descriptor).build();
            definitionService.save(def);

            if (getBooleanAttribute("client.css")) {
                DefDescriptor<ThemeDef> themeDescriptor = definitionService.getDefDescriptor(def.getDescriptor(),
                        "css", ThemeDef.class);
                new CreateThemeDefQuickFix(themeDescriptor).fix();
            }
            resetCache(def.getDescriptor());
        }
    }
}
