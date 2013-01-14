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
package org.auraframework.docs;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.instance.BaseComponent;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.throwable.quickfix.QuickFixException;

@Provider
public class TopicPanelProvider {
    public static DefDescriptor<ComponentDef> provide() throws QuickFixException {
        BaseComponent<?, ?> c = Aura.getContextService().getCurrentContext().getCurrentComponent();
        String topic = (String) c.getAttributes().getValue("topic");
        if (topic != null) {
            if (topic.startsWith("api:")) {
                return Aura.getDefinitionService().getDefDescriptor("auradocs:apiTopic", ComponentDef.class);
            } else {
                if (!topic.endsWith("Topic")) {
                    topic = topic + "Topic";
                }
                DefDescriptor<ComponentDef> desc = Aura.getDefinitionService().getDefDescriptor("auradocs:" + topic,
                        ComponentDef.class);
                if (desc.exists()) {
                    return desc;
                }
            }
        }

        return Aura.getDefinitionService().getDefDescriptor("auradocs:welcomeTopic", ComponentDef.class);
    }
}
