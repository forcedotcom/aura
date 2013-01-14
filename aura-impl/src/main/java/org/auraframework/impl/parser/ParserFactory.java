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
package org.auraframework.impl.parser;

import java.util.EnumMap;

import org.auraframework.impl.css.parser.ThemeParser;
import org.auraframework.impl.java.writer.JavaScriptWriter;
import org.auraframework.impl.java.writer.JavaWriter;
import org.auraframework.impl.java.writer.ThemeWriter;
import org.auraframework.impl.javascript.parser.JavascriptParser;
import org.auraframework.impl.root.parser.XMLParser;
import org.auraframework.impl.root.parser.XMLWriter;
import org.auraframework.system.Parser;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.SourceWriter;

/**
 * Factory for returning the appropriate Parser for the given Format.
 */
public class ParserFactory {

    private static EnumMap<Format, Parser> parsers = new EnumMap<Format, Parser>(Format.class);
    private static EnumMap<Format, SourceWriter> writers = new EnumMap<Format, SourceWriter>(Format.class);

    static {
        parsers.put(Format.XML, XMLParser.getInstance());
        parsers.put(Format.CSS, ThemeParser.getInstance());
        parsers.put(Format.TEMPLATE_CSS, ThemeParser.getNonValidatingInstance());
        parsers.put(Format.JS, JavascriptParser.getInstance());

        writers.put(Format.XML, XMLWriter.getInstance());
        writers.put(Format.JAVA, JavaWriter.getInstance());
        writers.put(Format.JS, JavaScriptWriter.getInstance());
        writers.put(Format.CSS, ThemeWriter.getInstance());
        writers.put(Format.TEMPLATE_CSS, ThemeWriter.getInstance());
    }

    public static Parser getParser(Format format) {
        return parsers.get(format);
    }

    public static SourceWriter getWriter(Format format) {
        return writers.get(format);
    }
}
