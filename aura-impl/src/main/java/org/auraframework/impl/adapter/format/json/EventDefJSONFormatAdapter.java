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

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.EventDef;
import org.auraframework.service.ContextService;
import org.auraframework.system.AuraContext;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.JsonEncoder;

import javax.annotation.concurrent.ThreadSafe;
import javax.inject.Inject;
import java.io.IOException;
import java.util.Collection;

/**
 * Event JSON format adapter.
 */
@ThreadSafe
@ServiceComponent
public class EventDefJSONFormatAdapter extends JSONFormatAdapter<EventDef> {
    @Inject
    private ContextService contextService;

    @Override
    public Class<EventDef> getType() {
        return EventDef.class;
    }

    @Override
    public void writeCollection(Collection<? extends EventDef> values, Appendable out) throws IOException,
            QuickFixException {
        AuraContext context = contextService.getCurrentContext();
        JsonEncoder.serialize(values, out, context.getJsonSerializationContext());
    }
}
