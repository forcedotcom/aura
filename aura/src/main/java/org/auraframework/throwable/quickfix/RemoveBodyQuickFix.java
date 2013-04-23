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

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.LayoutsDef;
import org.auraframework.system.Source;
import org.w3c.dom.Node;

import com.google.common.collect.Maps;

/**
 * removes a body from an xml node
 */
public class RemoveBodyQuickFix extends AuraXMLQuickFix {

    public RemoveBodyQuickFix(DefDescriptor<?> descriptor, String query, Definition def) {
        this(createMap(descriptor, query));
        setDef(def);
    }

    public RemoveBodyQuickFix(Map<String, Object> attributes) {
        super("Remove Body", attributes, Aura.getDefinitionService().getDefDescriptor("auradev:removeBodyDefQuickFix",
                ComponentDef.class));
    }

    private static Map<String, Object> createMap(DefDescriptor<?> descriptor, String query) {
        Map<String, Object> ret = Maps.newHashMap();
        ret.put("descriptor", String.format(descriptor.getQualifiedName()));
        ret.put("query", query);
        return ret;
    }

    protected String getFix(String tagToFix) {
        return tagToFix.substring(0, tagToFix.length() - 1) + "/>";
    }

    @Override
    protected void fix() throws Exception {
        String descriptor = (String) getAttributes().get("descriptor");
        DefDescriptor<?> desc = Aura.getDefinitionService().getDefDescriptor(descriptor, LayoutsDef.class);
        if (desc != null) {
            Source<?> source = this.getSource(desc);
            setQuery((String) getAttributes().get("query"));
            Node node = findNode(source, getQuery());
            int nodeTagStart = this.getNodeStartCharecterOffset(node);
            int nodeBodyStart = this.getNodeBodyStartCharecterOffset(node);
            int nodeTagEnd = this.getNodeEndCharecterOffset(node);
            if (nodeTagStart < nodeBodyStart && nodeBodyStart < nodeTagEnd) {
                String tagToFix = source.getContents().substring(nodeTagStart - 1, nodeBodyStart);
                String fix = getFix(tagToFix);
                doFix(source, fix, nodeTagStart, nodeTagEnd);
            }
        }
    }
}
