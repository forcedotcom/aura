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
import java.util.regex.Pattern;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.service.BuilderService;
import org.auraframework.service.DefinitionService;

/**
 */
public class CreateComponentDefQuickFix extends CreateBaseComponentDefQuickFix {
    static final Pattern descriptorPattern = Pattern.compile("[\\s,;]+");

    public CreateComponentDefQuickFix(Map<String, Object> attributes) {
        super("Create Component Definition", attributes, Aura.getDefinitionService().getDefDescriptor(
                "auradev:createComponentDefQuickFix", ComponentDef.class));
    }

    public CreateComponentDefQuickFix(DefDescriptor<?> descriptor) {
        this(createMap(descriptor));
    }

    @Override
    protected void fix() throws QuickFixException {
        BuilderService builderService = Aura.getBuilderService();
        DefinitionService definitionService = Aura.getDefinitionService();
        String descriptors = (String) getAttributes().get("descriptor");
        String[] split = descriptorPattern.split(descriptors);
        for (String descriptor : split) {
            ComponentDef def = builderService.getComponentDefBuilder().setDescriptor(descriptor).build();
            definitionService.save(def);

            if (getBooleanAttribute("client.css")) {
                DefDescriptor<StyleDef> styleDescriptor = definitionService.getDefDescriptor(def.getDescriptor(),
                        "css", StyleDef.class);
                new CreateStyleDefQuickFix(styleDescriptor).fix();
            }
            resetCache(def.getDescriptor());
        }
    }
}
