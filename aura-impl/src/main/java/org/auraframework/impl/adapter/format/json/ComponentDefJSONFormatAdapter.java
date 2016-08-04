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
package org.auraframework.impl.adapter.format.json;

import java.io.IOException;
import java.util.Collection;
import java.util.Map;

import javax.annotation.concurrent.ThreadSafe;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonEncoder;

import javax.annotation.concurrent.ThreadSafe;
import javax.inject.Inject;
import java.io.IOException;
import java.util.Collection;

@ThreadSafe
@ServiceComponent
public class ComponentDefJSONFormatAdapter extends JSONFormatAdapter<BaseComponentDef> {
    @Inject
    private ContextService contextService;

    @Override
    public Class<BaseComponentDef> getType() {
        return BaseComponentDef.class;
    }

    @Override
    public void writeCollection(Collection<? extends BaseComponentDef> values, Appendable out) throws IOException,
            QuickFixException {
        AuraContext context = contextService.getCurrentContext();
        JsonEncoder.serialize(values, out, context.getJsonSerializationContext());
    }
    
    @Override
    public void write(BaseComponentDef value, Map<String, Object> attributes, Appendable out) throws IOException,
            QuickFixException {
        AuraContext context = contextService.getCurrentContext();
        JsonEncoder.serialize(value, out, context.getJsonSerializationContext());
    }
}
