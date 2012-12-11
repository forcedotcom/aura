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
package org.auraframework.component.ui;

import com.google.common.base.Joiner;
import com.google.common.collect.ImmutableMap;
import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDescriptorProvider;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Determine which type of listView column implementation to render, based on type attribute
 *
 * Currently supports 'Checkbox', 'Email', 'Header', 'Html', 'Index', 'Link', 'Text' (default), or a namespaced component, eg. ns:CustomColumn
 */
@Provider
public class ListViewColumnProvider implements ComponentDescriptorProvider {
    // attribute name
    private static final String TYPE_ATTRIBUTE = "type";

    // permissible types
    private static final ImmutableMap<String, String> typeMap = new ImmutableMap.Builder<String, String>()
            .put("Checkbox", "ui:listViewColumnCheckbox")
            .put("Email",    "ui:listViewColumnEmail")
            .put("Header",   "ui:listViewColumnHeader")
            .put("Html",     "ui:listViewColumnHtml")
            .put("Index",    "ui:listViewColumnIndex")
            .put("Link",     "ui:listViewColumnLink")
            .put("Text",     "ui:listViewColumnCell")
            .put("",         "ui:listViewColumnCell")
            .build();

    @Override
    public DefDescriptor<ComponentDef> provide() throws QuickFixException {
        BaseComponent<?,?> component = Aura.getContextService().getCurrentContext().getCurrentComponent();
        String type=(String)component.getAttributes().getValue(TYPE_ATTRIBUTE);
        if (type == null) {
            type = "";
        }
        String typeDescriptor=type.contains(":")?type:typeMap.get(type);
        if(typeDescriptor!=null){
            return DefDescriptorImpl.getInstance(typeDescriptor, ComponentDef.class);
        }
        throw new AuraRuntimeException("Unknown type attribute specified for ui:listViewColumn '" + type + "'. Remove the type attribute, or use one of the following values: '"+ Joiner.on("', '").join(typeMap.keySet())+"', or any namespaced component descriptor, e.g. ns:CustomColumn.");
    }
}
