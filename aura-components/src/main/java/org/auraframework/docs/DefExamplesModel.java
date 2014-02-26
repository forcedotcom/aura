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
package org.auraframework.docs;

import java.util.*;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Component;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.*;
import org.auraframework.throwable.quickfix.QuickFixException;

@Model
public class DefExamplesModel {

    private final List<Component> examples;
    private final List<String> exampleDescriptors;
    private List<Map<String, String>> metadata;

    public DefExamplesModel() throws QuickFixException {
        AuraContext context = Aura.getContextService().getCurrentContext();
        BaseComponent<?, ?> component = context.getCurrentComponent();

        examples = new ArrayList<Component>();
        exampleDescriptors = new ArrayList<String>();
        metadata = new ArrayList<Map<String, String>>();
        
        // TODO: Just grab the DocDef directly, mein.
        
        String desc = (String) component.getAttributes().getValue("descriptor");        
        DefType defType = DefType.valueOf(((String) component.getAttributes().getValue("defType")).toUpperCase());
        DefDescriptor<?> descriptor = Aura.getDefinitionService().getDefDescriptor(desc, defType.getPrimaryInterface());

        Definition definition = descriptor.getDef();
        
        if (definition instanceof RootDefinition) {
            RootDefinition rootDef = (RootDefinition) definition;
            
            DocumentationDef doc = rootDef.getDocumentationDef();
            
            Map<String, ExampleDef> exs = null;
            
            if (doc != null) {
                exs = doc.getExampleDefs();
            }
            
            if (exs != null) {
                for (ExampleDef e : exs.values()) {
                    Map<String, String> map = new HashMap<String, String>();
                    map.put("descriptor", e.getDescriptor().getQualifiedName());
                    map.put("name", e.getName());
                    map.put("label", e.getLabel());
                    map.put("description", e.getDescription());
                    map.put("ref", e.getRef().getDescriptorName());
                    
                    this.metadata.add(map);
                    
//                    exampleDescriptors.add(e.getRef().getDescriptorName());
//                    Component c = Aura.getInstanceService().getInstance(e.getRef());
//                    examples.add(c);
                }
            }
        }
    }

    @AuraEnabled
    public List<Component> getExamples() {
        return this.examples;
    }
    
    @AuraEnabled
    public List<String> getExampleDescriptors() {
        return this.exampleDescriptors;
    }
    
    @AuraEnabled
    public List<Map<String, String>> getMetadata() {
        return this.metadata;
    }
}
