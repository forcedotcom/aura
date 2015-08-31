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

import java.util.EnumMap;
import java.util.Map;

import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.impl.css.parser.FlavoredStyleParser;
import org.auraframework.impl.css.parser.ResourceCSSParser;
import org.auraframework.impl.css.parser.StyleParser;
import org.auraframework.impl.java.writer.JavaScriptWriter;
import org.auraframework.impl.java.writer.JavaWriter;
import org.auraframework.impl.java.writer.SVGWriter;
import org.auraframework.impl.java.writer.StyleWriter;
import org.auraframework.impl.javascript.parser.JavascriptParser;
import org.auraframework.impl.root.parser.ApplicationXMLParser;
import org.auraframework.impl.root.parser.ComponentXMLParser;
import org.auraframework.impl.root.parser.DesignXMLParser;
import org.auraframework.impl.root.parser.DocumentationXMLParser;
import org.auraframework.impl.root.parser.EventXMLParser;
import org.auraframework.impl.root.parser.FlavorAssortmentXMLParser;
import org.auraframework.impl.root.parser.InterfaceXMLParser;
import org.auraframework.impl.root.parser.LayoutsXMLParser;
import org.auraframework.impl.root.parser.LibraryXMLParser;
import org.auraframework.impl.root.parser.NamespaceXMLParser;
import org.auraframework.impl.root.parser.TokensXMLParser;
import org.auraframework.impl.root.parser.XMLWriter;
import org.auraframework.impl.svg.parser.SVGParser;
import org.auraframework.system.Parser;
import org.auraframework.system.Parser.Format;
import org.auraframework.system.SourceWriter;

import com.google.common.collect.Maps;

/**
 * Factory for returning the appropriate Parser for the given Format.
 */
public class ParserFactory {

    private static final class ParserKey {
        private Format format;
        private DefType defType;

        public ParserKey(Format format, DefType defType) {
            this.format = format;
            this.defType = defType;
        }

        @Override
        public int hashCode() {
            return format.hashCode()+defType.hashCode();
        }

        @Override
        public boolean equals(Object o) {
            if (o == null || !(o instanceof ParserKey)) {
                return false;
            }
            ParserKey pk = (ParserKey)o;
            return pk.format == format && pk.defType == defType;
        }
    };

    private static Map<ParserKey, Parser<?>> parsers = Maps.newHashMap();
    private static EnumMap<Format, Parser<?>> badParsers = new EnumMap<>(Format.class);
    private static EnumMap<Format, SourceWriter> writers = new EnumMap<>(Format.class);

    static {
        badParsers.put(Format.JS, JavascriptParser.getInstance());

        parsers.put(new ParserKey(Format.SVG, DefType.SVG), SVGParser.getInstance());
        parsers.put(new ParserKey(Format.XML, DefType.APPLICATION), new ApplicationXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.COMPONENT), new ComponentXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.DESIGN), new DesignXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.DOCUMENTATION), new DocumentationXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.EVENT), new EventXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.FLAVOR_ASSORTMENT), new FlavorAssortmentXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.INTERFACE), new InterfaceXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.LAYOUTS), new LayoutsXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.LIBRARY), new LibraryXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.NAMESPACE), new NamespaceXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.TOKENS), new TokensXMLParser());

        parsers.put(new ParserKey(Format.CSS, DefType.RESOURCE), new ResourceCSSParser());
        parsers.put(new ParserKey(Format.CSS, DefType.STYLE), new StyleParser(true));
        parsers.put(new ParserKey(Format.TEMPLATE_CSS, DefType.STYLE), new StyleParser(false));
        parsers.put(new ParserKey(Format.CSS, DefType.FLAVORED_STYLE), new FlavoredStyleParser());


        writers.put(Format.XML, XMLWriter.getInstance());
        writers.put(Format.JAVA, JavaWriter.getInstance());
        writers.put(Format.JS, JavaScriptWriter.getInstance());
        writers.put(Format.CSS, StyleWriter.getInstance());
        writers.put(Format.TEMPLATE_CSS, StyleWriter.getInstance());
        writers.put(Format.SVG, SVGWriter.getInstance());
    }

    /**
     * Get a parser based on format and def type.
     *
     * This parser should be a singleton/factory that is stateless. If state is required, the parse() function
     * should instantiate a stateful handler internally.
     *
     * @param format the format of the source to be parsed.
     * @param defType the definition type that we are meant to return.
     */
    public static Parser<?> getParser(Format format, DefType defType) {
        Parser<?> parser = parsers.get(new ParserKey(format, defType));
        if (parser == null) {
            // This will be put in place when we have finished the migration.
            // throw new RuntimeException("unable to find a parser for format "+format+", of type "+defType);
            // for now, just assume that we want the format one.
            return badParsers.get(format);
        }
        return parser;
    }

    public static SourceWriter getWriter(Format format) {
        return writers.get(format);
    }
}
