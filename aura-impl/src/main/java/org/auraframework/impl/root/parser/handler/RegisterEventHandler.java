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
package org.auraframework.impl.root.parser.handler;

import java.util.Set;

import javax.xml.stream.*;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.impl.root.event.RegisterEventDefImpl;
import org.auraframework.impl.root.event.RegisterEventDefImpl.Builder;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Location;
import org.auraframework.system.Source;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

/**
 * handler for aura:registerEvent tag
 *
 *
 *
 */
public class RegisterEventHandler extends XMLHandler<RegisterEventDefImpl> {

    public static final String TAG = "aura:registerevent";

    private static final String ATTRIBUTE_ACCESS = "access";
    private static final String ATTRIBUTE_TYPE = "type";
    private static final String ATTRIBUTE_NAME = "name";

    private Builder builder = new RegisterEventDefImpl.Builder();

    protected final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(
        ATTRIBUTE_ACCESS,
        ATTRIBUTE_TYPE,
        ATTRIBUTE_NAME,
        RootTagHandler.ATTRIBUTE_DESCRIPTION
    );

    // only 2 access types for now
    public static final String GLOBAL = "global";
    public static final String PUBLIC = "public";

    public RegisterEventHandler(){
        super();
    }

    public RegisterEventHandler(XMLStreamReader xmlReader, Source<?> source) {
        super(xmlReader, source);
    }

    @Override
    public RegisterEventDefImpl getElement() throws XMLStreamException {
        String name = getAttributeValue(ATTRIBUTE_NAME);
        String type = getAttributeValue(ATTRIBUTE_TYPE);
        if (AuraTextUtil.isNullEmptyOrWhitespace(type)) {
            error("type attribute is required on registerevent");
        }
        Location location = getLocation();
        DefDescriptor<EventDef> eventDefDescriptor = DefDescriptorImpl.getInstance(type, EventDef.class);
        // validation on descriptor and such.
        String access = getAttributeValue(ATTRIBUTE_ACCESS);
        boolean isGlobal = false;
        if (access != null) {
            if (access.equalsIgnoreCase(GLOBAL)) {
                isGlobal = true;
            } else if (!access.equalsIgnoreCase(PUBLIC)) {
                error("Invalid access type [%s] for event %s", access, type);
            }
        }
        builder.setDescription(getAttributeValue(RootTagHandler.ATTRIBUTE_DESCRIPTION));
        int next = xmlReader.next();
        if (next != XMLStreamConstants.END_ELEMENT || !TAG.equalsIgnoreCase(getTagName())) {
            error("expected end of %s tag", TAG);
        }
        builder.setLocation(location);
        builder.setIsGlobal(isGlobal);
        builder.setDescriptor(eventDefDescriptor);
        builder.setAttName(name);
        return builder.build();
    }

    @Override
    public void writeElement(RegisterEventDefImpl def, Appendable out) {
        // TODO Auto-generated method stub
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }
}
