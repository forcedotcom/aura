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
package org.auraframework.impl.adapter.format.json;

import java.io.IOException;
import java.io.Reader;
import java.util.*;

import com.google.common.collect.Lists;

import org.auraframework.def.ComponentDefRef;
import org.auraframework.impl.root.component.ComponentDefRefImpl;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.util.json.JsonReader;

/**
 */
public class ComponentDefRefJSONFormatAdapter extends JSONFormatAdapter<ComponentDefRef>{

    @Override
    public Class<ComponentDefRef> getType() {
        return ComponentDefRef.class;
    }

    @SuppressWarnings("unchecked")
    @Override
    public Collection<ComponentDefRef> readCollection(Reader in) throws IOException, DefinitionNotFoundException {
        List<?> cdrs = (List<?>)new JsonReader().read(in);
        List<ComponentDefRef> ret = Lists.newArrayList();
        for(Object cmp : cdrs){
            ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();
            Map<?, ?> map = (Map<?, ?>)cmp;
            Map<?, ?> componentDef = (Map<?,?>)map.get("componentDef");
            builder.setDescriptor((String)componentDef.get("descriptor"));
            Map<?,?> attributes = (Map<?,?>)map.get("attributes");
            if(attributes != null){
                Map<String,Object> attributeValues = (Map<String,Object>)attributes.get("values");
                if(attributeValues != null){
                    for(Map.Entry<String, Object> entry : attributeValues.entrySet()){
                        Object v = entry.getValue();
                        if (v instanceof Map<?,?> && ((Map<?,?>)v).get("descriptor") != null && ((Map<?,?>)v).get("value") != null) {
                            builder.setAttribute(entry.getKey(), ((Map<?,?>)v).get("value"));
                        } else {
                            builder.setAttribute(entry.getKey(), v);
                        }
                    }
                }
            }
            ret.add(builder.build());
        }
        return ret;
    }

}
