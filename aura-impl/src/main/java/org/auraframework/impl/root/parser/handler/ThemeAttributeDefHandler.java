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

import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.RootDefinition;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;

import com.google.common.collect.ImmutableSet;

/**
 * Practically the same as {@link AttributeDefHandler} except this doesn't utilize as many attribute params (like
 * "required").
 * 
 * TODONM refactor this into the parent class then remove.
 */
public class ThemeAttributeDefHandler<P extends RootDefinition> extends AttributeDefHandler<P> {
    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_DEFAULT,
            ATTRIBUTE_TYPE, ATTRIBUTE_NAME, ATTRIBUTE_DESCRIPTION, ATTRIBUTE_VISIBILITY);

    public ThemeAttributeDefHandler(RootTagHandler<P> handler, XMLStreamReader xmlReader, Source<?> source) {
        super(handler, xmlReader, source);
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void readAttributes() {
        super.readAttributes();

        // probably not the best place to put this, but verify here that the "default" attribute is specified.
        if (getAttributeValue(ATTRIBUTE_DEFAULT) == null) {
            String msg = "Default value is required (empty strings are acceptable)";
            throw new AuraRuntimeException(msg, this.getLocation());
        }
    }
}
