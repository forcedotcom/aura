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
package org.auraframework.impl.java.provider;

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.ComponentConfigProvider;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;

/**
 * A class to test a variety of scenarios for the concrete component with
 * provider.
 */
@Provider
public class ConcreteProvider implements ComponentConfigProvider {
    /**
     * A demonstration of broken Java generics.
     */
    private Object getMagicDescriptor() {
        return DefDescriptorImpl.getInstance("test:fakeApplication", ApplicationDef.class);
    }

    @Override
    public ComponentConfig provide() throws QuickFixException {
        ComponentConfig config = new ComponentConfig();

        BaseComponent<?, ?> component = Aura.getContextService().getCurrentContext().getCurrentComponent();
        String whatToDo = (String) component.getAttributes().getExpression("whatToDo");
        if (whatToDo.equalsIgnoreCase("label")) {
            Map<String, Object> attrs = Maps.newHashMap();
            attrs.put("name", "Null Returned");
            config.setAttributes(attrs);
        } else if (whatToDo.equalsIgnoreCase("replace")) {
            config.setDescriptor(DefDescriptorImpl.getInstance("test:test_Provider_Concrete_Sub", ComponentDef.class));
        } else if (whatToDo.equalsIgnoreCase("replaceBad")) {
            @SuppressWarnings("unchecked")
            DefDescriptor<ComponentDef> foo = (DefDescriptor<ComponentDef>) getMagicDescriptor();

            config.setDescriptor(foo);
        } else if (whatToDo.equalsIgnoreCase("replaceNotFound")) {
            config.setDescriptor(DefDescriptorImpl.getInstance("test:test_Provider_Concrete_Sub_NotHere",
                    ComponentDef.class));
        }
        return config;
    }
}
