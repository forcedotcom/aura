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
package org.auraframework.impl.root.component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentConfigProvider;
import org.auraframework.instance.AttributeSet;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.instance.InstanceStack;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;

/**
 * server side provider for if.cmp
 */
@Provider
public class IfProvider implements ComponentConfigProvider {

    @Override
    public ComponentConfig provide() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        BaseComponent<?, ?> component = context.getCurrentComponent();
        InstanceStack iStack = context.getInstanceStack();
        ComponentConfig cc = new ComponentConfig();
        List<Component> components = new ArrayList<Component>();
        Map<String, Object> m = Maps.newHashMapWithExpectedSize(1);
        m.put("body", components);
        cc.setAttributes(m);

        AttributeSet atts = component.getAttributes();
        m.put("template", atts.getValue("body"));
        Object o = atts.getValue("isTrue");
        Boolean isTrue = (Boolean) o;
        ComponentDefRefArrayImpl facet;
        // get body facet if true, else facet if false
        if (isTrue != null && isTrue.booleanValue()) {
            facet = (ComponentDefRefArrayImpl) atts.getValue("body");
        } else {
            facet = (ComponentDefRefArrayImpl) atts.getValue("else");
        }
        if (facet != null) {
            iStack.setAttributeName("body");
            components.addAll(facet.newInstance(atts.getValueProvider()));
            iStack.clearAttributeName("body");
        }
        return cc;
    }

}
