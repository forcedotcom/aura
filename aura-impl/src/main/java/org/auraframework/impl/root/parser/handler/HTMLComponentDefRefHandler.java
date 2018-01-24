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
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.HtmlTag;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.root.AttributeDefRefImpl;
import org.auraframework.impl.root.component.HTMLDefRefBuilderImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;

import javax.xml.stream.XMLStreamReader;
import java.util.List;
import java.util.Set;

/**
 * Handles free HTML in component markup.
 */
public class HTMLComponentDefRefHandler<P extends RootDefinition> extends ComponentDefRefHandler<P> {

    protected HTMLDefRefBuilderImpl htmlBuilder = new HTMLDefRefBuilderImpl();

    protected HTMLComponentDefRefHandler(RootTagHandler<P> parentHandler, String tag, XMLStreamReader xmlReader,
                                         TextSource<?> source, boolean isInInternalNamespace, DefinitionService definitionService,
                                         ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(parentHandler, xmlReader, source, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
        builder = htmlBuilder;
        builder.setLocation(getLocation());
        builder.setOwnHash(source.getHash());
        htmlBuilder.setTag(tag.trim());
        builder.setAccess(getAccess(isInInternalNamespace));
    }

    @Override
    public String getHandledTag() {
        return "HTML Component Reference";
    }

    @Override
    protected boolean handlesTag(String tag) {
        return HtmlTag.allowed(tag);
    }

    @Override
    protected void setBody(List<DefinitionReference> body) {
        htmlBuilder.setComponentAttribute(AttributeDefRefImpl.BODY_ATTRIBUTE_NAME, body);
    }

    @Override
    protected void readSystemAttributes() throws QuickFixException {
        super.readSystemAttributes();

        String flavorable = getSystemAttributeValue("flavorable");
        if (flavorable != null && !flavorable.equals("false")) {
            builder.setIsFlavorable(true);
        }
    }

    public static final Set<String> SPECIAL_BOOLEANS = ImmutableSet.of("checked", "selected", "disabled", "readonly",
            "multiple", "ismap", "defer", "declare", "noresize", "nowrap", "noshade", "compact", "autocomplete",
            "required");
}
