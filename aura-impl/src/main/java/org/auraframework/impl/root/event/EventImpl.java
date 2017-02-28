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

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.impl.root.AttributeSetImpl;
import org.auraframework.instance.AttributeSet;
import org.auraframework.instance.BaseComponent;
import org.auraframework.instance.Event;
import org.auraframework.instance.InstanceStack;
import org.auraframework.service.ContextService;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import java.io.IOException;
import java.util.Map;

public class EventImpl implements Event {

    private final DefDescriptor<EventDef> eventDefDescriptor;
    private final AttributeSet attributeSet;
    private final String path;
    private final ContextService contextService;

    public EventImpl(DefDescriptor<EventDef> eventDefDescriptor, Map<String, Object> attributes,
            BaseComponent<?, ?> valueProvider) throws QuickFixException {
    	InstanceStack iStack = Aura.getContextService().getCurrentContext().getInstanceStack();
    	iStack.pushInstance(this, eventDefDescriptor);
        this.path = iStack.getPath();
        this.eventDefDescriptor = eventDefDescriptor;
        this.contextService = Aura.getContextService();
        this.attributeSet = new AttributeSetImpl(eventDefDescriptor, valueProvider, this);
        this.attributeSet.setDefaults();
        this.attributeSet.set(attributes);
        iStack.popInstance(this);
    }

    public EventImpl(DefDescriptor<EventDef> eventDefDescriptor, Map<String, Object> attributes)
            throws QuickFixException {
        this(eventDefDescriptor, attributes, null);
    }

    public EventImpl(DefDescriptor<EventDef> eventDefDescriptor) throws QuickFixException {
        this(eventDefDescriptor, null, null);
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
        boolean preloaded = contextService.getCurrentContext().isPreloaded(getDescriptor());

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

    @Override
    public String getPath() {
        return path;
    }
}
