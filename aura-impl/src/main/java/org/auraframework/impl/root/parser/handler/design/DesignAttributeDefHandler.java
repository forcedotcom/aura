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
import org.auraframework.def.design.DesignAttributeDef;
import org.auraframework.def.design.DesignAttributeDefaultDef;
import org.auraframework.def.design.DesignDef;
import org.auraframework.impl.design.DesignAttributeDefImpl;
import org.auraframework.impl.root.parser.handler.ParentedTagHandler;
import org.auraframework.impl.root.parser.handler.RootTagHandler;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.Set;

public class DesignAttributeDefHandler extends ParentedTagHandler<DesignAttributeDef, DesignDef> {
    public static final String TAG = "design:attribute";

    private static final String ATTRIBUTE_NAME = "name";
    private static final String ATTRIBUTE_LABEL = "label";
    private static final String ATTRIBUTE_TYPE = "type";
    private static final String ATTRIBUTE_REQUIRED = "required";
    private static final String ATTRIBUTE_READONLY = "readonly";
    private static final String ATTRIBUTE_DEPENDENCY = "dependsOn";
    private static final String ATTRIBUTE_DATASOURCE = "dataSource";
    private static final String ATTRIBUTE_MIN = "min";
    private static final String ATTRIBUTE_MAX = "max";
    private static final String ATTRIBUTE_PLACEHOLDER = "placeholder";
    private static final String ATTRIBUTE_DESCRIPTION = "description";
    private static final String ATTRIBUTE_DEFAULT = "default";
    //private attributes
    private static final String ATTRIBUTE_MIN_API = "minAPI";
    private static final String ATTRIBUTE_MAX_API = "maxAPI";
    private static final String ATTRIBUTE_TRANSLATABLE = "translatable";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_NAME, ATTRIBUTE_LABEL,
            ATTRIBUTE_TYPE, ATTRIBUTE_REQUIRED, ATTRIBUTE_READONLY, ATTRIBUTE_DEPENDENCY, ATTRIBUTE_DATASOURCE,
            ATTRIBUTE_MIN, ATTRIBUTE_MAX, ATTRIBUTE_PLACEHOLDER, ATTRIBUTE_DESCRIPTION, ATTRIBUTE_DEFAULT );

    private final static Set<String> INTERNAL_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_NAME, ATTRIBUTE_LABEL,
            ATTRIBUTE_TYPE, ATTRIBUTE_REQUIRED, ATTRIBUTE_READONLY, ATTRIBUTE_DEPENDENCY, ATTRIBUTE_DATASOURCE,
            ATTRIBUTE_MIN, ATTRIBUTE_MAX, ATTRIBUTE_PLACEHOLDER, ATTRIBUTE_DESCRIPTION, ATTRIBUTE_DEFAULT,
            ATTRIBUTE_MAX_API, ATTRIBUTE_MIN_API, ATTRIBUTE_TRANSLATABLE );

    private final DesignAttributeDefImpl.Builder builder = new DesignAttributeDefImpl.Builder();

    public DesignAttributeDefHandler() {
        super();
    }

    // TODO implement tool specific properties
    public DesignAttributeDefHandler(RootTagHandler<DesignDef> parentHandler, XMLStreamReader xmlReader,
                                     TextSource<?> source, boolean isInInternalNamespace, DefinitionService definitionService,
                                     ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(parentHandler, xmlReader, source, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
        builder.setAccess(getAccess(isInInternalNamespace));
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        super.readAttributes();

        String name = getAttributeValue(ATTRIBUTE_NAME);
        String label = getAttributeValue(ATTRIBUTE_LABEL);
        String type = getAttributeValue(ATTRIBUTE_TYPE);
        Boolean required = getBooleanAttributeValue(ATTRIBUTE_REQUIRED);
        Boolean readonly = getBooleanAttributeValue(ATTRIBUTE_READONLY);
        String dependency = getAttributeValue(ATTRIBUTE_DEPENDENCY);
        String datasource = getAttributeValue(ATTRIBUTE_DATASOURCE);
        String min = getAttributeValue(ATTRIBUTE_MIN);
        String max = getAttributeValue(ATTRIBUTE_MAX);
        String placeholder = getAttributeValue(ATTRIBUTE_PLACEHOLDER);
        String description = getAttributeValue(ATTRIBUTE_DESCRIPTION);
        String defaultValue = getAttributeValue(ATTRIBUTE_DEFAULT);
        String minApi = getAttributeValue(ATTRIBUTE_MIN_API);
        String maxApi = getAttributeValue(ATTRIBUTE_MAX_API);
        Boolean translatable = getBooleanAttributeValue(ATTRIBUTE_TRANSLATABLE);

        if (!AuraTextUtil.isNullEmptyOrWhitespace(name)) {
            builder.setDescriptor(definitionService.getDefDescriptor(name, DesignAttributeDef.class));
            builder.setName(name);
        } else {
            error("Name attribute is required for attribute design definitions");
        }

        builder.setLabel(label);
        builder.setType(type);
        builder.setDependsOn(dependency);
        builder.setDataSource(datasource);
        builder.setMin(min);
        builder.setMax(max);
        builder.setRequired(required);
        builder.setReadOnly(readonly);
        builder.setPlaceholderText(placeholder);
        builder.setDescription(description);
        builder.setLocation(getLocation());
        builder.setDefault(defaultValue);
        builder.setMinApi(minApi);
        builder.setMaxApi(maxApi);
        builder.setTranslatable(translatable);
        builder.setParentDescriptor(getParentDefDescriptor());
        builder.setIsInternalNamespace(isInInternalNamespace());
        builder.setAccess(readAccessAttribute());
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();
        if (isInInternalNamespace() && DesignAttributeDefaultDefHandler.TAG.equalsIgnoreCase(tag)) {
            DesignAttributeDefaultDef def = new DesignAttributeDefaultDefHandler(getParentHandler(), xmlReader, source,
                    isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter).getElement();
            builder.setDefault(def);
        } else {
            error("Found unexpected tag %s", getTagName());
        }
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        if (!AuraTextUtil.isNullEmptyOrWhitespace(xmlReader.getText())) {
            error("No literal text allowed in attribute design definition");
        }
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return isInInternalNamespace() ? INTERNAL_ATTRIBUTES : ALLOWED_ATTRIBUTES;
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }

    @Override
    protected void finishDefinition() {
    }

    @Override
    protected DesignAttributeDef createDefinition() throws QuickFixException {
        return builder.build();
    }
}
