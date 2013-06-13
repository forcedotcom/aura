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
package org.auraframework.throwable.quickfix;

import java.io.Writer;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.Maps;

/**
 * Quick fix for missing attributes on theme defs.
 */
public class CreateThemeAttributeQuickFix extends AuraQuickFix {
    private static final Pattern TAG = Pattern.compile("<aura:theme([^>]*?)>", Pattern.CASE_INSENSITIVE
            | Pattern.MULTILINE);

    public CreateThemeAttributeQuickFix(DefDescriptor<?> descriptor, String name) {
        this(createMap(descriptor, name));
    }

    public CreateThemeAttributeQuickFix(Map<String, Object> attributes) {
        super("Create Theme Attribute", attributes, Aura.getDefinitionService().getDefDescriptor(
                "auradev:createThemeAttributeDefQuickFix", ComponentDef.class));
    }

    private static Map<String, Object> createMap(DefDescriptor<?> descriptor, String name) {
        Map<String, Object> ret = Maps.newHashMap();
        ret.put("descriptor", descriptor);
        ret.put("name", name);
        return ret;
    }

    @Override
    protected void fix() throws Exception {
        String descriptor = (String) getAttributes().get("descriptor");
        String name = (String) getAttributes().get("name");
        String defaultValue = (String) getAttributes().get("defaultValue");
        DefDescriptor<?> desc = Aura.getDefinitionService().getDefDescriptor(descriptor, ThemeDef.class);
        Source<?> source = Aura.getContextService().getCurrentContext().getDefRegistry().getSource(desc);

        if ("".equals(name)) {
            throw new AuraRuntimeException("Cannot leave the field blank");
        }

        if ((AuraTextUtil.validateAttributeName(name)) != true) {
            throw new AuraRuntimeException("Invalid attribute name:'" + name
                    + "', Refer to Auradocs for valid attribute names");
        }

        if (!source.exists()) {
            throw new AuraError("Cannot find source for " + desc.getQualifiedName());
        }

        String s = source.getContents();
        Matcher m = TAG.matcher(s);
        if (m.find()) {
            StringBuilder sb = new StringBuilder(s.length() + 50);
            sb.append(s.subSequence(0, m.end()));
            sb.append("\n    <aura:attribute name=\"");
            sb.append(name);
            sb.append("\" default=\"");
            sb.append(defaultValue);
            sb.append("\"/>\n");
            sb.append(s.substring(m.end() + 1));
            Writer writer = source.getWriter();
            try {
                writer.write(sb.toString());
            } finally {
                writer.close();
            }
        } else {
            throw new AuraError("Could not locate opening tag for " + desc.getQualifiedName());
        }

    }
}
