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
import org.auraframework.def.LayoutItemDef;
import org.auraframework.def.LayoutsDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.layouts.LayoutItemDefImpl;
import org.auraframework.impl.system.SubDefDescriptorImpl;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

/**
 */
public class LayoutItemDefHandler<P extends RootDefinition> extends ParentedTagHandler<LayoutItemDef, P> {

    public static final String TAG = "aura:layoutItem";

    private static final String ATTRIBUTE_CACHE = "cache";
    private static final String ATTRIBUTE_ACTION = "action";
    private static final String ATTRIBUTE_CONTAINER = "container";

    protected final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_CACHE, ATTRIBUTE_ACTION,
            ATTRIBUTE_CONTAINER, RootTagHandler.ATTRIBUTE_DESCRIPTION);

    private final LayoutItemDefImpl.Builder builder = new LayoutItemDefImpl.Builder();

    public LayoutItemDefHandler(RootTagHandler<P> parentHandler, String layoutName, XMLStreamReader xmlReader,
            Source<?> source) {
        super(parentHandler, xmlReader, source);
        builder.setLocation(getLocation());
        builder.setLayoutName(layoutName);
        builder.setOwnHash(source.getHash());
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected LayoutItemDef createDefinition() {
        return builder.build();
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        String container = getAttributeValue(ATTRIBUTE_CONTAINER);
        DefDescriptor<LayoutsDef> parentDesc = ((LayoutsDefHandler) getParentHandler()).getDefDescriptor();
        builder.setDescriptor(SubDefDescriptorImpl.getInstance(container, parentDesc, LayoutItemDef.class));
        builder.setContainer(container);

        String action = getAttributeValue(ATTRIBUTE_ACTION);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(action)) {
            TextTokenizer tt = TextTokenizer.tokenize(action, getLocation());
            builder.setAction(tt.asValue(getParentHandler()));
        }

        builder.setCache(getAttributeValue(ATTRIBUTE_CACHE));

        builder.setDescription(getAttributeValue(RootTagHandler.ATTRIBUTE_DESCRIPTION));
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {

        builder.addComponentDefRef(getDefRefHandler(getParentHandler()).getElement());
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        builder.addComponentDefRefs(tokenizeChildText());
    }

    @Override
    public void writeElement(LayoutItemDef def, Appendable out) {

    }

}
