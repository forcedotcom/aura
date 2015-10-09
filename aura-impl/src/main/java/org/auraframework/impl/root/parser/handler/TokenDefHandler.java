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

import static org.auraframework.impl.root.parser.handler.RootTagHandler.ATTRIBUTE_DESCRIPTION;

import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.RootDefinition;
import org.auraframework.def.TokenDef;
import org.auraframework.impl.css.token.TokenDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public final class TokenDefHandler<P extends RootDefinition> extends ParentedTagHandler<TokenDef, P> {
    protected static final String TAG = "aura:token";
    private static final String ATTRIBUTE_NAME = "name";
    private static final String ATTRIBUTE_VALUE = "value";
    private static final String ATTRIBUTE_PROPERTY = "property";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(
            ATTRIBUTE_NAME, ATTRIBUTE_VALUE, ATTRIBUTE_PROPERTY, ATTRIBUTE_DESCRIPTION);

    private final TokenDefImpl.Builder builder = new TokenDefImpl.Builder();
    private String value;

    public TokenDefHandler() {
        super();
    }

    public TokenDefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
        this.builder.setLocation(getLocation());
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void readAttributes() {
        String name = getAttributeValue(ATTRIBUTE_NAME);
        if (AuraTextUtil.isNullEmptyOrWhitespace(name)) {
            // normally this check would be handled by TokenDefImpl#validateDefinition, but waiting till then would
            // result in the get def descriptor below throwing a nondescript error message
            error("Missing required attribute 'name' on %s", TAG);
        }
        builder.setDescriptor(DefDescriptorImpl.getInstance(name, TokenDef.class));

        value = getAttributeValue(ATTRIBUTE_VALUE);// value (to be set on builder later, cuz it might throw a QFE)

        String allowedProperties = getAttributeValue(ATTRIBUTE_PROPERTY); // comma-separated list of property names
        if (!AuraTextUtil.isNullEmptyOrWhitespace(allowedProperties)) {
            builder.setAllowedProperties(allowedProperties);
        }

        builder.setDescription(getAttributeValue(ATTRIBUTE_DESCRIPTION));
    }

    @Override
    protected TokenDef createDefinition() throws QuickFixException {
        TextTokenizer tt = TextTokenizer.tokenize(value, getLocation());
        builder.setValue(tt.asValue(getParentHandler()));
        return builder.build();
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        error("No children allowed for %s tag", TAG);
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        if (!AuraTextUtil.isNullEmptyOrWhitespace(xmlReader.getText())) {
            error("No literal text allowed in %s tag", TAG);
        }
    }
}
