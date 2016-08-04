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
package org.auraframework.impl.java.provider;

import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponentProvider;
import org.auraframework.def.ComponentConfigProvider;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Testing Java Provider used in component provider:settingAttributesComponentConfigProvider
 */

@ServiceComponentProvider
@Provider
public class TestSettingAttributesComponentConfigProvider implements ComponentConfigProvider {
    @Inject
    private ContextService contextService;

    @Inject
    private DefinitionService definitionService;

    @Override
    public ComponentConfig provide() throws QuickFixException {
        ComponentConfig config = new ComponentConfig();
        DefDescriptor<ComponentDef> cmpDefDesc = definitionService.getDefDescriptor(
                "provider:settingComponentAttributesInComponentConfigProviderImpl", ComponentDef.class);
        config.setDescriptor(cmpDefDesc);

        Map<String, Object> attributes = new HashMap<>();
        attributes.put("stringValue", "String from Java provider");
        attributes.put("numberValue", 123);
        attributes.put("nullValue", null);
        attributes.put("arrayValue", new String[] { "val1", "val2" });

        // setting stringValue attribute as the value on abstract component can be used in provide()
        BaseComponent<?, ?> component = contextService.getCurrentContext().getCurrentComponent();
        Object existingValue = component.getAttributes().getValue("existingValue");
        if (existingValue != null && existingValue.toString().equals("existing string value")) {
            attributes.put("stringValue", existingValue);
        }

        config.setAttributes(attributes);
        return config;
    }
}
