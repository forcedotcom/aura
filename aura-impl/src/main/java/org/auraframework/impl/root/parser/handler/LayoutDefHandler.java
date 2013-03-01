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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.LayoutDef;
import org.auraframework.def.LayoutItemDef;
import org.auraframework.def.LayoutsDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.layouts.LayoutDefImpl;
import org.auraframework.impl.system.SubDefDescriptorImpl;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableSet;

/**
 */
public class LayoutDefHandler<P extends RootDefinition> extends ParentedTagHandler<LayoutDef, P> {

    public static final String TAG = "aura:layout";

    private static final String ATTRIBUTE_TITLE = "title";
    private static final String ATTRIBUTE_NAME = "name";
    private static final String ATTRIBUTE_MATCH = "match";

    protected final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_TITLE, ATTRIBUTE_NAME,
            ATTRIBUTE_MATCH, RootTagHandler.ATTRIBUTE_DESCRIPTION);

    private final LayoutDefImpl.Builder builder = new LayoutDefImpl.Builder();

    public LayoutDefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
        builder.setLocation(getLocation());
        builder.setOwnHash(source.getHash());
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        String name = getAttributeValue(ATTRIBUTE_NAME);
        DefDescriptor<LayoutsDef> parentDesc = ((LayoutsDefHandler) getParentHandler()).getDefDescriptor();
        builder.setDescriptor(SubDefDescriptorImpl.getInstance(name, parentDesc, LayoutDef.class));

        builder.setName(name);
        builder.setMatch(getAttributeValue(ATTRIBUTE_MATCH));
        TextTokenizer tt = TextTokenizer.tokenize(getAttributeValue(ATTRIBUTE_TITLE), getLocation());
        tt.addExpressionRefs(getParentHandler());
        builder.setTitle(tt.asValue(getParentHandler()));

        builder.setDescription(getAttributeValue(RootTagHandler.ATTRIBUTE_DESCRIPTION));
    }

    @Override
    protected LayoutDef createDefinition() {
        return builder.build();
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (LayoutItemDefHandler.TAG.equalsIgnoreCase(tag)) {
            LayoutItemDef layoutItem = new LayoutItemDefHandler<P>(getParentHandler(), builder.getName(), xmlReader,
                    source).getElement();
            builder.addLayoutItemDef(layoutItem);
        } else {
            error("Found unexpected tag %s", tag);
        }
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {

    }

    @Override
    public void writeElement(LayoutDef def, Appendable out) {

    }

}
