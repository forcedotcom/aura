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
package org.auraframework.throwable.quickfix;

import java.io.Writer;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.TypeDef;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.Maps;

/**
 * adds an attribute to a component or interface def
 */
public class CreateAttributeQuickFix extends AuraQuickFix {
    private static final Pattern CMP_TAG = Pattern.compile("<aura:component([^>]*?)>", Pattern.CASE_INSENSITIVE
            | Pattern.MULTILINE);
    private static final Pattern INTF_TAG = Pattern.compile("<aura:interface([^>]*?)>", Pattern.CASE_INSENSITIVE
            | Pattern.MULTILINE);

    /**
     * Create an attribute quick-fix.
     * 
     * @param descriptor the descriptor on which we wish to create the attribute.
     * @param attName the name of the attribute
     */
    public CreateAttributeQuickFix(DefDescriptor<?> descriptor, String attName) {
        this(createMap(descriptor, attName));
    }

    /**
     * Create an attribute quick-fix from a map.
     * 
     * @param attributes A map with 'descriptor', 'attName', and 'intf' set appropriately.
     */
    public CreateAttributeQuickFix(Map<String, Object> attributes) {
        super("Create Attribute", attributes, Aura.getDefinitionService().getDefDescriptor(
                "auradev:createAttributeDefQuickFix", ComponentDef.class));
    }

    /**
     * Create a map of attributes for our descriptor based constructor.
     */
    private static Map<String, Object> createMap(DefDescriptor<?> descriptor, String attName) {
        Map<String, Object> ret = Maps.newHashMap();
        ret.put("descriptor", String.format("%s:%s", descriptor.getNamespace(), descriptor.getName()));
        ret.put("attName", attName);
        ret.put("intf", descriptor.getDefType() == DefType.INTERFACE);
        return ret;
    }

    @Override
    protected void fix() throws Exception {
        String descriptor = (String) getAttributes().get("descriptor");
        String attName = (String) getAttributes().get("attName");
        String type = (String) getAttributes().get("type");
        boolean intf = Boolean.valueOf((String) getAttributes().get("intf"));
        DefDescriptor<?> desc = Aura.getDefinitionService().getDefDescriptor(descriptor,
                intf ? InterfaceDef.class : ComponentDef.class);
        Source<?> source = Aura.getContextService().getCurrentContext().getDefRegistry().getSource(desc);

        // checks for an empty attribute name or type
        if ("".equals(attName) || "".equals(type)) {
            throw new AuraRuntimeException("Cannot leave the field blank");
        }
        // Validates the attribute name
        if ((AuraTextUtil.validateAttributeName(attName)) != true) {
            throw new AuraRuntimeException("Invalid attribute name:'" + attName
                    + "',Refer to Auradocs for valid attribute names");
        }
        // validates the type
        try {
            DefDescriptor<TypeDef> typeDesc = Aura.getDefinitionService().getDefDescriptor(type, TypeDef.class);
            typeDesc.getDef();
        } catch (AuraRuntimeException e) {
            throw new AuraRuntimeException("Invalid attribute type:" + type);
        }

        if (!source.exists()) {
            throw new AuraError("Cannot find source for " + desc.getQualifiedName());
        }
        Pattern p = intf ? INTF_TAG : CMP_TAG;
        String s = source.getContents();
        Matcher m = p.matcher(s);
        if (m.find()) {
            StringBuilder sb = new StringBuilder(s.length() + 50);
            sb.append(s.subSequence(0, m.end()));
            sb.append("\n    <aura:attribute name=\"");
            sb.append(attName);
            sb.append("\" type=\"");
            sb.append(type);
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
