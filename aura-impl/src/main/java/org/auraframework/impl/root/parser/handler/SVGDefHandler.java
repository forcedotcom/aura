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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.SVGDef;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.svg.SVGDefImpl;
import org.auraframework.system.AuraContext;
import org.auraframework.system.TextSource;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.SVGParserException;
import org.auraframework.util.IOUtil;

import java.io.IOException;
import java.io.Reader;

public class SVGDefHandler<D extends Definition> {
    private static final int MAX_SVG_LENGTH = 150 * 1024;

    private final SVGDefImpl.Builder builder = new SVGDefImpl.Builder();

    public SVGDefHandler() {
        super();
    }

    @SuppressWarnings("unchecked")
    public SVGDefHandler(DefDescriptor<D> defDescriptor, TextSource<SVGDef> source) throws SVGParserException {
        builder.setDescriptor((DefDescriptor<SVGDef>) defDescriptor);
        builder.setLocation(source.getSystemId(), source.getLastModified());
        builder.setOwnHash(source.getHash());
        builder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));

        Reader stream = source.getHashingReader();
        try {
            long length = IOUtil.countNumberOfCharacters(stream);
            if (length > MAX_SVG_LENGTH) {
                throw new SVGParserException("SVGDef length must be less than " + MAX_SVG_LENGTH, null);
            }
        } catch (IOException e) {
            throw new SVGParserException(e.getMessage(), null);
        }

        builder.setSource(source);
    }

    public SVGDef createDefinition() throws QuickFixException {
        return builder.build();
    }

}
