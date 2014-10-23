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

import org.auraframework.Aura;
import org.auraframework.def.ApplicationDef;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentConfigProvider;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TypeDef;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.component.ComponentDefImpl;
import org.auraframework.impl.root.component.ComponentDefImpl.Builder;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.system.AuraContext;
import org.auraframework.system.MasterDefRegistry;
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
        } else if (whatToDo.equalsIgnoreCase("provideTestModelParentCmp")) {
            config.setDescriptor(DefDescriptorImpl.getInstance("auratest:test_Model_Parent",
                    ComponentDef.class));
        } else if (whatToDo.equalsIgnoreCase("mockRecordLayout")) {
        	//this is the mimic of recordLayoutProvider. 
        	//being used by DynamicnamespaceUITest and PreloadNameSpaceHttpTest.testDynamicNamespace
            String hash = "HASH";
            String hashName = String.format("layout://%s_%s_%s_%s_%s:c", "rl",
                    "001", "VIEW", "ACCOUNT", hash);
            DefDescriptor<ComponentDef> hashedDescriptor = DefDescriptorImpl.getInstance(hashName,
                    ComponentDef.class);
            Builder builder = new ComponentDefImpl.Builder();
            builder.setDescriptor(hashedDescriptor);
            //set up attribute definitions. we don't need "whatToDo" any more, but the build still require it
            Map<DefDescriptor<AttributeDef>, AttributeDef> attributeDefs = new HashMap<>();
            DefDescriptor<TypeDef> type = DefDescriptorImpl.getInstance("String", TypeDef.class);
            attributeDefs.put(DefDescriptorImpl.getInstance("whatToDo", AttributeDef.class), new AttributeDefImpl(
                    DefDescriptorImpl.getInstance("whatToDo", AttributeDef.class), null, type, null, true,
                    AttributeDef.SerializeToType.BOTH, null, null));
			builder.attributeDefs = attributeDefs;
            ComponentDef cmpDef = builder.build();
            AuraContext context = Aura.getContextService().getCurrentContext();
            //add dynamic namespace to MasterDefRegistry so later we can getDef from it during the injectComponent();
            MasterDefRegistry mdr = context.getDefRegistry();
            mdr.addLocalDef(cmpDef);
            config.setDescriptor(cmpDef.getDescriptor());
        }
        return config;
    }
}
