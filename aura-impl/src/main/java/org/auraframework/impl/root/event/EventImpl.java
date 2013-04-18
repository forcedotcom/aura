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
package org.auraframework.impl.root.event;

import java.io.IOException;
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.impl.root.AttributeSetImpl;
import org.auraframework.instance.AttributeSet;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Event;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class EventImpl implements Event {

    private final DefDescriptor<EventDef> eventDefDescriptor;
    private final AttributeSet attributeSet;

    public EventImpl(DefDescriptor<EventDef> eventDefDescriptor, Map<String, Object> attributes,
            BaseComponent<?, ?> valueProvider) throws QuickFixException {
        this.eventDefDescriptor = eventDefDescriptor;
        this.attributeSet = new AttributeSetImpl(eventDefDescriptor, valueProvider);
        this.attributeSet.set(attributes);
    }

    public EventImpl(DefDescriptor<EventDef> eventDefDescriptor, Map<String, Object> attributes)
            throws QuickFixException {
        this(eventDefDescriptor, attributes, null);
    }

    public EventImpl(DefDescriptor<EventDef> eventDefDescriptor) throws QuickFixException {
        this(eventDefDescriptor, null);
    }

    @Override
    public DefDescriptor<EventDef> getDescriptor() {
        return eventDefDescriptor;
    }

    public EventDef getEventDef() throws QuickFixException {
        return eventDefDescriptor.getDef();
    }

    @Override
    public void serialize(Json json) throws IOException {
        boolean preloaded = Aura.getContextService().getCurrentContext().isPreloaded(getDescriptor());

        try {
            json.writeMapBegin();
            json.writeMapEntry("descriptor", getDescriptor());
            if (!attributeSet.isEmpty()) {
                json.writeMapEntry("attributes", attributeSet);
            }
            if (!preloaded) {
                json.writeMapEntry("eventDef", getEventDef());
            }
            json.writeMapEnd();
        } catch (QuickFixException x) {
            throw new AuraRuntimeException(x);
        }
    }

    @Override
    public AttributeSet getAttributes() {
        return attributeSet;
    }

}
