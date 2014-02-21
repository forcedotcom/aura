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
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.*;
import org.auraframework.impl.documentation.ExampleDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class ExampleDefHandler<P extends RootDefinition> extends ParentedTagHandler<ExampleDefImpl, P> {

    public static final String TAG = "aura:example";

    public static final String ATTRIBUTE_NAME = "name";
    public static final String ATTRIBUTE_REF = "ref";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_NAME, ATTRIBUTE_REF);

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
        
    	String ref = getAttributeValue(ATTRIBUTE_REF);
    	if (AuraTextUtil.isNullEmptyOrWhitespace(ref)) {
            error("Attribute '%s' is required on <%s>", ATTRIBUTE_REF, TAG);
        }
    	builder.setRef(ref);
    	
        DefDescriptor<P> parentDesc = getParentHandler().getDefDescriptor();
        String exampleName = String.format("%s_%s", parentDesc.getDescriptorName(), name);
        builder.setDescriptor(DefDescriptorImpl.getInstance(exampleName, ExampleDef.class));
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        error("<%s> cannot contain a child tag", TAG);
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        error("<%s> cannot contain child text", TAG);
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected ExampleDefImpl createDefinition() throws QuickFixException {
        return builder.build();
    }

    @Override
    public void writeElement(ExampleDefImpl def, Appendable out) throws IOException {
    }
}
