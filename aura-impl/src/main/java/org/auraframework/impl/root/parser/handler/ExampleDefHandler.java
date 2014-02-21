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

import java.io.IOException;
import java.util.List;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.*;
import org.auraframework.def.BaseComponentDef.WhitespaceBehavior;
import org.auraframework.impl.documentation.ExampleDefImpl;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Lists;

public class ExampleDefHandler<P extends RootDefinition> extends ParentedTagHandler<ExampleDefImpl, P> {

    public static final String TAG = "aura:example";

    public static final String ATTRIBUTE_NAME = "name";
    public static final String ATTRIBUTE_LABEL = "label";
    public static final String ATTRIBUTE_DESCRIPTION = "description";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_NAME, ATTRIBUTE_LABEL, ATTRIBUTE_DESCRIPTION);
    
    private final List<ComponentDefRef> body = Lists.newArrayList();
    
    private final StringBuilder markupBuffer = new StringBuilder();

    private final ExampleDefImpl.Builder builder = new ExampleDefImpl.Builder();

    public ExampleDefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
        
        builder.setLocation(getLocation());
        
        if (source != null) {
            builder.setOwnHash(source.getHash());
        }
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void readAttributes() {
    	String name = getAttributeValue(ATTRIBUTE_NAME);
    	
        if (AuraTextUtil.isNullEmptyOrWhitespace(name)) {
            error("Attribute '%s' is required on <%s>", ATTRIBUTE_NAME, TAG);
        }
    	builder.setName(name);
        
    	String label = getAttributeValue(ATTRIBUTE_LABEL);
    	if (AuraTextUtil.isNullEmptyOrWhitespace(label)) {
            error("Attribute '%s' is required on <%s>", ATTRIBUTE_LABEL, TAG);
        }
    	builder.setLabel(label);
    	
    	String description = getAttributeValue(ATTRIBUTE_DESCRIPTION);
    	if (AuraTextUtil.isNullEmptyOrWhitespace(description)) {
    	    error("Attribute '%s' is required on <%s>", ATTRIBUTE_DESCRIPTION, TAG);
    	}
	    builder.setDescription(description);
    	
        DefDescriptor<P> parentDesc = getParentHandler().getDefDescriptor();
        String exampleName = String.format("%s_%s", parentDesc.getDescriptorName(), name);
        builder.setDescriptor(DefDescriptorImpl.getInstance(exampleName, ExampleDef.class));
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        body.add(getDefRefHandler(getParentHandler()).getElement());
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();
        boolean skip = getWhitespaceBehavior() == WhitespaceBehavior.OPTIMIZE ? AuraTextUtil
                .isNullEmptyOrWhitespace(text) : AuraTextUtil
                .isNullOrEmpty(text);
        if (!skip) {
            markupBuffer.append(text);
            
            TextTokenizer tokenizer = TextTokenizer.tokenize(text,
                    getLocation(), getWhitespaceBehavior());
            body.addAll(tokenizer.asComponentDefRefs(getParentHandler()));
        }
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected ExampleDefImpl createDefinition() throws QuickFixException {
        if (!body.isEmpty()) {
            AttributeDefRefImpl.Builder atBuilder = new AttributeDefRefImpl.Builder();
            atBuilder.setDescriptor(DefDescriptorImpl.getInstance(AttributeDefRefImpl.BODY_ATTRIBUTE_NAME,
                    AttributeDef.class));
            atBuilder.setLocation(getLocation());
            atBuilder.setValue(body);
            AttributeDefRef adr = atBuilder.build();
            cmpDefBuilder.facets.add(adr);
        }

//        ComponentDef cmpDef = cmpDefBuilder.build();
        
        
        
        // SHOULD THE DEF CARRY ITS MARKUP?
        if (source != null && source.exists()) {
            builder.setMarkup(source.getContents());
        }
        
        return builder.build();
    }

    @Override
    public void writeElement(ExampleDefImpl def, Appendable out) throws IOException {
    }
}
