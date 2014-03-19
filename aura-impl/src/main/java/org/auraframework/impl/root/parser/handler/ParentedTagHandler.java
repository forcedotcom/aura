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

import java.util.Collections;
import java.util.List;

import javax.xml.stream.*;

import org.auraframework.def.BaseComponentDef.WhitespaceBehavior;
import org.auraframework.def.*;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;

/**
 * Tag handler has a parent
 */
public abstract class ParentedTagHandler<T extends Definition, P extends RootDefinition> extends ContainerTagHandler<T> {

    private RootTagHandler<P> parentHandler;

    public ParentedTagHandler() {
        super();
    }

    public ParentedTagHandler(RootTagHandler<P> parentHandler, XMLStreamReader xmlReader, Source<?> source) {
        super(xmlReader, source);
        this.parentHandler = parentHandler;
        this.setWhitespaceBehavior(parentHandler == null ? WhitespaceBehavior.OPTIMIZE : parentHandler
                .getWhitespaceBehavior());
    }

    protected RootTagHandler<P> getParentHandler() {
        return parentHandler;
    }
    
    protected boolean isInPrivilegedNamespace() {
    	return parentHandler.isInPrivilegedNamespace();
	}

    protected List<ComponentDefRef> tokenizeChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();

        boolean skip = getWhitespaceBehavior() == WhitespaceBehavior.OPTIMIZE ? AuraTextUtil
                .isNullEmptyOrWhitespace(text) : AuraTextUtil.isNullOrEmpty(text);

        if (!skip) {
            TextTokenizer tokenizer = TextTokenizer.tokenize(text, getLocation(), getWhitespaceBehavior());
            return tokenizer.asComponentDefRefs(parentHandler);
        }
        return Collections.emptyList();
    }
    
    /*
     * This method is essentially a generic HTML parser. If we ever refactor XMLHandler to allow handlers without
     * Definitions, this should probably be pulled into its own handler.
     */
    protected String handleHTML() throws QuickFixException, XMLStreamException {
        StringBuilder sb = new StringBuilder();
        
        String startTag = getTagName();
        
        if (HtmlTag.allowed(startTag)) {
            StringBuilder attrs = new StringBuilder();
            for (int i = 0; i < xmlReader.getAttributeCount(); i++) {
                attrs.append(String.format(" %s=\"%s\"", xmlReader.getAttributeName(i), xmlReader.getAttributeValue(i)));
            }
            
            sb.append(String.format("<%s%s>", startTag, attrs.toString()));
        } else {
            error("Found invalid tag <%s>", startTag);
        }
                
        loop: while (xmlReader.hasNext()) {
            int next = xmlReader.next();
            switch (next) {
            case XMLStreamConstants.START_ELEMENT:
                sb.append(handleHTML());
                break;
            case XMLStreamConstants.CDATA:
            case XMLStreamConstants.CHARACTERS:
            case XMLStreamConstants.SPACE:
                sb.append(handleHTMLText());
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
        
        sb.append(String.format("</%s>", startTag));
        return sb.toString();
    }
    
    protected String handleHTMLText() {
        String text = xmlReader.getText();
        String ret = "";

        if (!AuraTextUtil.isNullEmptyOrWhitespace(text)) {
            ret = AuraTextUtil.replaceSimple(text,  new String[]{"<", ">"}, new String[]{"&lt;", "&gt;"});
        }
        
        return ret;
        
    }
}
