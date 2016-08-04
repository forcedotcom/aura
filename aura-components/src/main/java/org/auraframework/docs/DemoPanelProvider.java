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

import javax.inject.Inject;

import org.auraframework.annotations.Annotations.ServiceComponentProvider;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDescriptorProvider;
import org.auraframework.def.DefDescriptor;
import org.auraframework.instance.BaseComponent;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.throwable.quickfix.QuickFixException;

@ServiceComponentProvider
public class DemoPanelProvider implements ComponentDescriptorProvider {
	
	@Inject
	ContextService contextService;
	
	@Inject
	DefinitionService definitionService;
	
    @Override
    public DefDescriptor<ComponentDef> provide() throws QuickFixException {
        BaseComponent<?, ?> c = contextService.getCurrentContext().getCurrentComponent();
        String demo = (String)c.getAttributes().getValue("demo");
        if (demo != null) {
            if (!demo.endsWith("Demo")) {
                demo = demo + "Demo";
            }
            DefDescriptor<ComponentDef> desc = definitionService.getDefDescriptor("auradocs:" + demo,
                    ComponentDef.class);
            if (desc.exists()) { return desc; }
        }
        return definitionService.getDefDescriptor("auradocs:demos", ComponentDef.class);
    }
}
