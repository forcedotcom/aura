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

import java.util.Map;

import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HtmlTag;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.AuraContext;

import com.google.common.collect.Maps;

public class HTMLDefRefBuilderImpl extends ComponentDefRefImpl.Builder {

    public static final DefDescriptor<ComponentDef> HTML_DESC =
        new DefDescriptorImpl<>("markup", "aura", "html", ComponentDef.class);

    private final Map<DefDescriptor<AttributeDef>, Object> htmlAttributes = Maps.newHashMap();

    public HTMLDefRefBuilderImpl() {
        this.lockDescriptor(HTML_DESC);
        this.setComponentAttribute("HTMLAttributes", htmlAttributes);
    }

    public HTMLDefRefBuilderImpl setTag(String tag) {
        if (!tag.equalsIgnoreCase(HtmlTag.HTML_TAG)) {
            setComponentAttribute("tag", tag);
        }
        return this;
    }

    public HTMLDefRefBuilderImpl setComponentAttribute(String key, Object value) {
        AttributeDefRefImpl.Builder valueBuilder = new AttributeDefRefImpl.Builder();
        valueBuilder.setDescriptor(new DefDescriptorImpl<>(null, null, key, AttributeDef.class));
        valueBuilder.setValue(value);
        valueBuilder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
        AttributeDefRef adr = valueBuilder.build();
        super.setAttribute(adr.getDescriptor(), adr);
        return this;
    }

    @Override
    public HTMLDefRefBuilderImpl setAttribute(DefDescriptor<AttributeDef> key, AttributeDefRef value) {
        //
        // Automatically push system attributes up to the component
        // attributes.
        //
        if ("aura".equalsIgnoreCase(key.getNamespace())) {
            super.setAttribute(key, value);
        } else if ("tag".equalsIgnoreCase(key.getName())) {
            setComponentAttribute(key.getName(), value.getValue());
        } else {
            //
            // FIXME: we should warn about non-null namespaces.
            //
            htmlAttributes.put(key, value.getValue());
        }
        return this;
    }

    @Override
    public ComponentDefRefBuilder setFlavor(Object flavor) {
       throw new UnsupportedOperationException("Cannot set flavor on an html tag");
    }

    @Override
    public ComponentDefRef build() {
        return new ComponentDefRefImpl(this);
    }
}
