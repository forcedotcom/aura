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
package org.auraframework.impl.svg.parser;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.def.SVGDef;
import org.auraframework.impl.root.parser.handler.SVGDefHandler;
import org.auraframework.system.Parser;
import org.auraframework.system.Source;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.SVGParserException;

public class SVGParser implements Parser {
    private static final SVGParser instance = new SVGParser();

    public static SVGParser getInstance() {
        return instance;
    }

    @SuppressWarnings("unchecked")
    @Override
    public <D extends Definition> D parse(DefDescriptor<D> descriptor, Source<?> source) throws SVGParserException,
            QuickFixException {
        if (descriptor.getDefType() == DefType.SVG) {
            return (D) new SVGDefHandler<SVGDef>((DefDescriptor<SVGDef>) descriptor,
                    (Source<SVGDef>) source).createDefinition();
        }
        return null;
    }
}
