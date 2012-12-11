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

import java.util.Map;
import java.util.regex.Pattern;

import org.w3c.dom.Node;
import com.google.common.collect.Maps;
import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.system.Source;


/**
 * removes an attribute from an xml node
 */
public class RemoveAttributeQuickFix extends AuraXMLQuickFix {

    public RemoveAttributeQuickFix(DefDescriptor<?> descriptor, String attName, String query, Definition def) {
        this(createMap(descriptor, attName, query));
        setDef(def);
    }

    public RemoveAttributeQuickFix(Map<String, Object> attributes) {
       super("Remove Attribute", attributes, Aura.getDefinitionService().getDefDescriptor("auradev:removeAttributeDefQuickFix", ComponentDef.class));
    }

    private static Map<String, Object> createMap(DefDescriptor<?> descriptor, String attName, String query) {
        Map<String, Object> ret = Maps.newHashMap();
        ret.put("descriptor", String.format(descriptor.getQualifiedName()));
        ret.put("attName", attName);
        ret.put("query", query);
        return ret;
    }

    protected String getFix(String tagToFix, String attrName, String attrValue){
        return tagToFix.replaceAll("[ \t]*"+Pattern.quote(attrName)+"[ \t]*=[ \t]*[\'\"]?"+Pattern.quote(attrValue)+"[\'\"]?", "");
    }

    @Override
    protected void fix() throws Exception {
        String descriptor = (String)getAttributes().get("descriptor");
        DefDescriptor<LayoutsDef> desc = Aura.getDefinitionService().getDefDescriptor(descriptor, LayoutsDef.class);
        if(desc != null){
            Source<?> source = getSource(desc);
            setQuery((String)getAttributes().get("query"));
            Node node = findNode(source, getQuery());
            String attrName = (String)getAttributes().get("attName");
            Node attrNode = node.getAttributes().getNamedItem(attrName);
            if(attrNode!=null){
                String attrValue = attrNode.getNodeValue();
                int nodeTagStart = this.getNodeStartCharecterOffset(node);
                int nodeBodyStart = this.getNodeBodyStartCharecterOffset(node);
                String tagToFix = source.getContents().substring(nodeTagStart-1, nodeBodyStart);
                String fix = getFix(tagToFix,attrName,attrValue);
                doFix(source, fix, nodeTagStart, nodeBodyStart);
            }
        }
    }
}
