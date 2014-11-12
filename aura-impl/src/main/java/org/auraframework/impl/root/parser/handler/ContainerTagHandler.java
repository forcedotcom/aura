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

import javax.xml.stream.*;

import org.auraframework.Aura;
import org.auraframework.def.*;
import org.auraframework.def.BaseComponentDef.WhitespaceBehavior;
import org.auraframework.def.ComponentDefRef.Load;
import org.auraframework.system.Location;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.*;

/**
 * Abstract handler for tags that contain other tags.
 */
public abstract class ContainerTagHandler<T extends Definition> extends XMLHandler<T> {
    protected Location startLocation;
    protected WhitespaceBehavior whitespaceBehavior = BaseComponentDef.DefaultWhitespaceBehavior;
    public static final String SCRIPT_TAG = "script";
    public static final String ATTRIBUTE_ACCESS = "access";

    public ContainerTagHandler() {
        super();
    }

    public ContainerTagHandler(XMLStreamReader xmlReader, Source<?> source) {
        super(xmlReader, source);
    }

    protected void readElement() throws XMLStreamException, QuickFixException {
        validateAttributes();
        this.startLocation = getLocation();
        String startTag = getTagName();
        if (!handlesTag(startTag)) {
            error("Expected start tag <%s> but found %s", getHandledTag(), getTagName());
        }
        readAttributes();
        readSystemAttributes();
        loop: while (xmlReader.hasNext()) {
            int next = xmlReader.next();
            switch (next) {
            case XMLStreamConstants.START_ELEMENT:
                handleChildTag();
                break;
            case XMLStreamConstants.CDATA:
            case XMLStreamConstants.CHARACTERS:
            case XMLStreamConstants.SPACE:
                handleChildText();
                break;
            case XMLStreamConstants.END_ELEMENT:
                if (!startTag.equalsIgnoreCase(getTagName())) {
                    error("Expected end tag <%s> but found %s", startTag, getTagName());
                }
                // we hit our own end tag, so stop handling
                break loop;
            case XMLStreamConstants.ENTITY_REFERENCE:
            case XMLStreamConstants.COMMENT:
                break;
            default:
                error("found something of type: %s", next);
            }
        }
        if (xmlReader.getEventType() != XMLStreamConstants.END_ELEMENT) {
            // must have hit EOF, barf time!
            error("Didn't find an end tag");
        }
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

    /**
     * called for every child tag that is encountered
     *
     * @throws QuickFixException
     */
    protected abstract void handleChildTag() throws XMLStreamException, QuickFixException;

    /**
     * Called for any literal text that is encountered
     */
    protected abstract void handleChildText() throws XMLStreamException, QuickFixException;

    /**
     * Override this to read in the attributes for the main tag this handler
     * handles
     *
     * @throws QuickFixException
     */
    protected void readAttributes() throws QuickFixException {
        // do nothing
    }

    protected void readSystemAttributes() throws QuickFixException {
        // do nothing
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
     * @return this container's tag. May return a more generic term for the
     *         class of tag expected if more than one is handled. Not safe for
     *         tag comparisons, only for messaging. For comparisons, use
     *         getHandledTag()
     */
    @Override
    public abstract String getHandledTag();

    /**
     * @return true if this handler can parse the given tag
     */
    protected boolean handlesTag(String tag) {
        return getHandledTag().equalsIgnoreCase(tag);
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
            return new HTMLComponentDefRefHandler<P>(parentHandler, tag, xmlReader, source);
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
                    return new LazyComponentDefRefHandler<P>(parentHandler, tag, xmlReader, source);
                }
            }

            return new ComponentDefRefHandler<P>(parentHandler, xmlReader, source);
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
        
        if ((source != null // if we have the source
            && source.isDefaultNamespaceSupported()) // and it supports a default namespace, say 'c'
            && tagName.startsWith(source.getDefaultNamespace() + ':') // and current tag has the default ns ex: <c:blurg/>
            && !source.getDefaultNamespace().equals(source.getDescriptor().getNamespace())) { // and the source has a different ns

            // use parent ns for the child
            tagName = source.getDescriptor().getNamespace() + tagName.substring(source.getDefaultNamespace().length()); 
        }
        
        return tagName;
    }
}
