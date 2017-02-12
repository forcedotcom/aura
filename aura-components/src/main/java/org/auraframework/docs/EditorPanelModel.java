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

import org.auraframework.annotations.Annotations.ServiceComponentModelInstance;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.instance.BaseComponent;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.AuraContext;
import org.auraframework.system.Source;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.ds.servicecomponent.ModelInstance;

/**
 */
@ServiceComponentModelInstance
public class EditorPanelModel implements ModelInstance {

    private final String code;
    private final String format;

    public EditorPanelModel(ContextService contextService, DefinitionService definitionService) throws QuickFixException {

        AuraContext context = contextService.getCurrentContext();
        BaseComponent<?, ?> component = context.getCurrentComponent();

        String desc = (String) component.getAttributes().getValue("descriptor");
        DefType defType = DefType.valueOf(((String) component.getAttributes().getValue("defType")).toUpperCase());

        // TODO descriptor for js files in libraries needs to be changed to include its parent
        if (defType == DefType.INCLUDE) {
            code = null;
            format = null;
        } else {
            // Nominal case:
            DefDescriptor<? extends Definition> descriptor = definitionService.getDefDescriptor(desc, defType.getPrimaryInterface());
            Source<?> source = definitionService.getSource(descriptor);
            if (source != null && source instanceof TextSource) {
                TextSource<?> textsource = (TextSource<?>)source;
                code = textsource.getContents();
                format = String.valueOf(textsource.getFormat());
            } else {
                code = null;
                format = null;
            }
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
