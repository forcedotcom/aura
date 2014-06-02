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

import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.library.ImportDefHandlerImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class ImportDefHandler extends XMLHandler<ImportDefHandlerImpl> {

    public static final String TAG = "aura:import";

    private static final String ATTRIBUTE_MODULE = "library";
    private static final String ATTRIBUTE_PROPERTY = "property";

    protected final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(
        ATTRIBUTE_MODULE, RootTagHandler.ATTRIBUTE_DESCRIPTION
    );

    private RootTagHandler<? extends RootDefinition> parentHandler;
    private final ImportDefHandlerImpl.Builder builder = new ImportDefHandlerImpl.Builder();

    public ImportDefHandler() {
        super();
    }

    public ImportDefHandler(RootTagHandler<? extends RootDefinition> parentHandler, XMLStreamReader xmlReader,
            Source<?> source) {
        super(xmlReader, source);
        this.parentHandler = parentHandler;
    }

    @Override
    public ImportDefHandlerImpl getElement() throws XMLStreamException, QuickFixException {
        DefDescriptor<? extends RootDefinition> defDescriptor = parentHandler.getDefDescriptor();
        builder.setParentDescriptor(defDescriptor);
        builder.setLocation(getLocation());

        String module = getAttributeValue(ATTRIBUTE_MODULE);
        String property = getAttributeValue(ATTRIBUTE_PROPERTY);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(module)) {
            DefDescriptor<LibraryDef> descriptor = DefDescriptorImpl.getInstance(module, LibraryDef.class);
            builder.setDescriptor(descriptor);
            builder.setModule(module);
            builder.setProperty(property);
        } else {
            error("Import must specify a valid library name.");
        }

        int next = xmlReader.next();
        if (next != XMLStreamConstants.END_ELEMENT || !TAG.equalsIgnoreCase(getTagName())) {
            error("expected end of %s tag", TAG);
        }
        builder.setOwnHash(source.getHash());

        return builder.build();
    }

    @Override
    public void writeElement(ImportDefHandlerImpl def, Appendable out) {
        // TODO
        System.err.println("WRITING");
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
