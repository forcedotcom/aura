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
package org.auraframework.impl.root.parser;

import javax.xml.stream.XMLStreamReader;

import org.auraframework.def.TokensDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.root.parser.handler.TokensDefHandler;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;

public class TokensXMLParser extends XMLParser<TokensDef> {
    @Override
    protected TokensDefHandler getHandler(DefDescriptor<TokensDef> descriptor,
            Source<TokensDef> source, XMLStreamReader xmlReader) throws QuickFixException {
        return new TokensDefHandler(descriptor, source, xmlReader);
    }
}
