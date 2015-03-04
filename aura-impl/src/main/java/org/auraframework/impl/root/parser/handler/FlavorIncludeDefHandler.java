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

import java.io.IOException;
import java.util.Set;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.FlavorIncludeDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.css.flavor.FlavorIncludeDefImpl;
import org.auraframework.impl.css.util.Flavors;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

import com.google.common.collect.ImmutableSet;

public class FlavorIncludeDefHandler<P extends RootDefinition> extends ParentedTagHandler<FlavorIncludeDef, P> {
    protected static final String TAG = "aura:flavor";
    private static final String ATTRIBUTE_COMPONENT = "component";
    private static final String ATTRIBUTE_FLAVOR = "flavor";
    private static final String ATTRIBUTE_NAMED = "named";
    private static final String ATTRIBUTE_NAMESPACE = "namespace";

    private final static Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(
            ATTRIBUTE_COMPONENT, ATTRIBUTE_FLAVOR, ATTRIBUTE_NAMED, ATTRIBUTE_NAMESPACE, ATTRIBUTE_DESCRIPTION);

    private final FlavorIncludeDefImpl.Builder builder = new FlavorIncludeDefImpl.Builder();

    public FlavorIncludeDefHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(parentHandler, xmlReader, source);
        builder.setLocation(getLocation());
        builder.setParentDescriptor(parentHandler.getDefDescriptor());
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
        // component / flavor
        String component = getAttributeValue(ATTRIBUTE_COMPONENT);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(component)) {
            DefDescriptor<ComponentDef> componentDesc = DefDescriptorImpl.getInstance(component, ComponentDef.class);
            builder.setComponent(componentDesc);

            String flavor = getAttributeValue(ATTRIBUTE_FLAVOR);
            if (!AuraTextUtil.isNullEmptyOrWhitespace(flavor)) {
                builder.setFlavor(Flavors.buildFlavorRef(componentDesc, flavor));
            }
        }

        // named / namespace
        String named = getAttributeValue(ATTRIBUTE_NAMED);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(named)) {
            builder.setFilteredName(named);
        }

        String namespace = getAttributeValue(ATTRIBUTE_NAMESPACE);
        if (!AuraTextUtil.isNullEmptyOrWhitespace(namespace)) {
            builder.setFilterNamespace(namespace);
        }

        builder.setDescription(getAttributeValue(ATTRIBUTE_DESCRIPTION));
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

    @Override
    protected FlavorIncludeDef createDefinition() throws QuickFixException {
        return builder.build();
    }

    @Override
    public void writeElement(FlavorIncludeDef def, Appendable out) throws IOException {}
}
