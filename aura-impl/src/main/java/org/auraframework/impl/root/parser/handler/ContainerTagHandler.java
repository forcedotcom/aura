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

import javax.xml.stream.XMLStreamConstants;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.BaseComponentDef;
import org.auraframework.def.BaseComponentDef.WhitespaceBehavior;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.ComponentDefRef.Load;
import org.auraframework.def.Definition;
import org.auraframework.def.HtmlTag;
import org.auraframework.def.RootDefinition;
import org.auraframework.system.Location;
import org.auraframework.system.Source;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Abstract handler for tags that contain other tags.
 */
public abstract class ContainerTagHandler<T extends Definition> extends XMLHandler<T> {
    protected Location startLocation;
    protected WhitespaceBehavior whitespaceBehavior = BaseComponentDef.DefaultWhitespaceBehavior;
    public static final String SCRIPT_TAG = "script";

    public ContainerTagHandler() {
        super();
    }

    public ContainerTagHandler(XMLStreamReader xmlReader, Source<?> source) {
        super(xmlReader, source);
    }

    @Override
    public final T getElement() throws XMLStreamException, QuickFixException {
        if (source.exists()) {
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
            RootTagHandler<P> parentHandler) {
        String tag = getTagName();
        if (HtmlTag.allowed(tag)) {
            if (!parentHandler.getAllowsScript() && SCRIPT_TAG.equals(tag.toLowerCase())) {
                throw new AuraRuntimeException("script tags only allowed in templates", getLocation());
            }
            return new HTMLComponentDefRefHandler<P>(parentHandler, tag, xmlReader, source);
        } else if (ForEachDefHandler.TAG.equalsIgnoreCase(tag)) {
            return new ForEachDefHandler<P>(parentHandler, xmlReader, source);
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
}
