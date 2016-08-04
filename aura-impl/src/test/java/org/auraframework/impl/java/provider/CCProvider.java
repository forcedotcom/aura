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

import org.auraframework.annotations.Annotations.ServiceComponentProvider;
import org.auraframework.def.ComponentConfigProvider;
import org.auraframework.def.ComponentDef;
import org.auraframework.instance.AttributeSet;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.quickfix.QuickFixException;

import java.util.Map;

import javax.inject.Inject;

@ServiceComponentProvider
@Provider
public class CCProvider implements ComponentConfigProvider {

	@Inject
	ContextService contextService;
	
	@Inject
	DefinitionService definitionService;
	
    @Override
    public ComponentConfig provide() throws QuickFixException {
        ComponentConfig config = new ComponentConfig();
        BaseComponent<?, ?> currentCmp = contextService.getCurrentContext().getCurrentComponent();
        AttributeSet attrs = currentCmp.getAttributes();
        String desc = attrs.getValue("requestDescriptor", String.class);
        if (desc != null) {
            config.setDescriptor(definitionService.getDefDescriptor(desc, ComponentDef.class));
        } else {
        	System.err.println("we are calling CCProvider.provide() without requestDescriptor");//or should we just die?
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> providedAttrs = attrs.getValue("requestAttributes", Map.class);
        if (providedAttrs != null) {
            config.setAttributes(providedAttrs);
        } 
        return config;
    }
}
