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

package org.auraframework.impl.root.parser.handler.design;

import com.google.common.collect.ImmutableSet;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.design.DesignDef;
import org.auraframework.def.design.DesignTemplateRegionDef;
import org.auraframework.impl.design.DesignTemplateRegionDefImpl;
import org.auraframework.impl.root.parser.handler.ParentedTagHandler;
import org.auraframework.impl.root.parser.handler.RootTagHandler;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.List;
import java.util.Set;

public class DesignTemplateRegionDefHandler extends ParentedTagHandler<DesignTemplateRegionDef, DesignDef> {
    public static final String TAG = "design:region";

    private static final String ATTRIBUTE_NAME = "name";
    private static final String ATTRIBUTE_INTERFACES = "allowedInterfaces";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_NAME, ATTRIBUTE_INTERFACES);

    private final DesignTemplateRegionDefImpl.Builder builder = new DesignTemplateRegionDefImpl.Builder();

    public DesignTemplateRegionDefHandler() {
        super();
    }

    public DesignTemplateRegionDefHandler(RootTagHandler<DesignDef> parentHandler, XMLStreamReader xmlReader,
                                          TextSource<?> source, boolean isInInternalNamespace,
                                          DefinitionService definitionService,
                                          ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(parentHandler, xmlReader, source, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
        builder.setAccess(getAccess(isInInternalNamespace));
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        super.readAttributes();

        String name = getAttributeValue(ATTRIBUTE_NAME);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(name)) {
            builder.setDescriptor(definitionService.getDefDescriptor(name, DesignTemplateRegionDef.class));
            builder.setName(name);
        } else {
            error("Name attribute is required for design template region definitions");
        }

        String qnames = getAttributeValue(ATTRIBUTE_INTERFACES);
        if (qnames != null) {
            List<String> interfaces = AuraTextUtil.splitSimple(",", qnames);
            for (String qname : interfaces) {
                builder.addAllowedInterface(definitionService.getDefDescriptor(qname, InterfaceDef.class));
            }
        }

        builder.setLocation(getLocation());
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        throw new XMLStreamException(String.format("<%s> cannot contain tag %s", getHandledTag(), tag));
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        error("No literal text allowed in design template region definition");
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void finishDefinition() throws QuickFixException {
    }

    @Override
    protected DesignTemplateRegionDef createDefinition() throws QuickFixException {
        return builder.build();
    }
}
