/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.Definition;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.BaseComponentDef.WhitespaceBehavior;
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
}
