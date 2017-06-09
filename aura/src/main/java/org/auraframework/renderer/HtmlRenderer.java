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
package org.auraframework.renderer;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Random;

import javax.inject.Inject;

import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.annotations.Annotations.ServiceComponentRenderer;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.Renderer;
import org.auraframework.def.RootDefinition;
import org.auraframework.expression.Expression;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.instance.Instance;
import org.auraframework.service.ContextService;
import org.auraframework.service.CSPInliningService;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.RenderingService;
import org.auraframework.system.RenderContext;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 */
@ServiceComponentRenderer
public class HtmlRenderer implements Renderer {

    @Inject
    RenderingService renderingService;

    @Inject
    ConfigAdapter configAdapter;

    @Inject
    ContextService contextService;

    @Inject
    DefinitionService definitionService;

    @Inject
    CSPInliningService inliningService;

    @SuppressWarnings("unchecked")
    @Override
    public void render(BaseComponent<?, ?> component, RenderContext rc) throws IOException, QuickFixException {
        String tag = (String) component.getAttributes().getValue("tag");
        String id = component.getLocalId();
        List<Component> body = (List<Component>) component.getAttributes().getValue("body");
        boolean script = (tag != null && tag.equals("script") && body != null && body.size() > 0);
        String scriptBody = "";

        if (script) {
            int numParens = new Random().nextInt(128) + 1;
            boolean lockerRequired = false;
            String namespace = "";
            Instance<?> parent = component.getLexicalParent();
            if (parent != null) {
                Definition def = definitionService.getDefinition(parent.getDescriptor());
                namespace = def.getDescriptor().getNamespace();
                lockerRequired = configAdapter.isLockerServiceEnabled() && configAdapter.requireLocker((RootDefinition) def);
            }

            rc.pushScript();
            if (lockerRequired) {
                // if inline.js and framework are already loaded then we must be in the auraPreInitBlock so run immediately
                // otherwise save the script to be run after necessary bootstrap files are loaded on client
                rc.getCurrent().append(
                        "(function(customerJs, namespace) {\n" +
                        "    window.Aura || (window.Aura = {});\n" +
                        "    Aura.inlineJsLocker || (Aura.inlineJsLocker = []);\n" +
                        "    if(Aura.inlineJsReady && Aura.frameworkJsReady) {\n" +
                        "        $A.lockerService.runScript(customerJs, namespace);\n" +
                        "    } else {\n" +
                        "        Aura.inlineJsLocker.push({namespace: namespace, callback: customerJs});\n" +
                        "    }\n" +
                        "})"
                );
                for (int i = 0; i < numParens; i++) {
                    rc.getCurrent().append("(");
                }
                rc.getCurrent().append(
                        "(function(){"
                );
            }

            for (Component nested: body) {
                renderingService.render(nested, rc);
            }

            if (lockerRequired) {
                rc.getCurrent().append(
                        "}"
                );
                for (int i = 0; i < numParens; i++) {
                    rc.getCurrent().append(")");
                }
                rc.getCurrent().append(
                        ", '" + namespace + "');\n"
                );
            }
            if (rc.popScript() || !inliningService.isSupported()){
                //we are still within a script block
                return;
            }

            scriptBody = rc.getCurrentScript();
            inliningService.processScript(scriptBody);
        }
        Appendable out = rc.getCurrent();
        if (tag.equalsIgnoreCase("script") && inliningService.isSupported()){
            inliningService.preScriptAppend(out);
        }
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

                    String v = value.toString();
                    if (v.startsWith("/auraFW") ) {
                    	String contextPath = Aura.getContextService().getCurrentContext().getContextPath();
                    	if(!contextPath.isEmpty()) {
                    		// prepend any Aura resource urls with servlet context path
                    		v = contextPath + v;
                    	}
                    }

                    out.append(' ');
                    out.append(entry.getKey().getName());
                    out.append('=');
                    out.append('"');
                    out.append(v);
                    out.append('"');
                }
            }
        }

        if (id != null) {
            out.append(" id=\"");
            out.append(component.getLocalId());
            out.append('"');
        }

        if (body != null && body.size() > 0 && !tag.equalsIgnoreCase("script")) {
            out.append('>');
            for (Component nested : body) {
                renderingService.render(nested, rc);
            }
            out.append("</");
            out.append(tag);
            out.append('>');
        } else if (tag.equalsIgnoreCase("script")){
            inliningService.writeInlineScriptAttributes(out);
            out.append(String.format(">%s</%s>", scriptBody, tag));
        } else if (tag.equalsIgnoreCase("div")) {
            out.append("></");
            out.append(tag);
            out.append('>');
        } else {
            out.append("/>\n");
        }
    }
}
