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
package org.auraframework.renderer;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Renderer;
import org.auraframework.expression.Expression;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 */
public class HtmlRenderer implements Renderer {
    private static final ComponentRenderer componentRenderer = new ComponentRenderer();

    @SuppressWarnings("unchecked")
    @Override
    public void render(BaseComponent<?, ?> component, Appendable out) throws IOException, QuickFixException {
        List<Object> markup = (List<Object>) component.getAttributes().getValue("markup");
        if (markup != null) {
            for (int i = 0; i < markup.size(); i++) {
                Object section = markup.get(i);
                if (section instanceof String) {
                    out.append((String) section);
                } else if (section != null && section instanceof Expression) {
                    section = ((Expression) section).evaluate(component.getAttributes().getValueProvider());

                    if (section != null) {

                        if (section instanceof List) {
                            for (Object obj : (List<?>) section) {
                                if (obj instanceof ComponentDefRef) {
                                    ComponentDefRef cdr = (ComponentDefRef) obj;
                                    for (Component cmp : cdr.newInstance(component.getAttributes().getValueProvider())) {
                                        Aura.getRenderingService().render(cmp, out);
                                    }
                                } else if (obj instanceof Component) {
                                    Aura.getRenderingService().render((Component) obj, out);
                                }
                            }
                        } else {
                            out.append(section.toString());
                        }
                    }
                }
            }
            return;
        }
        String tag = (String) component.getAttributes().getValue("tag");
        String id = component.getLocalId();
        out.append('<');
        out.append(tag);

        Map<DefDescriptor<AttributeDef>, Object> htmlAttributes = (Map<DefDescriptor<AttributeDef>, Object>) component
                .getAttributes().getValue("HTMLAttributes");
        if (htmlAttributes != null) {
            for (Map.Entry<DefDescriptor<AttributeDef>, Object> entry : htmlAttributes.entrySet()) {
                Object value = entry.getValue();
                DefDescriptor<AttributeDef> attDef = entry.getKey();
                if (id != null && "id".equals(attDef.getName())) {
                    //
                    // FIXME: This is an error!
                    // Actually, having an id attribute is very dangerous, and
                    // probably should be disallowed.
                    //
                    continue;
                }
                if (value != null && value instanceof Expression) {
                    value = ((Expression) value).evaluate(component.getAttributes().getValueProvider());
                }
                if (value != null) {
                    out.append(' ');
                    out.append(entry.getKey().getName());
                    out.append('=');
                    out.append('"');
                    out.append(value.toString());
                    out.append('"');
                }
            }
        }

        if (id != null) {
            out.append(" id=\"");
            out.append(component.getLocalId());
            out.append('"');
        }

        List<Component> body = (List<Component>) component.getAttributes().getValue("body");
        if (body != null && body.size() > 0) {
            out.append('>');
            componentRenderer.render(component, out);
            out.append("</");
            out.append(tag);
            out.append('>');
        } else if (tag.equalsIgnoreCase("script") || tag.equalsIgnoreCase("div")) {
            out.append("></");
            out.append(tag);
            out.append('>');
        } else {
            out.append("/>\n");
        }
    }
}
