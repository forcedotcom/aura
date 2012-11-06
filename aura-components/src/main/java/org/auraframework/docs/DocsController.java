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

import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.instance.Component;
import org.auraframework.system.Annotations.Controller;
import org.auraframework.system.Annotations.Key;
import org.auraframework.system.Annotations.AuraEnabled;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.base.Preconditions;
import com.google.common.collect.Maps;

@Controller
public class DocsController {

    @AuraEnabled
    public static Component getTopic(@Key("topic") String topic) throws QuickFixException {
        Map<String, Object> attributes = Maps.newHashMap();
        attributes.put("topic", topic);
        return Aura.getInstanceService().getInstance("auradocs:topicPanel", ComponentDef.class, attributes);
    }

    @AuraEnabled
    public static Component getReference(@Key("topic") String topic, @Key("descriptor") String descriptor,
            @Key("defType") String defType) throws QuickFixException {
        
        Map<String, Object> attributes = Maps.newHashMap();
        if (topic == null && defType == null && descriptor == null) {
            // Show an overview topic for orientation. It's similar to topics in the Help tab and is in the auradocs
            // namespace.
            return getTopic("referenceTabTopic");
        } else if (topic != null) {
            return getTopic(topic);
        } else {
            Preconditions.checkNotNull(descriptor);
            Preconditions.checkNotNull(defType);
            DefType dt = DefType.valueOf(defType.toUpperCase());
            attributes.put("descriptor", descriptor);
            attributes.put("defType", dt.name());
            return Aura.getInstanceService().getInstance("auradocs:def", ComponentDef.class, attributes);
        }
    }
}
