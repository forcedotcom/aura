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

import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.RootDefinition;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Model;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;

/**
 */
@Model
public class TopicExampleModel {

    private final List<DefModel> defs = Lists.newArrayList();

    @SuppressWarnings("unchecked")
    public TopicExampleModel() throws QuickFixException {

        AuraContext context = Aura.getContextService().getCurrentContext();
        BaseComponent<?, ?> component = context.getCurrentComponent();

        String desc = (String) component.getAttributes().getValue("descriptor");

        DefType defType = DefType.valueOf(((String) component.getAttributes().getValue("defType")).toUpperCase());
        DefDescriptor<? extends RootDefinition> descriptor = (DefDescriptor<? extends RootDefinition>) Aura
                .getDefinitionService().getDefDescriptor(desc, defType.getPrimaryInterface());

        Definition def = descriptor.getDef();

        defs.add(new DefModel(descriptor));

        if (def instanceof RootDefinition) {
            List<DefDescriptor<?>> deps = ((RootDefinition) def).getBundle();

            for (DefDescriptor<?> dep : deps) {
                defs.add(new DefModel(dep));
            }
        }
    }

    @AuraEnabled
    public List<DefModel> getDefs() {
        return defs;
    }
}
