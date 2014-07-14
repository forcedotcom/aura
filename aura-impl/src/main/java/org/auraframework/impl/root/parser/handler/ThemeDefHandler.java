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
import java.util.Map;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.Aura;
import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.def.ThemeDefRef;
import org.auraframework.def.ThemeDescriptorProviderDef;
import org.auraframework.def.ThemeMapProviderDef;
import org.auraframework.def.VarDef;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.root.theme.ThemeDefImpl;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.Component;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraError;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;

/**
 * Handler for aura:theme tags.
 */
public final class ThemeDefHandler extends RootTagHandler<ThemeDef> {
    protected static final String TAG = "aura:theme";
    private static final String ATTRIBUTE_EXTENDS = "extends";
    private static final String ATTRIBUTE_PROVIDER = "provider";
    private static final String ATTRIBUTE_MAP_PROVIDER = "mapProvider";

    protected final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(
            ATTRIBUTE_EXTENDS, ATTRIBUTE_PROVIDER, ATTRIBUTE_MAP_PROVIDER, ATTRIBUTE_SUPPORT,
            ATTRIBUTE_DESCRIPTION, ATTRIBUTE_ACCESS, RootTagHandler.ATTRIBUTE_API_VERSION);

    private final ThemeDefImpl.Builder builder = new ThemeDefImpl.Builder();

    public ThemeDefHandler() {
        super();
    }

    public ThemeDefHandler(DefDescriptor<ThemeDef> defDescriptor, Source<ThemeDef> source, XMLStreamReader xmlReader)
            throws DefinitionNotFoundException {
        super(defDescriptor, source, xmlReader);

        if (!isInPrivilegedNamespace()) {
            throw new DefinitionNotFoundException(defDescriptor);
        }

        builder.setOwnHash(source.getHash());
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
    protected RootDefinitionBuilder<ThemeDef> getBuilder() {
        return builder;
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        super.readAttributes();

        String parent = getAttributeValue(ATTRIBUTE_EXTENDS);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(parent)) {
            builder.setExtendsDescriptor(DefDescriptorImpl.getInstance(parent.trim(), ThemeDef.class));
        }

        String provider = getAttributeValue(ATTRIBUTE_PROVIDER);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(provider)) {
            builder.setDescriptorProvider(DefDescriptorImpl.getInstance(provider, ThemeDescriptorProviderDef.class));
        }

        String mapProvider = getAttributeValue(ATTRIBUTE_MAP_PROVIDER);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(mapProvider)) {
            builder.setMapProvider(DefDescriptorImpl.getInstance(mapProvider, ThemeMapProviderDef.class));
        }

        try {
            builder.setAccess(readAccessAttribute());
        } catch (InvalidAccessValueException e) {
            builder.setParseError(e);
        }
    }

    @Override
    protected boolean allowPrivateAttribute() {
        return true;
    }

    @Override
    protected void handleChildTag() throws XMLStreamException, QuickFixException {
        String tag = getTagName();

        if (VarDefHandler.TAG.equalsIgnoreCase(tag)) {
            VarDef def = new VarDefHandler<ThemeDef>(this, xmlReader, source).getElement();
            if (builder.vars().containsKey(def.getName())) {
                error("Duplicate var %s", def.getName());
            }
            builder.addVarDef(def);

        } else if (ThemeDefRefHandler.TAG.equalsIgnoreCase(tag)) {
            // imports must come before vars. This is mainly for simplifying the var lookup implementation, while still
            // matching the most common expected usages of imports vs. declared vars.
            if (!builder.vars().isEmpty()) {
                error("tag %s must come before all declared vars", ThemeDefRefHandler.TAG);
            }

            ThemeDefRef def = new ThemeDefRefHandler<ThemeDef>(this, xmlReader, source).getElement();
            if (builder.imports().contains(def.getThemeDescriptor())) {
                error("Duplicate theme import %s", def.getName());
            }
            builder.addImport(def.getThemeDescriptor());
        } else {
            error("Found unexpected tag %s", tag);
        }
    }

    @Override
    protected void handleChildText() throws XMLStreamException, QuickFixException {
        if (!AuraTextUtil.isNullEmptyOrWhitespace(xmlReader.getText())) {
            error("No literal text allowed in theme definition");
        }
    }

    @Override
    public void addExpressionReferences(Set<PropertyReference> propRefs) {
        builder.addAllExpressionRefs(propRefs);
    }

    @Override
    protected ThemeDef createDefinition() throws QuickFixException {
        builder.setDescriptor(getDefDescriptor());
        builder.setLocation(startLocation);

        // we determine that a theme is a cmp theme if it exists in the same bundle as a css source
        String fmt = String.format("%s.%s", defDescriptor.getNamespace(), defDescriptor.getName());
        DefDescriptor<StyleDef> style = Aura.getDefinitionService().getDefDescriptor(fmt, StyleDef.class);
        builder.setIsCmpTheme(style.exists());

        return builder.build();
    }

    @Override
    public void writeElement(ThemeDef def, Appendable out) throws IOException {
        try {
            Map<String, Object> attributes = ImmutableMap.<String, Object>of("def", def);
            DefinitionService defService = Aura.getDefinitionService();
            DefDescriptor<ComponentDef> tmplDesc = defService.getDefDescriptor("auradev:saveTheme", ComponentDef.class);
            Component tmpl = Aura.getInstanceService().getInstance(tmplDesc, attributes);
            Aura.getRenderingService().render(tmpl, out);
        } catch (QuickFixException x) {
            throw new AuraError(x);
        }
    }
}
