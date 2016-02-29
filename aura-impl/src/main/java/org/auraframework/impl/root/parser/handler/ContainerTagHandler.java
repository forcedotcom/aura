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

import org.auraframework.Aura;
import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.BaseComponentDef.WhitespaceBehavior;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.ComponentDefRef.Load;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.def.HtmlTag;
import org.auraframework.def.RootDefinition;
import org.auraframework.expression.PropertyReference;
import org.auraframework.system.Source;
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
    protected WhitespaceBehavior whitespaceBehavior = BaseComponentDef.DefaultWhitespaceBehavior;
    protected DefDescriptor<T> defDescriptor;

    public ContainerTagHandler() {
        super();
        this.defDescriptor = null;
        this.isInInternalNamespace = true;
    }

    public ContainerTagHandler(XMLStreamReader xmlReader, Source<?> source) {
        this(null, xmlReader, source);
    }

    public ContainerTagHandler(DefDescriptor<T> defDescriptor, XMLStreamReader xmlReader, Source<?> source) {
        super(xmlReader, source);
        this.defDescriptor = defDescriptor;
        this.isInInternalNamespace = defDescriptor == null || Aura.getConfigAdapter().isInternalNamespace(defDescriptor.getNamespace());
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

    @Override
    public final T getElement() throws XMLStreamException, QuickFixException {
        if (source.exists()) {
            readElement();
        }
        return createDefinition();
    }

    public final T getErrorElement() throws QuickFixException {
        return createDefinition();
    }

    public WhitespaceBehavior getWhitespaceBehavior() {
        return whitespaceBehavior;
    }

    public void setWhitespaceBehavior(WhitespaceBehavior val) {
        whitespaceBehavior = val;
    }

    protected DefinitionAccess readAccessAttribute() throws InvalidAccessValueException {
        String access = getAttributeValue(ATTRIBUTE_ACCESS);
        if (access != null) {
            DefinitionAccess a;
            try {
                String namespace = source.getDescriptor().getNamespace();
                a = Aura.getDefinitionParserAdapter().parseAccess(namespace, access);
                a.validate(namespace, allowAuthenticationAttribute(), allowPrivateAttribute());
            } catch (InvalidAccessValueException e) {
                // re-throw with location
                throw new InvalidAccessValueException(e.getMessage(), getLocation());
            }
            return a;
        }
        else {
            return null;
        }
    }

    protected  boolean allowAuthenticationAttribute() {
        return false;
    }

    protected boolean allowPrivateAttribute() {
        return false;
    }

    /**
     * Create and return the definition
     *
     * @throws QuickFixException
     */
    protected abstract T createDefinition() throws QuickFixException;

    protected <P extends RootDefinition> ParentedTagHandler<? extends ComponentDefRef, ?> getDefRefHandler(
            RootTagHandler<P> parentHandler) throws DefinitionNotFoundException {
        String tag = getTagName();
        if (HtmlTag.allowed(tag)) {
            if (!parentHandler.getAllowsScript() && SCRIPT_TAG.equals(tag.toLowerCase())) {
                throw new AuraRuntimeException("script tags only allowed in templates", getLocation());
            }
            return new HTMLComponentDefRefHandler<>(parentHandler, tag, xmlReader, source);
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
                    return new LazyComponentDefRefHandler<>(parentHandler, tag, xmlReader, source);
                }
            }

            return new ComponentDefRefHandler<>(parentHandler, xmlReader, source);
        }
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
}
