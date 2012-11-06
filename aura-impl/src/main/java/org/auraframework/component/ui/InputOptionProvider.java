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
package org.auraframework.component.ui;

import java.util.HashMap;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.*;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Render inputCheckbox, inputRadio and inputSelectOption based on "type" attribute.
 *
 *
 * @since Touch.174.3
 */
@Provider
public class InputOptionProvider {
    public static ComponentConfig provide() throws QuickFixException {
        BaseComponent<?,?> component = Aura.getContextService().getCurrentContext().getCurrentComponent();
        AttributeSet attributes = component.getAttributes();
        ComponentConfig componentConfig = new ComponentConfig();
        DefDescriptor<ComponentDef> defDescriptor = DefDescriptorImpl.getInstance(COMPONENT_UI_OUTPUTTEXT, ComponentDef.class);

        String type = (String)attributes.getValue("type");
        if (TYPE_UI_INPUTCHECKBOX.equalsIgnoreCase(type)) {
            defDescriptor = DefDescriptorImpl.getInstance(COMPONENT_UI_INPUTCHECKBOX, ComponentDef.class);
        } else if (TYPE_UI_INPUTRADI.equalsIgnoreCase(type)) {
            defDescriptor = DefDescriptorImpl.getInstance(COMPONENT_UI_INPUTRADIO, ComponentDef.class);
        } else if (TYPE_UI_INPUTSELECTOPTION.equalsIgnoreCase(type)) {
            defDescriptor = DefDescriptorImpl.getInstance(COMPONENT_UI_INPUTSELECTOPTION, ComponentDef.class);
        } else {
            Map<String, Object> passingAttrs = new HashMap<String, Object>();
            passingAttrs.put(VALUE_ATTRIBUTE_NAME,
                    "Error in " + component.getDescriptor().getQualifiedName() + ": invalid type " + type);
            componentConfig.setAttributes(passingAttrs);
        }
        componentConfig.setDescriptor(defDescriptor);
        return componentConfig;
    }

    //component name
    private static final String COMPONENT_UI_INPUTCHECKBOX = "ui:inputCheckbox";
    private static final String COMPONENT_UI_INPUTRADIO = "ui:inputRadio";
    private static final String COMPONENT_UI_INPUTSELECTOPTION = "ui:inputSelectOption";
    private static final String COMPONENT_UI_OUTPUTTEXT = "ui:outputText";

    //type names
    private static final String TYPE_UI_INPUTCHECKBOX = "checkbox";
    private static final String TYPE_UI_INPUTRADI = "radio";
    private static final String TYPE_UI_INPUTSELECTOPTION = "selectOption";

    // attribute name
    public static final String VALUE_ATTRIBUTE_NAME = "value";
}
