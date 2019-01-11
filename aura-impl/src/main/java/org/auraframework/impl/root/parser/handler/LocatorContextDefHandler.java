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

import org.apache.commons.lang3.StringUtils;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.LocatorContextDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.locator.LocatorContextDefImpl;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableSet;

public class LocatorContextDefHandler<P extends RootDefinition> extends ParentedTagHandler<LocatorContextDef, P> {

    public static final String TAG = "aura:locatorContext";

    private static final String ATTRIBUTE_KEY = "key";
    private static final String ATTRIBUTE_VALUE = "value";
    private static final Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_KEY, ATTRIBUTE_VALUE);

    private final LocatorContextDefImpl.Builder builder = new LocatorContextDefImpl.Builder();

    public LocatorContextDefHandler(XMLStreamReader xmlReader, TextSource<?> source,
                                    DefinitionService definitionService, boolean isInInternalNamespace,
                                    ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter,
                                    ContainerTagHandler<P> parentHandler) {
        super(xmlReader, source, definitionService, isInInternalNamespace, configAdapter,
                definitionParserAdapter, parentHandler);
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        error("There can be no child tags fro aura:locatorContext. Found: %s", getTagName());
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();
        if (!StringUtils.isBlank(text)) {
            error("No literal text allowed in " + TAG);
        }
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        String key = getAttributeValue(ATTRIBUTE_KEY);
        String valueString = getAttributeValue(ATTRIBUTE_VALUE);

        if (StringUtils.isBlank(key)) {
            error("The attribute '%s' is required on '<%s>'.", ATTRIBUTE_KEY, TAG);
        }
        if (StringUtils.isBlank(valueString)) {
            error("The attribute '%s' is required on '<%s>'.", ATTRIBUTE_VALUE, TAG);
        }

        TextTokenizer tt = TextTokenizer.tokenize(valueString, getLocation());
        Object value = tt.asValue(getParentHandler());
        
        builder.setLocation(getLocation());
        builder.setKey(key);
        builder.setValue(value);
    };

    @Override
    protected void finishDefinition() throws QuickFixException {
    }

    @Override
    protected LocatorContextDef createDefinition() throws QuickFixException {
        return builder.build();
    }
}
