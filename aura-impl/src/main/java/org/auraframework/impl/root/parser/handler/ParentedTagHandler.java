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

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamReader;

import org.apache.commons.lang3.StringUtils;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.def.ComponentDefRef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.impl.util.TextTokenizer;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Tag handler has a parent
 */
public abstract class ParentedTagHandler<T extends Definition, P extends Definition> extends ContainerTagHandler<T> {

    private final ContainerTagHandler<P> parentHandler;

    public ParentedTagHandler(XMLStreamReader xmlReader, TextSource<?> source, DefinitionService definitionService,
                              boolean isInInternalNamespace, ConfigAdapter configAdapter,
                              DefinitionParserAdapter definitionParserAdapter, ContainerTagHandler<P> parentHandler) {
        this(xmlReader, source, definitionService, isInInternalNamespace, configAdapter, definitionParserAdapter, parentHandler, null);
    }

    public ParentedTagHandler(XMLStreamReader xmlReader, TextSource<?> source, DefinitionService definitionService,
                              boolean isInInternalNamespace, ConfigAdapter configAdapter,
                              DefinitionParserAdapter definitionParserAdapter, ContainerTagHandler<P> parentHandler,
                              DefDescriptor<T> defDescriptor) {
        super(xmlReader, source, definitionService, isInInternalNamespace, configAdapter, definitionParserAdapter, defDescriptor);
        this.parentHandler = parentHandler;
    }

    protected ContainerTagHandler<P> getParentHandler() {
        return parentHandler;
    }

    protected DefDescriptor<P> getParentDefDescriptor(){
        return parentHandler.getDefDescriptor();
    }

    @Override
    public boolean isInInternalNamespace() {
        return parentHandler != null && parentHandler.isInInternalNamespace();
    }

    protected List<ComponentDefRef> tokenizeChildText() throws XMLStreamException, QuickFixException {
        String text = xmlReader.getText();

        boolean skip = StringUtils.isBlank(text);

        if (!skip) {
            TextTokenizer tokenizer = TextTokenizer.tokenize(text, getLocation());
            return tokenizer.asComponentDefRefs(parentHandler);
        }
        return Collections.emptyList();
    }
}
