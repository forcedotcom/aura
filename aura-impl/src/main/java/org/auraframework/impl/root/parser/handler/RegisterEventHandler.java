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
package org.auraframework.impl.root.parser.handler;

import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.EventDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.event.RegisterEventDefImpl;
import org.auraframework.impl.root.event.RegisterEventDefImpl.Builder;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Location;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

/**
 * handler for aura:registerEvent tag
 */
public class RegisterEventHandler<P extends RootDefinition> extends ParentedTagHandler<RegisterEventDefImpl, P> {
	

    public static final String TAG = "aura:registerevent";

    private static final String ATTRIBUTE_TYPE = "type";
    private static final String ATTRIBUTE_NAME = "name";

    private final Builder builder = new RegisterEventDefImpl.Builder();

    protected final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_ACCESS, ATTRIBUTE_TYPE,
            ATTRIBUTE_NAME, RootTagHandler.ATTRIBUTE_DESCRIPTION);

    public RegisterEventHandler() {
        super();
    }

    public RegisterEventHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
        builder.setOwnHash(source.getHash());
    }

    @Override
	protected void readAttributes() throws QuickFixException {
        String name = getAttributeValue(ATTRIBUTE_NAME);
        if (AuraTextUtil.isNullEmptyOrWhitespace(name)) {
            error("name is a required attribute on tag registerevent");
        }
        
        String type = getAttributeValue(ATTRIBUTE_TYPE);
        if (AuraTextUtil.isNullEmptyOrWhitespace(type)) {
            error("type attribute is required on registerevent");
        }
        
        Location location = getLocation();
        DefDescriptor<EventDef> eventDefDescriptor = DefDescriptorImpl.getInstance(type, EventDef.class);
        
        // validation on descriptor and such.
        builder.setDescription(getAttributeValue(RootTagHandler.ATTRIBUTE_DESCRIPTION));
        builder.setLocation(location);
        builder.setDescriptor(eventDefDescriptor);
        builder.setAttName(name);
        
        try {
			builder.setAccess(readAccessAttribute());
		} catch (InvalidAccessValueException e) {
			builder.setParseError(e);
		}
	}

	@Override
	protected boolean allowPrivateAttribute() {
		return true;
	}
	
	@Override
	protected RegisterEventDefImpl createDefinition() throws QuickFixException {
        return builder.build();
	}
	
    //TODO this could be pushed to the superclass... It is currently empty in all subclasses of ContainerTagHandler
    @Override
    public void writeElement(RegisterEventDefImpl def, Appendable out) {
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

	@Override
	protected void handleChildTag() throws XMLStreamException,
			QuickFixException {
        error("No children allowed for %s tag", TAG);
	}

	@Override
	protected void handleChildText() throws XMLStreamException,
			QuickFixException {
        error("No literal text allowed in %s tag", TAG);
	}

}
