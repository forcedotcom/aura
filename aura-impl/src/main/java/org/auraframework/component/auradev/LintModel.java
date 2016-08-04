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
package org.auraframework.component.auradev;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

import org.auraframework.annotations.Annotations.ServiceComponentModelInstance;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.def.RootDefinition;
import org.auraframework.ds.servicecomponent.ModelInstance;
import org.auraframework.impl.validation.ValidationEngine;
import org.auraframework.impl.validation.ValidationUtil;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.util.validation.ValidationError;

@ServiceComponentModelInstance
public class LintModel implements ModelInstance {
    List<Map<String, String>> errors = new ArrayList<>();
    String message;

    public LintModel(ContextService contextService, DefinitionService definitionService) throws Exception {
        String name = (String) contextService.getCurrentContext().getCurrentComponent().getAttributes()
                .getValue("name");

        if (name != null && !name.isEmpty()) {
            Set<DefDescriptor<?>> descriptors = definitionService.find(new DescriptorFilter("markup://" + name));
            if (descriptors.size() > 0) {
                for (DefDescriptor<?> descriptor : descriptors) {

                    DefType type = descriptor.getDefType();
                    switch (type) {
                    case COMPONENT:
                    case APPLICATION:
                    case INTERFACE:

                        try {
                            Definition definition = definitionService.getDefinition(descriptor);

                            if (definition instanceof RootDefinition) {
                                List<DefDescriptor<?>> deps = ((RootDefinition) definition).getBundle();
                                ValidationEngine validationEngine = new ValidationEngine();
                                for (DefDescriptor<?> dep : deps) {
                                    if (dep.getPrefix().equals(DefDescriptor.JAVASCRIPT_PREFIX)) {
                                        List<ValidationError> ret = validationEngine.validate(dep);
                                        ValidationUtil.trimFilenames(ret);
                                        for (ValidationError error : ret) {
                                            Map<String, String> m = new TreeMap<>();
                                            String comp = descriptor.getNamespace() + ':' + descriptor.getName();
                                            m.put("CompName", comp);
                                            m.put("ErrorMessage", error.toString());
                                            errors.add(m);
                                        }
                                    }
                                }
                            }
                        } catch (Exception e) {
                            Map<String, String> m = new TreeMap<>();
                            m.put("CompName", descriptor.getQualifiedName());
                            m.put("ErrorMessage", "Exception while loading Definition: " + e.getMessage());
                            errors.add(m);
                        }

                        break;
                    default: // not including other types in scan
                    }
                }

                if (errors.size() == 0) {
                    message = "Congrats, no linting issue found!";
                }
            }
            else {
                message = "Nothing found using given  Descriptor Filter (via 'name' attribute). Check for typo and try again!";
            }
        }
    }

    @AuraEnabled
    public List<Map<String, String>> getErrors() {
        return errors;
    }

    @AuraEnabled
    public String getMessage() {

        return message;
    }

}
