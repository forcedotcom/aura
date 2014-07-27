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

import java.util.Arrays;
import java.util.Set;

import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.library.IncludeDefImpl;

import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class IncludeDefHandler extends XMLHandler<IncludeDefImpl> {

    public static final String TAG = "aura:include";

    private static final String ATTRIBUTE_NAME = "name";
    private static final String ATTRIBUTE_IMPORTS = "imports";
    private static final String ATTRIBUTE_EXPORTS = "exports";

    protected final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(
        ATTRIBUTE_NAME, ATTRIBUTE_IMPORTS, ATTRIBUTE_EXPORTS, RootTagHandler.ATTRIBUTE_DESCRIPTION
    );

    private RootTagHandler<? extends RootDefinition> parentHandler;
    private final IncludeDefImpl.Builder builder = new IncludeDefImpl.Builder();

    public IncludeDefHandler() {
        super();
    }

    public IncludeDefHandler(RootTagHandler<? extends RootDefinition> parentHandler, XMLStreamReader xmlReader,
            Source<?> source) {
        super(xmlReader, source);
        this.parentHandler = parentHandler;
    }

    @Override
    @SuppressWarnings("unchecked")
    public IncludeDefImpl getElement() throws XMLStreamException, QuickFixException {
        if (parentHandler.getDefDescriptor().getDefType() != DefType.LIBRARY) {
            error("aura:include may only be set in a library.");
        }
        
        DefDescriptor<LibraryDef> parentDescriptor = (DefDescriptor<LibraryDef>) parentHandler.getDefDescriptor();
        builder.setLocation(getLocation());

        String name = getAttributeValue(ATTRIBUTE_NAME);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(name)) {
            builder.setName(name);
        } else {
            error("aura:include must specify a valid library name.");
        }
        if (name.toLowerCase().endsWith(".js")) {
            name = name.substring(0, name.length()-3);
        }
        builder.setDescriptor(DefDescriptorImpl.getInstance(String.format("js://%s.%s",
                parentDescriptor.getNamespace(), name), IncludeDef.class, parentDescriptor));
        
        String imports = getAttributeValue(ATTRIBUTE_IMPORTS);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(imports)) {
            builder.setImports(Arrays.asList(imports.split("\\s*\\,\\s*")));
        }
        
        String exports = getAttributeValue(ATTRIBUTE_EXPORTS);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(exports)) {
            builder.setExports(exports);
        }
        
        builder.setParentDescriptor(parentDescriptor);

        int next = xmlReader.next();
        if (next != XMLStreamConstants.END_ELEMENT || !TAG.equalsIgnoreCase(getTagName())) {
            error("expected end of %s tag", TAG);
        }

        builder.setOwnHash(source.getHash());

        return builder.build();
    }

    @Override
    public void writeElement(IncludeDefImpl def, Appendable out) {
    	// Never writes. Do nothing.
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
