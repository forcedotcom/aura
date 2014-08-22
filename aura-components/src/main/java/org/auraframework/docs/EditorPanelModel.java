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

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.IncludeDefRef;
import org.auraframework.def.LibraryDef;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 */
@Model
public class EditorPanelModel {

    private final String code;
    private final String format;

    public EditorPanelModel() throws QuickFixException {

        AuraContext context = Aura.getContextService().getCurrentContext();
        BaseComponent<?, ?> component = context.getCurrentComponent();

        String desc = (String) component.getAttributes().getValue("descriptor");
        DefType defType = DefType.valueOf(((String) component.getAttributes().getValue("defType")).toUpperCase());
        
        DefDescriptor<? extends Definition> descriptor = null;
        if (defType != DefType.INCLUDE) {
            // Nominal case:
            descriptor = Aura.getDefinitionService().getDefDescriptor(desc, defType.getPrimaryInterface());
        } else {
            // Include case: since included .js files load source differently we have to manually
            // look up the include defs. If there is a usecase for looking up the defs in a non-doc 
            // setting, a lookup method should be added to the includeDef class.
            String name = (String) component.getAttributes().getValue("includeDefName");
            DefDescriptor<? extends LibraryDef> library = Aura.getDefinitionService().getDefDescriptor(
                desc, LibraryDef.class
            );
            
            for (IncludeDefRef includeDef : library.getDef().getIncludes()) {
               if (includeDef.getName().equals(name)) {
                   descriptor = includeDef.getDescriptor();
               }
            }
        }

        Source<?> source = context.getDefRegistry().getSource(descriptor);
        if (source != null && source.exists()) {
            code = source.getContents();
            format = String.valueOf(source.getFormat());
        } else {
            code = null;
            format = null;
        }
    }

    /**
     * @return Returns the code.
     */
    @AuraEnabled
    public String getCode() {
        return this.code;
    }

    /**
     * @return Returns the format.
     */
    @AuraEnabled
    public String getFormat() {
        return this.format;
    }
}
