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

import java.util.Collection;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.DescriptorFilter;
import org.auraframework.impl.util.TypeParser;
import org.auraframework.impl.util.TypeParser.Type;
import org.auraframework.system.Location;
import org.auraframework.system.Source;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;

/**
 * aura:dependency tags.
 */
public class DependencyDefHandler extends BaseXMLElementHandler {

    public static final String TAG = "aura:dependency";

    private static final String ATTRIBUTE_RESOURCE = "resource";
    private static final String ATTRIBUTE_TYPE = "type";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_RESOURCE, ATTRIBUTE_TYPE);

    private final static Set<DefType> ALLOWED_TYPES = new ImmutableSet.Builder<DefType>()
        .add(DefType.COMPONENT)
        .add(DefType.EVENT)
        .add(DefType.INTERFACE)
        .add(DefType.LIBRARY)
        .add(DefType.MODULE)
        .build();

    private final static Set<DefType> DEFAULT_TYPES = new ImmutableSet.Builder<DefType>()
        .add(DefType.COMPONENT)
        .build();


    private String resource;
    private String typeString;

    public DependencyDefHandler() {
        super(null, null);
    }

    public DependencyDefHandler(XMLStreamReader xmlReader, TextSource<?> source) {
        super(xmlReader, source);
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        // make sure we handle default namespace for [resource]
        resource = getAttributeValue(ATTRIBUTE_RESOURCE);
        typeString = getAttributeValue(ATTRIBUTE_TYPE);
    }

    public static DescriptorFilter generateFilter(Source<?> source, String inResource,
            String typeString, Location location) throws QuickFixException {
        String outResource = inResource;
        Type tag = TypeParser.parseTagStrict(outResource);
        // FIXME: warn on non markup prefixes
        if (tag == null) {
            throw new InvalidDefinitionException("Unable to parse resource", location);
        } else if (source != null && source.isDefaultNamespaceUsed(tag.namespace)) {
            outResource = String.format("markup://%s:%s", source.getDescriptor().getNamespace(), tag.name);
        } else {
            outResource = String.format("markup://%s:%s", tag.namespace, tag.name);
        }
        Set<DefType> types = null;
        if (typeString == null) {
            types = DEFAULT_TYPES;
        } else {
            Collection<DefType> parsed = null;
            try {
                parsed = DescriptorFilter.parseDefTypes(typeString);
            } catch (Throwable t) {
                throw new InvalidDefinitionException(t.getMessage(), location, t);
            }
            if (parsed != null) {
                types = Sets.intersection(Sets.newHashSet(parsed), ALLOWED_TYPES);
            }
            if (types == null || types.isEmpty()) {
                types = DEFAULT_TYPES;
            }
        }
        return new DescriptorFilter(outResource, types);
    }

    public DescriptorFilter parse() throws QuickFixException {
        try {
            readElement();
        } catch (XMLStreamException xse) {
            throw new InvalidDefinitionException(xse.getMessage(), getLocation());
        }
        if (resource == null) {
            throw new InvalidDefinitionException("Missing required resource", getLocation());
        }
        try {
            return generateFilter(source, resource, typeString, getLocation());
        } catch (IllegalArgumentException iae) {
            throw new InvalidDefinitionException(iae.getMessage(), getLocation());
        }
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        error("Dependency cannot have a child tag");
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        error("Dependency cannot have child text");
    }
}
