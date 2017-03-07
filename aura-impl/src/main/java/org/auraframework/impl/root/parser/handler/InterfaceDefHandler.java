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
import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.AttributeDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.InterfaceDef;
import org.auraframework.def.MethodDef;
import org.auraframework.def.RequiredVersionDef;
import org.auraframework.impl.root.AttributeDefImpl;
import org.auraframework.impl.root.RequiredVersionDefImpl;
import org.auraframework.impl.root.event.RegisterEventDefImpl;
import org.auraframework.impl.root.intf.InterfaceDefImpl;
import org.auraframework.service.ContextService;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

/**
 * Handler for XML interface def.
 */
public class InterfaceDefHandler extends RootTagHandler<InterfaceDef> {

    public static final String TAG = "aura:interface";

    private static final String ATTRIBUTE_EXTENDS = "extends";

    protected static final Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_EXTENDS,
            RootTagHandler.ATTRIBUTE_DESCRIPTION, RootTagHandler.ATTRIBUTE_API_VERSION, ATTRIBUTE_ACCESS);
    private static final Set<String> INTERNAL_ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>().add(
            RootTagHandler.ATTRIBUTE_SUPPORT).addAll(ALLOWED_ATTRIBUTES).build();

    private final InterfaceDefImpl.Builder builder = new InterfaceDefImpl.Builder();

    private final ContextService contextService;

    public InterfaceDefHandler() {
        super();
        this.contextService = null;
    }

    public InterfaceDefHandler(DefDescriptor<InterfaceDef> descriptor, TextSource<?> source, XMLStreamReader xmlReader,
                               boolean isInInternalNamespace, DefinitionService definitionService,
                               ContextService contextService,
                               ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(descriptor, source, xmlReader, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
        builder.events = new HashMap<>();
        builder.methods = new HashMap<>();
        if (source != null) {
            builder.setOwnHash(source.getHash());
        }
        builder.extendsDescriptors = new HashSet<>();
        builder.setDescriptor(descriptor);
        this.contextService = contextService;
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return isInInternalNamespace ? INTERNAL_ALLOWED_ATTRIBUTES : ALLOWED_ATTRIBUTES;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (AttributeDefHandler.TAG.equalsIgnoreCase(tag)) {
            AttributeDefHandler<InterfaceDef> handler = new AttributeDefHandler<>(this, xmlReader, source,
                    isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
            AttributeDefImpl attributeDef = handler.getElement();
            DefDescriptor<AttributeDef> attributeDesc = attributeDef.getDescriptor();
            //            if (builder.getAttributeDefs().containsKey(attributeDesc)) {
            //                tagError(
            //                        "There is already an attribute named '%s' on %s '%s'.",
            //                        handler.getParentHandler().getDefDescriptor(),
            //                        attributeDesc.getName(),
            //                        "%s", "%s"
            //                );
            //            }
            builder.addAttributeDef(attributeDesc,attributeDef);
        } else if (RequiredVersionDefHandler.TAG.equalsIgnoreCase(tag)) {
            RequiredVersionDefHandler<InterfaceDef> handler = new RequiredVersionDefHandler<>(this, xmlReader, source,
                    isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
            RequiredVersionDefImpl requiredVersionDef = handler.getElement();
            DefDescriptor<RequiredVersionDef> requiredVersionDesc = requiredVersionDef.getDescriptor();
            if (builder.getRequiredVersionDefs().containsKey(requiredVersionDesc)) {
                tagError(
                        "There is already a namespace '%s' on %s '%s'.",
                        handler.getParentHandler().getDefDescriptor(),
                        requiredVersionDesc.getName(),
                        "%s", "%s"
                        );
            }
            builder.getRequiredVersionDefs().put(requiredVersionDesc, requiredVersionDef);
        } else if (RegisterEventHandler.TAG.equalsIgnoreCase(tag)) {
            RegisterEventDefImpl regDef = new RegisterEventHandler<>(this, xmlReader, source, isInInternalNamespace,
                    definitionService, configAdapter, definitionParserAdapter).getElement();
            builder.events.put(regDef.getDescriptor().getName(), regDef);
        } else if (MethodDefHandler.TAG.equalsIgnoreCase(tag)) {
            MethodDef methodDef = new MethodDefHandler<>(this, xmlReader, source, isInInternalNamespace,
                    definitionService, configAdapter, definitionParserAdapter).getElement();
            builder.methods.put(methodDef.getDescriptor(), methodDef);
        } else {
            error("Found unexpected tag <%s>", tag);
        }
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        super.readAttributes();
        AuraContext context = contextService.getCurrentContext();
        context.pushCallingDescriptor(getDefDescriptor());
        try {
            String extendsNames = getAttributeValue(ATTRIBUTE_EXTENDS);
            if (extendsNames != null) {
                for (String extendsName : AuraTextUtil.splitSimple(",", extendsNames)) {
                    builder.extendsDescriptors.add(getDefDescriptor(extendsName.trim(), InterfaceDef.class));
                }
            }
            builder.setAccess(readAccessAttribute());
        } finally {
            context.popCallingDescriptor();
        }
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void finishDefinition() {
        builder.setLocation(startLocation);
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();
        if (!AuraTextUtil.isNullEmptyOrWhitespace(text)) {
            error("No literal text allowed in interface definition");
        }
    }

    @Override
    public RootDefinitionBuilder<InterfaceDef> getBuilder() {
        return builder;
    }

}
