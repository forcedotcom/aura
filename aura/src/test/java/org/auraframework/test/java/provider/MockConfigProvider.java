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
package org.auraframework.test.java.provider;

import java.util.Iterator;
import java.util.Map;

import org.auraframework.annotations.Annotations.ServiceComponentProvider;
import org.auraframework.def.ComponentConfigProvider;
import org.auraframework.def.ComponentDef;
import org.auraframework.instance.Attribute;
import org.auraframework.instance.AttributeSet;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;

import javax.inject.Inject;

@ServiceComponentProvider
public class MockConfigProvider implements ComponentConfigProvider {

	@Inject
	ContextService contextService;
	
	@Inject
	DefinitionService definitionService;
	
    @Override
    public ComponentConfig provide() throws QuickFixException {
        BaseComponent<?, ?> component = contextService.getCurrentContext().getCurrentComponent();
        
        ComponentConfig config = new ComponentConfig();
        config.setDescriptor(definitionService.getDefDescriptor("markup://ui:outputText", ComponentDef.class)); 
        String text = (String)component.getAttributes().getValue("providedAttribute");
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("value", text);
        config.setAttributes(attributes);
        
        //Tamper the current component and remove unwanted attributes
        removeAttribute(component, "providedAttribute");
        return config;
    }
    
    static void removeAttribute(BaseComponent<?,?> component, String name) throws QuickFixException {
        if (component != null) {
            AttributeSet componentAttributes = component.getAttributes();
            if (componentAttributes.getValue(name) != null) {
                Iterator<Attribute> iterator = componentAttributes.iterator();
                while (iterator.hasNext()) {
                    Attribute attribute = iterator.next();
                    if (attribute.getName().equalsIgnoreCase(name)) {
                        iterator.remove();
                        break;
                    }
                }
            }
        }
    }
}
