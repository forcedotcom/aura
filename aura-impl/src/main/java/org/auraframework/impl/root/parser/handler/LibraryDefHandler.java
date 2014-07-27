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

import java.util.List;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.LibraryDef;
import org.auraframework.impl.root.library.LibraryDefImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;

public class LibraryDefHandler extends RootTagHandler<LibraryDef> {

    public static final String TAG = "aura:library";
    
    private static final Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(RootTagHandler.ATTRIBUTE_API_VERSION);
    
    private final LibraryDefImpl.Builder builder = new LibraryDefImpl.Builder();
    
    private final List<IncludeDef> includes;

    public LibraryDefHandler() {
        super();
        this.includes = Lists.newLinkedList();
    }

    public LibraryDefHandler(DefDescriptor<LibraryDef> libraryDefDescriptor, Source<?> source, XMLStreamReader xmlReader) {
        super(libraryDefDescriptor, source, xmlReader);
        this.includes = Lists.newLinkedList();
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected LibraryDefImpl createDefinition() {
        builder.setDescriptor(getDefDescriptor());
        builder.setLocation(startLocation);
        builder.setOwnHash(source.getHash());
        builder.setIncludes(includes);
        return builder.build();
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (IncludeDefHandler.TAG.equals(tag)) {
            this.includes.add(new IncludeDefHandler(this, xmlReader, source).getElement());
        } else {
            error("Found unexpected tag %s", tag);
        }
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        super.readAttributes();
        builder.setAccess(readAccessAttribute());
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();
        if (!AuraTextUtil.isNullEmptyOrWhitespace(text)) {
            error("No literal text allowed in event definition");
        }
    }

    @Override
    public void writeElement(LibraryDef def, Appendable out) {
        // Do nothing.
    }

    @Override
    protected RootDefinitionBuilder<LibraryDef> getBuilder() {
        return builder;
    }
    
	@Override
	protected boolean allowPrivateAttribute() {
		return true;
	}
}
