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

import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.apache.commons.lang3.StringUtils;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.IncludeDef;
import org.auraframework.def.LibraryDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.root.library.IncludeDefRefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.impl.util.TypeParser;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableSet;

public class IncludeDefRefHandler extends XMLHandler<IncludeDefRefImpl> {

    public static final String TAG = "aura:include";

    private static final String ATTRIBUTE_NAME = "name";
    private static final String ATTRIBUTE_IMPORTS = "imports";
    private static final String ATTRIBUTE_ALIASES = "aliases";
    private static final String ATTRIBUTE_EXPORT = "export";

    protected final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(
            ATTRIBUTE_NAME, ATTRIBUTE_IMPORTS, ATTRIBUTE_ALIASES, ATTRIBUTE_EXPORT, RootTagHandler.ATTRIBUTE_DESCRIPTION);

    private final RootTagHandler<? extends RootDefinition> parentHandler;
    private final IncludeDefRefImpl.Builder builder = new IncludeDefRefImpl.Builder();

    public IncludeDefRefHandler(RootTagHandler<? extends RootDefinition> parentHandler, XMLStreamReader xmlReader,
                                TextSource<?> source, DefinitionService definitionService) {
        super(xmlReader, source, definitionService);
        this.parentHandler = parentHandler;
    }

    @Override
    @SuppressWarnings("unchecked")
    public IncludeDefRefImpl getElement() throws XMLStreamException, QuickFixException {
    	DefDescriptor<LibraryDef> parentDescriptor = (DefDescriptor<LibraryDef>) parentHandler.getDefDescriptor();
        if (parentDescriptor.getDefType() != DefType.LIBRARY) {
            throw new InvalidDefinitionException("aura:include may only be set in a library.", getLocation());
        }

        validateAttributes();

        builder.setLocation(getLocation());

        String name = getAttributeValue(ATTRIBUTE_NAME);
        builder.setDescriptor(definitionService.getDefDescriptor(String.format("js://%s.%s", parentDescriptor.getNamespace(), name), IncludeDef.class, parentDescriptor));

        String importNames = getAttributeValue(ATTRIBUTE_IMPORTS);
        if (!StringUtils.isBlank(importNames)) {
            List<DefDescriptor<IncludeDef>> imports = new LinkedList<>();
            for (String importName : Arrays.asList(importNames.trim().split("\\s*\\,\\s*"))) {
                TypeParser.Type parsed = TypeParser.parseTagTriple(importName);
                if (parsed == null) {
                    throw new InvalidDefinitionException(String.format(
                            "Invalid name in aura:include imports property: %s", importName), getLocation());
                }
                if (parsed.namespace == null) {
                    // local import
                    imports.add(new DefDescriptorImpl<>("js", parentDescriptor.getNamespace(), parsed.name,
                            IncludeDef.class, parentDescriptor));
                } else { // external import
                    DefDescriptor<LibraryDef> externalLibrary = new DefDescriptorImpl<>("markup",
                            parsed.namespace, parsed.name, LibraryDef.class);
                    imports.add(new DefDescriptorImpl<>("js", parsed.namespace, parsed.subName,
                            IncludeDef.class, externalLibrary));
                }
            }
            builder.setImports(imports);
        }

        String aliases = getAttributeValue(ATTRIBUTE_ALIASES);
        if (!StringUtils.isBlank(aliases)) {
            List<String> aliasList = Arrays.asList(aliases.trim().split("\\s*\\,\\s*"));
            builder.setAliases(aliasList);
        }

        String export = getAttributeValue(ATTRIBUTE_EXPORT);
        if (!StringUtils.isBlank(export)) {
            builder.setExport(export);
        }
        builder.setDescription(getAttributeValue(RootTagHandler.ATTRIBUTE_DESCRIPTION));

        int next = xmlReader.next();
        if (next != XMLStreamConstants.END_ELEMENT || !TAG.equalsIgnoreCase(getTagName())) {
            error("expected end of %s tag", TAG);
        }

        builder.setOwnHash(source.getHash());
        builder.setAccess(new DefinitionAccessImpl(Access.PRIVATE));


        // TODO: FIXME
        // can only get IncludeDef from the bundle because we only compile top level.
        builder.setIncludeDef(parentHandler.getBundledDef(builder.getDescriptor()));
        builder.setMinifyEnabled(true);

        return builder.build();
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return ALLOWED_ATTRIBUTES;
    }

    @Override
    public String getHandledTag() {
        return TAG;
    }
}
