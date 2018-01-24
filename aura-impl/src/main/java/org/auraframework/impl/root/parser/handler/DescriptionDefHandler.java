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

import com.google.common.collect.ImmutableSet;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.DescriptionDef;
import org.auraframework.def.DocumentationDef;
import org.auraframework.impl.documentation.DescriptionDefImpl;
import org.auraframework.impl.system.SubDefDescriptorImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.Set;

public class DescriptionDefHandler<P> extends ParentedTagHandler<DescriptionDefImpl, DocumentationDef> {

    public static final String TAG = "aura:description";

    private static final String ATTRIBUTE_NAME = "name";
    
    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_NAME);

    private final StringBuilder body = new StringBuilder();
    private final DescriptionDefImpl.Builder builder = new DescriptionDefImpl.Builder();

    public DescriptionDefHandler(RootTagHandler<DocumentationDef> parentHandler, XMLStreamReader xmlReader, TextSource<?> source,
                                 boolean isInInternalNamespace, DefinitionService definitionService,
                                 ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(parentHandler, xmlReader, source, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
        builder.setAccess(getAccess(isInInternalNamespace));
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void readAttributes() {
    	String name = getAttributeValue(ATTRIBUTE_NAME);
    	if (name == null) {
    		name = ((DocumentationDefHandler) getParentHandler()).getNextId();
    	}
        builder.setDescriptor(SubDefDescriptorImpl.getInstance(name, getParentHandler().defDescriptor, DescriptionDef.class));
        builder.setName(name);
        builder.setLocation(getLocation());
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
    	body.append(handleHTML());
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        body.append(handleHTMLText());
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void finishDefinition() throws QuickFixException {
        builder.setDescription(body.toString());
    }

    @Override
    protected DescriptionDefImpl createDefinition() throws QuickFixException {
        return builder.build();
    }
}
