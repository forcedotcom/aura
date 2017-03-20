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

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavorDefaultDef;
import org.auraframework.def.FlavorIncludeDef;
import org.auraframework.def.FlavorsDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.css.flavor.FlavorsDefImpl;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.Set;

public class FlavorsDefHandler extends RootTagHandler<FlavorsDef> {
    protected static final String TAG = "aura:flavors";

    private final FlavorsDefImpl.Builder builder = new FlavorsDefImpl.Builder();

    public FlavorsDefHandler() {
        super();
    }

    public FlavorsDefHandler(DefDescriptor<FlavorsDef> defDescriptor, TextSource<FlavorsDef> source,
                             XMLStreamReader xmlReader, boolean isInInternalNamespace,
                             DefinitionService definitionService,
                             ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) throws QuickFixException {
        super(defDescriptor, source, xmlReader, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);

        builder.setDescriptor(getDefDescriptor());
        builder.setLocation(getLocation());
        if (source != null) {
            builder.setOwnHash(source.getHash());
        }

        if (!isInInternalNamespace()) {
            throw new DefinitionNotFoundException(defDescriptor);
        }

        builder.setAccess(getAccess(isInInternalNamespace));
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    public RootDefinitionBuilder<FlavorsDef> getBuilder() {
        return builder;
    }

    @Override
    public void addExpressionReferences(Set<PropertyReference> propRefs) {
        builder.addAllExpressionRefs(propRefs);
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();

        if (FlavorIncludeDefHandler.TAG.equalsIgnoreCase(tag)) {
            FlavorIncludeDef def = new FlavorIncludeDefHandler<>(this, xmlReader, source, isInInternalNamespace,
                    definitionService, configAdapter, definitionParserAdapter).getElement();
            builder.addFlavorIncludeDef(def);
        }
        else if (FlavorDefaultDefHandler.TAG.equalsIgnoreCase(tag)) {
            FlavorDefaultDef def = new FlavorDefaultDefHandler<>(this, xmlReader, source, isInInternalNamespace,
                    definitionService, configAdapter, definitionParserAdapter).getElement();
            builder.addFlavorDefaultDef(def);
        } else {
            error("Found unexpected tag %s", tag);
        }
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        if (!AuraTextUtil.isNullEmptyOrWhitespace(xmlReader.getText())) {
            error("No literal text allowed in %s tag", TAG);
        }
    }

    @Override
    protected void finishDefinition() throws QuickFixException {
    }

    @Override
    protected FlavorsDef createDefinition() throws QuickFixException {
        return builder.build();
    }
}
