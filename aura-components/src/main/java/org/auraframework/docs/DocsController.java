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

import java.util.Map;

import javax.inject.Inject;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.ds.servicecomponent.Controller;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.service.InstanceService;
import org.auraframework.system.Annotations.ActionGroup;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.system.Annotations.Key;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;

@ServiceComponent
public class DocsController implements Controller {

    @Inject
    private InstanceService instanceService;
    
    @Inject
    private DefinitionService definitionService;
    
    @Inject
    private ConfigAdapter configAdapter;

    @AuraEnabled
    @ActionGroup(value = "docs")
    public Component getTopic(@Key("topic") String topic) throws QuickFixException {
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("topic", topic);
        return instanceService.getInstance("auradocs:topicPanel", ComponentDef.class, attributes);
    }

    @AuraEnabled
    @ActionGroup(value = "docs")
    public Component getDemo(@Key("demo") String demo) throws QuickFixException {
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("demo", demo);
        return instanceService.getInstance("auradocs:demoPanel", ComponentDef.class, attributes);
    }

    @AuraEnabled
    @ActionGroup(value = "docs")
    public Component getReference(@Key("topic") String topic, @Key("descriptor") String descriptor,
                                  @Key("defType") String defType) throws QuickFixException {

        Map<String, Object> attributes = Maps.newHashMap();
        String defaultTopic = "referenceTabTopic";

        if (topic == null && defType == null && descriptor == null) {
            // Show an overview topic for orientation. It's similar to topics in
            // the Help tab and is in the auradocs
            // namespace.
            return getTopic(defaultTopic);
        } else if (topic != null) {
            try {
                return getTopic(topic);
            } catch (QuickFixException e) {
                // Would be good to have a "not found" topic instead, but for now let's just
                // use the default one.
                return getTopic(defaultTopic);
            }
        } else {
            Preconditions.checkNotNull(descriptor);
            Preconditions.checkNotNull(defType);
            DefType dt = DefType.valueOf(defType.toUpperCase());
            
            DefDescriptor<?> defDescriptor = definitionService.getDefDescriptor(descriptor, dt.getPrimaryInterface());
            if(!configAdapter.isDocumentedNamespace(defDescriptor.getNamespace())) {
            	return null;
            }
            
            attributes.put("descriptor", descriptor);
            attributes.put("defType", dt.name());
            return instanceService.getInstance("auradocs:def", ComponentDef.class, attributes);
        }
    }
}
