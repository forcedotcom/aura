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
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;

@Model
public class ExamplesModel {
    List<Map<String, String>> examples = new ArrayList<Map<String, String>>();
    String message;

    public ExamplesModel() throws Exception {
        DefinitionService definitionService = Aura.getDefinitionService();

        String name = (String)Aura.getContextService().getCurrentContext().getCurrentComponent().getAttributes()
                .getValue("name");

        if (name != null && !name.isEmpty()) {
            Set<DefDescriptor<?>> descriptors = definitionService.find(new DescriptorFilter("markup://" + name, DefType.DOCUMENTATION.name()));
            if (descriptors.size() > 0) {
                for (DefDescriptor<?> descriptor : descriptors) {

                    DefType type = descriptor.getDefType();
                    switch (type) {
                    case DOCUMENTATION:
                        Map<String, String> m;
                        
                        try {
                            DocumentationDef docDef = (DocumentationDef)descriptor.getDef();
    
                            Collection<ExampleDef> exampleDefs = docDef.getExampleDefs();
                            
                            
                            for (ExampleDef example : exampleDefs) {
                                m = new TreeMap<String, String>();
                                
                                m.put("label", example.getLabel());
                                m.put("description", example.getDescription());
                                m.put("ref", example.getRef().getDescriptorName());
                                
                                examples.add(m);
                            }
                        } catch (Exception e) {
                            // only display errors in loading DocDefs in dev mode
                            if (Aura.getContextService().getCurrentContext().isDevMode()) {
                                m = new TreeMap<String, String>();
                                m.put("error", e.toString());
                                m.put("descriptor", descriptor.getDescriptorName());
                                examples.add(m);
                            }
                        }
                        
                        break;
                    default: // not including other types in scan
                    }
                }

                if (examples.size() == 0) {
                    message = "This component or application has no examples.";
                }
            } else {
                message = "Example not available";
            }
        }
    }

    @AuraEnabled
    public List<Map<String, String>> getExamples() {
        return examples;
    }

    @AuraEnabled
    public String getMessage() {
        return message;
    }

}
