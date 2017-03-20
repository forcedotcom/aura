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
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefinitionReference;
import org.auraframework.def.DefinitionReference.Load;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.HtmlTag;
import org.auraframework.def.RootDefinition;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.root.component.DefRefDelegate;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.AuraContext;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.throwable.quickfix.QuickFixException;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;
import java.util.Set;


/**
 * Abstract handler for tags that contain other tags.
 */
public abstract class ContainerTagHandler<T extends Definition> extends XMLHandler<T>
        implements ExpressionContainerHandler {
    public static final String SCRIPT_TAG = "script";
    public static final String ATTRIBUTE_ACCESS = "access";
    protected final boolean isInInternalNamespace;
    protected DefDescriptor<T> defDescriptor;

    protected final ConfigAdapter configAdapter;
    protected final DefinitionParserAdapter definitionParserAdapter;

    public ContainerTagHandler() {
        super();
        this.defDescriptor = null;
        this.isInInternalNamespace = true;
        this.configAdapter = null;
        this.definitionParserAdapter = null;
    }

    public ContainerTagHandler(XMLStreamReader xmlReader, TextSource<?> source, boolean isInInternalNamespace,
                               DefinitionService definitionService, ConfigAdapter configAdapter,
                               DefinitionParserAdapter definitionParserAdapter) {
        this(null, xmlReader, source, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
    }

    public ContainerTagHandler(DefDescriptor<T> defDescriptor, XMLStreamReader xmlReader, TextSource<?> source,
                               boolean isInInternalNamespace, DefinitionService definitionService,
                               ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(xmlReader, source, definitionService);
        this.defDescriptor = defDescriptor;
        this.isInInternalNamespace = isInInternalNamespace;
        this.configAdapter = configAdapter;
        this.definitionParserAdapter = definitionParserAdapter;
    }

    public boolean isInInternalNamespace() {
        return isInInternalNamespace;
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

    public final void process() throws XMLStreamException, QuickFixException {
        try {
        readElement();
        } finally {
            finishDefinition();
        }
    }

    @Override
    public final T getElement() throws QuickFixException, XMLStreamException {
        process();
        return createDefinition();
    }

    protected DefinitionAccess readAccessAttribute() throws InvalidAccessValueException {
        String access = getAttributeValue(ATTRIBUTE_ACCESS);
        if (access != null) {
            DefinitionAccess a;
            try {
                String namespace = source.getDescriptor().getNamespace();
                a = definitionParserAdapter.parseAccess(namespace, access);
                a.validate(namespace, allowAuthenticationAttribute(), allowPrivateAttribute(), configAdapter);
            } catch (InvalidAccessValueException e) {
                // re-throw with location
                throw new InvalidAccessValueException(e.getMessage(), getLocation());
            }
            return a;
        }
        else {
            return getAccess(isInInternalNamespace);
        }
    }

    protected  boolean allowAuthenticationAttribute() {
        return false;
    }

    protected boolean allowPrivateAttribute() {
        return false;
    }

    protected abstract T createDefinition() throws QuickFixException;

    /**
     * A place to put on any finishing touches that are needed.
     *
     * this will always be called prior to creating the definition.
     * Defined here as empty to allow extenders to not implement this at all.
     */
    protected void finishDefinition() throws QuickFixException {
    }

    protected <P extends RootDefinition> ParentedTagHandler<? extends ComponentDefRef, ?> getDefRefHandler(
            RootTagHandler<P> parentHandler) throws DefinitionNotFoundException {
        String tag = getTagName();
        if (HtmlTag.allowed(tag)) {
            if (!parentHandler.getAllowsScript() && SCRIPT_TAG.equals(tag.toLowerCase())) {
                throw new AuraRuntimeException("script tags only allowed in templates", getLocation());
            }
            return new HTMLComponentDefRefHandler<>(parentHandler, tag, xmlReader, source, isInInternalNamespace,
                    definitionService, configAdapter, definitionParserAdapter);
        } else {
            String loadString = getSystemAttributeValue("load");
            if (loadString != null) {
                Load load = null;
                try {
                    load = Load.valueOf(loadString.toUpperCase());
                } catch (IllegalArgumentException e) {
                    throw new AuraRuntimeException(String.format(
                            "Invalid value '%s' specified for 'aura:load' attribute", loadString), getLocation());
                }
                if (load == Load.LAZY || load == Load.EXCLUSIVE) {
                    return new LazyComponentDefRefHandler<>(parentHandler, tag, xmlReader, source, isInInternalNamespace,
                            definitionService, configAdapter, definitionParserAdapter);
                }
            }

            return new ComponentDefRefHandler<>(parentHandler, xmlReader, source, isInInternalNamespace,
                    definitionService, configAdapter, definitionParserAdapter);
        }
    }

    protected DefinitionReference createDefRefDelegate(ComponentDefRef defRef) throws DefinitionNotFoundException {
        return new DefRefDelegate(defRef);
    }

    protected <P extends RootDefinition> DefinitionReference createDefRefDelegate(RootTagHandler<P> parentHandler)
            throws QuickFixException, XMLStreamException {
        return createDefRefDelegate(getDefRefHandler(parentHandler).getElement());
    }

    /**
     * If we are dealing with a source that supports a default namespace
     * then tags need to re-written to make sure they have the correct parent ns
     * Ex:
     * parentNs:foobar
     * ---------------
     * <aura:component><aura:iteration items="{!v.items}" var="item"><c:blurg item={!item} /></></>
     *
     * In this case c:blurg needs to be returned as parentNs:blurg so we can link it to the correct source.
     */
    @Override
    protected final String getTagName() {
        String tagName = super.getTagName();

        if (tagName.indexOf(':') != -1 && isDefaultNamespaceUsed(tagName.substring(0, tagName.indexOf(':')))) {
            // use parent ns for the child
            tagName = source.getDescriptor().getNamespace() + tagName.substring(source.getDefaultNamespace().length());
        }

        return tagName;
    }

    /**
     * Returns DefinitionAccess based on privileged namespace
     *
     * @param isInInternalNamespace privileged namespace
     * @return INTERNAL access for privileged namespace or PUBLIC for any other
     */
    protected DefinitionAccess getAccess(boolean isInInternalNamespace) {
        return new DefinitionAccessImpl(isInInternalNamespace ? AuraContext.Access.INTERNAL : AuraContext.Access.PUBLIC);
    }
}
