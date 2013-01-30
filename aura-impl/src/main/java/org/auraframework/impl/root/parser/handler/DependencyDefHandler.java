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

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.DependencyDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.DependencyDefImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableSet;

/**
 * aura:dependency tags.
 */
public class DependencyDefHandler<P extends RootDefinition> extends ParentedTagHandler<DependencyDef, P> {

    public static final String TAG = "aura:dependency";

    private static final String ATTRIBUTE_RESOURCE = "resource";
    private static final String ATTRIBUTE_TYPE = "type";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_RESOURCE, ATTRIBUTE_TYPE);

    private DependencyDefImpl.Builder builder;

    public DependencyDefHandler() {
        super();
    }

    public DependencyDefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
        this.builder = new DependencyDefImpl.Builder();
        this.builder.setLocation(getLocation());
        this.builder.setParentDescriptor(parentHandler.getDefDescriptor());
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void readAttributes() {
        builder.setResource(getAttributeValue(ATTRIBUTE_RESOURCE));
        builder.setType(getAttributeValue(ATTRIBUTE_TYPE));
    }

    @Override
    protected DependencyDef createDefinition() throws QuickFixException {
        return builder.build();
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    public void writeElement(DependencyDef def, Appendable out) {
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
