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

import javax.xml.stream.XMLStreamReader;

import org.auraframework.Aura;
import org.auraframework.builder.RootDefinitionBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.RootDefinition.SupportLevel;
import org.auraframework.expression.PropertyReference;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.ImmutableSet;

/**
 * Super class for the top level tags, handles some common setup
 */
public abstract class RootTagHandler<T extends RootDefinition> extends ContainerTagHandler<T> implements
        ExpressionContainerHandler {

    protected final DefDescriptor<T> defDescriptor;
	protected final boolean isInPrivilegedNamespace;

    protected static final String ATTRIBUTE_SUPPORT = "support";
    protected static final String ATTRIBUTE_DESCRIPTION = "description";
    protected static final String ATTRIBUTE_API_VERSION = "apiVersion";

    protected static final Set<String> ALLOWED_ATTRIBUTES = ImmutableSet.of(ATTRIBUTE_DESCRIPTION);
    protected static final Set<String> PRIVILEGED_ALLOWED_ATTRIBUTES = new ImmutableSet.Builder<String>().add(ATTRIBUTE_SUPPORT).addAll(ALLOWED_ATTRIBUTES).build();

    protected RootTagHandler() {
        super();
        this.defDescriptor = null;
        this.isInPrivilegedNamespace = true;
    }

    protected RootTagHandler(DefDescriptor<T> defDescriptor, Source<?> source, XMLStreamReader xmlReader) {
        super(xmlReader, source);
        this.defDescriptor = defDescriptor;
        this.isInPrivilegedNamespace = defDescriptor != null ? Aura.getConfigAdapter().isPrivilegedNamespace(defDescriptor.getNamespace()) : true;
    }

    public boolean isInPrivilegedNamespace() {
        return isInPrivilegedNamespace;
    }

    protected DefDescriptor<T> getDefDescriptor() {
        return defDescriptor;
    }

    @Override
    public void addExpressionReferences(Set<PropertyReference> propRefs) {
        // TODO: this should be a typed exception
        throw new AuraRuntimeException("Expressions are not allowed inside a " + defDescriptor.getDefType()
                + " definition", propRefs.iterator().next().getLocation());
    }

    @Override
    public Set<String> getAllowedAttributes() {
        return isInPrivilegedNamespace ? PRIVILEGED_ALLOWED_ATTRIBUTES : ALLOWED_ATTRIBUTES;
    }

	/**
     * Determines whether HTML parsing will allow script tags to be embedded.
     * False by default, so must be overridden to allow embedded script tag.
     * 
     * @return - return true if your instance should allow embedded script tags in HTML
     */
    public boolean getAllowsScript() {
        return false;
    }

    protected abstract RootDefinitionBuilder<T> getBuilder();

    public void setParseError(Throwable t) {
        RootDefinitionBuilder<T> builder = getBuilder();

        if (builder != null) {
            builder.setParseError(t);
        }
    }

    @Override
    protected void readAttributes() throws QuickFixException {
        RootDefinitionBuilder<T> builder = getBuilder();
        String supportName = getAttributeValue(ATTRIBUTE_SUPPORT);
        if (supportName != null) {
            try {
                builder.setSupport(SupportLevel.valueOf(supportName.toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new AuraRuntimeException(String.format("Invalid support level %s", supportName),
                        this.getLocation());
            }
        }
        
        builder.setAPIVersion(getAttributeValue(ATTRIBUTE_API_VERSION));
        builder.setDescription(getAttributeValue(ATTRIBUTE_DESCRIPTION));
    }
}
