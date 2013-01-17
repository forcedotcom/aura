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
package org.auraframework.impl.root.component;

import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.builder.HtmlDefRefBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.AttributeDefRef;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.HtmlTag;
import org.auraframework.def.optimizer.DefBuilderOptimizer;
import org.auraframework.expression.Expression;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.root.parser.handler.HTMLComponentDefRefHandler;
import org.auraframework.impl.system.DefDescriptorImpl;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;

public class HTMLDefRef extends ComponentDefRefImpl {

    private static final long serialVersionUID = -957235808680675063L;
    // private static final Optimizer optimizer = new Optimizer();

    public static final DefDescriptor<ComponentDef> HTML_DESC = DefDescriptorImpl.getInstance("aura:html",
            ComponentDef.class);

    public HTMLDefRef(Builder builder) {
        super(builder);
    }

    public static class Builder extends ComponentDefRefImpl.Builder implements HtmlDefRefBuilder {

        private final Map<DefDescriptor<AttributeDef>, Object> htmlAttributes = Maps.newHashMap();

        public Builder() {
            this.lockDescriptor(HTML_DESC);
            this.setComponentAttribute("HTMLAttributes", htmlAttributes);
        }

        @Override
        public Builder setTag(String tag) {
            if (!tag.equalsIgnoreCase(HtmlTag.HTML_TAG)) {
                setComponentAttribute("tag", tag);
            }
            return this;
        }

        @Override
        public Builder setComponentAttribute(String key, Object value) {
            AttributeDefRefImpl.Builder valueBuilder = new AttributeDefRefImpl.Builder();
            valueBuilder.setDescriptor(DefDescriptorImpl.getInstance(key, AttributeDef.class));
            valueBuilder.setValue(value);

            AttributeDefRef adr = valueBuilder.build();
            super.setAttribute(adr.getDescriptor(), adr);
            return this;
        }

        @Override
        public Builder setAttribute(DefDescriptor<AttributeDef> key, AttributeDefRef value) {
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
        public ComponentDefRef build() {
            // Builder optimizedBuilder = optimizer.optimize(this);
            return new HTMLDefRef(this);
        }
    }

    protected static class Optimizer implements DefBuilderOptimizer<Builder> {

        @Override
        @SuppressWarnings("unchecked")
        public Builder optimize(Builder builder) {
            DefDescriptor<AttributeDef> bodyDesc = DefDescriptorImpl.getInstance("body", AttributeDef.class);
            DefDescriptor<AttributeDef> tagDesc = DefDescriptorImpl.getInstance("tag", AttributeDef.class);
            DefDescriptor<ComponentDef> textDesc = DefDescriptorImpl.getInstance("aura:text", ComponentDef.class);
            DefDescriptor<ComponentDef> expDesc = DefDescriptorImpl.getInstance("aura:expression", ComponentDef.class);
            AttributeDefRef bodyRef = builder.getAttributeValue(bodyDesc);
            Map<DefDescriptor<AttributeDef>, Object> htmlAttributes = builder.htmlAttributes;
            boolean pureHTML = true;
            if (bodyRef != null) {
                for (ComponentDefRef cdr : (List<ComponentDefRef>) bodyRef.getValue()) {
                    if (cdr.getClass().equals(HTMLDefRef.class)) {
                        if (cdr.getAttributeDefRef("markup") == null) {
                            pureHTML = false;
                            break;
                        }
                    } else if ((!(cdr.getDescriptor().equals(textDesc) || cdr.getDescriptor().equals(expDesc)))
                            || cdr.getLocalId() != null) {
                        pureHTML = false;
                        break;
                    }
                }
            }
            if (builder.getLocalId() != null) {
                pureHTML = false;
            }
            if (pureHTML) {
                Set<String> booleanAttributes = HTMLComponentDefRefHandler.SPECIAL_BOOLEANS;
                for (Map.Entry<DefDescriptor<AttributeDef>, Object> entry : htmlAttributes.entrySet()) {
                    String key = entry.getKey().getName();
                    if (key.toLowerCase().startsWith("on") || key.toLowerCase().equals("href")
                            || booleanAttributes.contains(key.toLowerCase())) {

                        pureHTML = false;
                        break;
                    }
                }
            }

            if (pureHTML) {
                List<Object> markup = Lists.newArrayList();
                String tag = (String) builder.getAttributeValue(tagDesc).getValue();
                add(markup, "<").add(markup, tag);
                if (htmlAttributes != null) {
                    for (Map.Entry<DefDescriptor<AttributeDef>, Object> entry : htmlAttributes.entrySet()) {
                        Object value = entry.getValue();
                        if (value != null) {
                            add(markup, " ").add(markup, entry.getKey().getName()).add(markup, "=").add(markup, "\"");

                            if (value instanceof Expression) {
                                add(markup, value);
                            } else {
                                add(markup, value.toString());
                            }

                            add(markup, "\"");
                        }
                    }
                }

                add(markup, ">");
                if (bodyRef != null) {
                    for (ComponentDefRef cdr : (List<ComponentDefRef>) bodyRef.getValue()) {
                        if (cdr.getClass().equals(HTMLDefRef.class)) {
                            for (Object childMarkup : (List<Object>) cdr.getAttributeDefRef("markup").getValue()) {
                                add(markup, childMarkup);
                            }
                        } else if (cdr.getDescriptor().equals(textDesc)) {
                            add(markup, cdr.getAttributeDefRef("value").getValue());
                        } else if (cdr.getDescriptor().equals(expDesc)) {
                            add(markup, cdr.getAttributeDefRef("value").getValue());
                        }
                    }
                }
                add(markup, "</").add(markup, tag).add(markup, ">");
                builder.clearAttributes();
                builder.setComponentAttribute("markup", markup);
            }
            return builder;
        }

        private Optimizer add(List<Object> markup, Object o) {
            if (o instanceof String && !markup.isEmpty() && markup.get(markup.size() - 1) instanceof String) {
                String last = (String) markup.get(markup.size() - 1);
                markup.set(markup.size() - 1, last + (String) o);
            } else {
                markup.add(o);
            }
            return this;
        }
    }
}
