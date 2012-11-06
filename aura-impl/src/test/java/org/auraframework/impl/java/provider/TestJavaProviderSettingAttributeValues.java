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

import java.util.HashMap;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 */

@Provider
public class TestJavaProviderSettingAttributeValues {
    public static DefDescriptor<ComponentDef> provide(){
        return DefDescriptorImpl.getInstance("test:testJavaProviderSettingAttributeValuesHelper", ComponentDef.class);
    }

    public static Map<String, Object> provideAttributes() throws QuickFixException{
        Map<String, Object> attributes = new HashMap<String, Object>();
        attributes.put("a1", "a1Provider");
        attributes.put("a2", null);
        attributes.put("b1", "b1Provider");
        attributes.put("ar1", new String[]{"ar1Provider0", "ar1Provider1"});

        BaseComponent<?,?> component = Aura.getContextService().getCurrentContext().getCurrentComponent();

        if(component.getAttributes().getValue("a3") != null){
            attributes.put("b2", "b2Provider");
        }

        return attributes;
    }
}
