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
package org.auraframework.component.ui;

import java.util.HashMap;
import java.util.Map;

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponentProvider;
import org.auraframework.def.ComponentConfigProvider;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.instance.AttributeSet;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Render inputCheckbox, inputRadio and inputSelectOption based on "type"
 * attribute.
 *
 *
 * @since Touch.174.3
 */
@ServiceComponentProvider
public class InputOptionProvider implements ComponentConfigProvider {
	
	@Inject
	ContextService contextService;
	
	@Inject
	DefinitionService definitionService;
	
    @Override
    public ComponentConfig provide() throws QuickFixException {
        BaseComponent<?, ?> component = contextService.getCurrentContext().getCurrentComponent();
        AttributeSet attributes = component.getAttributes();
        ComponentConfig componentConfig = new ComponentConfig();
        DefDescriptor<ComponentDef> defDescriptor = definitionService.getDefDescriptor(COMPONENT_UI_OUTPUTTEXT,
                ComponentDef.class);

        String type = (String) attributes.getValue("type");
        if (TYPE_UI_INPUTCHECKBOX.equalsIgnoreCase(type)) {
            defDescriptor = definitionService.getDefDescriptor(COMPONENT_UI_INPUTCHECKBOX, ComponentDef.class);
        } else if (TYPE_UI_INPUTRADI.equalsIgnoreCase(type)) {
            defDescriptor = definitionService.getDefDescriptor(COMPONENT_UI_INPUTRADIO, ComponentDef.class);
        } else if (TYPE_UI_INPUTSELECTOPTION.equalsIgnoreCase(type)) {
            defDescriptor = definitionService.getDefDescriptor(COMPONENT_UI_INPUTSELECTOPTION, ComponentDef.class);
        } else {
            Map<String, Object> passingAttrs = new HashMap<>();
            passingAttrs.put(VALUE_ATTRIBUTE_NAME, "Error in " + component.getDescriptor().getQualifiedName()
                    + ": invalid type " + type);
            componentConfig.setAttributes(passingAttrs);
        }
        componentConfig.setDescriptor(defDescriptor);
        return componentConfig;
    }

    // component name
    private static final String COMPONENT_UI_INPUTCHECKBOX = "ui:inputCheckbox";
    private static final String COMPONENT_UI_INPUTRADIO = "ui:inputRadio";
    private static final String COMPONENT_UI_INPUTSELECTOPTION = "ui:inputSelectOption";
    private static final String COMPONENT_UI_OUTPUTTEXT = "ui:outputText";

    // type names
    private static final String TYPE_UI_INPUTCHECKBOX = "checkbox";
    private static final String TYPE_UI_INPUTRADI = "radio";
    private static final String TYPE_UI_INPUTSELECTOPTION = "selectOption";

    // attribute name
    public static final String VALUE_ATTRIBUTE_NAME = "value";
}
