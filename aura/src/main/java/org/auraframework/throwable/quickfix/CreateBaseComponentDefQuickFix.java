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
package org.auraframework.throwable.quickfix;

import java.util.Map;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;

import com.google.common.collect.Maps;

/**
 */
public abstract class CreateBaseComponentDefQuickFix extends AuraQuickFix {

    public CreateBaseComponentDefQuickFix(String description, Map<String, Object> attributes,
            DefDescriptor<ComponentDef> ui) {
        super(description, attributes, ui);
    }

    protected static Map<String, Object> createMap(DefDescriptor<?> descriptor) {
        Map<String, Object> ret = Maps.newLinkedHashMap();
        ret.put("descriptor", String.format("%s:%s", descriptor.getNamespace(), descriptor.getName()));
        return ret;
    }
}
