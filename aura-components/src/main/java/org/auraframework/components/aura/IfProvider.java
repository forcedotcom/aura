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
package org.auraframework.components.aura;

import java.util.*;

import org.auraframework.Aura;
import org.auraframework.def.ComponentConfigProvider;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.instance.*;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Maps;

/**
 * server side provider for if.cmp
 */
@Provider
public class IfProvider implements ComponentConfigProvider {

    @SuppressWarnings("unchecked")
    @Override
    public ComponentConfig provide() throws QuickFixException {
        BaseComponent<?, ?> component = Aura.getContextService().getCurrentContext().getCurrentComponent();
        ComponentConfig cc = new ComponentConfig();
        List<Component> components = new ArrayList<Component>();
        Map<String, Object> m = Maps.newHashMapWithExpectedSize(1);
        m.put("realbody", components);
        cc.setAttributes(m);

        AttributeSet atts = component.getAttributes();
        Object o = atts.getValue("isTrue");
        Boolean isTrue = (Boolean)o;
        List<ComponentDefRef> facet;
        // get body facet if true, else facet if false
        if (isTrue != null && isTrue.booleanValue()) {
            facet = (List<ComponentDefRef>)atts.getValue("body");
            //System.err.println("truth " + component.getGlobalId());
        } else {
            facet = (List<ComponentDefRef>)atts.getValue("else");
            //System.err.println("fiction " + component.getGlobalId());
        }
        if (facet != null) {
            BaseComponent<?,?> vp = atts.getValueProvider();
            for (ComponentDefRef cdr : facet) {
                List<Component> ls = cdr.newInstance(vp);
                if (ls.size() > 1) {
                    throw new AuraRuntimeException("foreach inside of an if doesn't work yet", cdr.getLocation(),
                                                   String.format("globalId=%s", component.getGlobalId()));
                }
                components.addAll(ls);
            }
        }
        return cc;
    }

}
