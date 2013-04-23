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

import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.LayoutsDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.root.layouts.LayoutsDefImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;

/**
 */
public class LayoutsDefHandler extends RootTagHandler<LayoutsDef> {

    public static final String TAG = "aura:layouts";

    private static final String ATTRIBUTE_DEFAULT = "default";
    private static final String ATTRIBUTE_CATCHALL = "catchall";

    protected final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_DEFAULT, ATTRIBUTE_CATCHALL,
            RootTagHandler.ATTRIBUTE_DESCRIPTION);

    private final LayoutsDefImpl.Builder builder = new LayoutsDefImpl.Builder();

    public LayoutsDefHandler(DefDescriptor<LayoutsDef> defDescriptor, Source<?> source, XMLStreamReader xmlReader) {
        super(defDescriptor, source, xmlReader);
        builder.setDescriptor(defDescriptor);
        builder.setLocation(getLocation());
        builder.setOwnHash(source.getHash());
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected LayoutsDef createDefinition() {
        return builder.build();
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        super.readAttributes();
        builder.catchall = getAttributeValue(ATTRIBUTE_CATCHALL);
        builder.defaultLayout = getAttributeValue(ATTRIBUTE_DEFAULT);
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (LayoutDefHandler.TAG.equalsIgnoreCase(tag)) {
            builder.addLayoutDef(new LayoutDefHandler<LayoutsDef>(this, xmlReader, source).getElement());
        } else {
            error("Found unexpected tag %s", tag);
        }
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {

    }

    @Override
    public void writeElement(LayoutsDef def, Appendable out) {

    }

    @Override
    public void addExpressionReferences(Set<PropertyReference> propRefs) {
        if (builder.expressionRefs == null) {
            builder.expressionRefs = Sets.newHashSet();
        }
        builder.expressionRefs.addAll(propRefs);
    }

    @Override
    protected RootDefinitionBuilder<LayoutsDef> getBuilder() {
        return builder;
    }

}
