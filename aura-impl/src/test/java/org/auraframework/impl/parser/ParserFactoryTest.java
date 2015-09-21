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
package org.auraframework.impl.parser;

import org.auraframework.def.ControllerDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;
import org.auraframework.def.StyleDef;
import org.auraframework.impl.javascript.parser.JavascriptControllerParser;
import org.auraframework.system.Parser;
import org.auraframework.system.Parser.Format;
import org.auraframework.test.source.StringSourceLoader;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.util.test.util.UnitTestCase;

public class ParserFactoryTest extends UnitTestCase {

    public ParserFactoryTest(String name) {
        super(name);
    }

    private Parser<?> getParser(Format format, Class<? extends Definition> defClass) {
        return ParserFactory.getParser(format,
                StringSourceLoader.getInstance().createStringSourceDescriptor(null, defClass, null));
    }

    public void testGetParserNotFound() {
        DefDescriptor<?> desc = StringSourceLoader.getInstance().createStringSourceDescriptor(null,
                StyleDef.class, null);
        try {
            Parser<?> parser = ParserFactory.getParser(Format.JS, desc);
            fail(String.format("Not expecting to find a parser for %s, but got %s", desc, parser));
        } catch (Throwable t) {
            assertExceptionMessage(
                    t,
                    AuraRuntimeException.class,
                    String.format("Unable to find a parser for format JS, for descriptor %s of type STYLE",
                            desc.getQualifiedName()));
        }
    }

    public void testGetParserFound() {
        assertEquals(JavascriptControllerParser.class, getParser(Format.JS, ControllerDef.class).getClass());
    }
}
