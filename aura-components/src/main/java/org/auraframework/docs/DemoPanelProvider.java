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
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.quickfix.QuickFixException;

@Provider
public class DemoPanelProvider {
    public static DefDescriptor<ComponentDef> provide() throws QuickFixException {
        BaseComponent<?, ?> c = Aura.getContextService().getCurrentContext().getCurrentComponent();
        String demo = (String)c.getAttributes().getValue("demo");
        if (demo != null) {
            if (!demo.endsWith("Demo")) {
                demo = demo + "Demo";
            }
            DefDescriptor<ComponentDef> desc = Aura.getDefinitionService().getDefDescriptor("auradocs:" + demo,
                    ComponentDef.class);
            if (desc.exists()) { return desc; }
        }
        return Aura.getDefinitionService().getDefDescriptor("auradocs:demos", ComponentDef.class);
    }
}
