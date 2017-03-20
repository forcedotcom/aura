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
package org.auraframework.impl.factory;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RootDefinition;
import org.auraframework.impl.source.AbstractTextSourceImpl;
import org.auraframework.system.DefinitionFactory;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Implementation of Parser. Parses XML Formatted Source to produce
 * ComponentDefs. Implemented as a pull-style parser using the StAX cursor API
 * to try to keep the memory footprint low, and reduce creation of extraneous
 * Objects.
 */
@ServiceComponent
public abstract class XMLParser<D extends RootDefinition> extends XMLParserBase<D>
        implements DefinitionFactory<TextSource<D>,D> {

    @Override
    public Class<?> getSourceInterface() {
        return TextSource.class;
    }

    @Override
    public String getMimeType() {
        return AbstractTextSourceImpl.MIME_XML;
    }

    @Override
    public D getDefinition(DefDescriptor<D> descriptor, TextSource<D> source) throws QuickFixException {
        return getDefinitionBuilder(descriptor, source).getBuilder().build();
    }
}
