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

import javax.xml.stream.XMLStreamReader;

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.DefinitionParserAdapter;
import org.auraframework.builder.DefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.service.DefinitionService;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Class for a tag that is a top level tag for a file, but is not a "root" tag (SVG, DocumentationDef).
 */
public abstract class FileTagHandler<T extends Definition> extends ContainerTagHandler<T> {
    protected FileTagHandler() {
        super();
    }

    protected FileTagHandler(DefDescriptor<T> defDescriptor, TextSource<?> source, XMLStreamReader xmlReader,
                             boolean isInInternalNamespace, DefinitionService definitionService,
                             ConfigAdapter configAdapter, DefinitionParserAdapter definitionParserAdapter) {
        super(defDescriptor, xmlReader, source, isInInternalNamespace, definitionService, configAdapter, definitionParserAdapter);
    }

    public abstract DefBuilder<T,T> getBuilder();

    public XMLStreamReader getXMLReader() {
        return xmlReader;
    }

    @Override
    protected T createDefinition() throws QuickFixException {
        return getBuilder().build();
    }

    public void setParseError(Throwable t) {
        DefBuilder<T,T> builder = getBuilder();

        if (builder != null) {
            builder.setParseError(t);
        }
    }

}

