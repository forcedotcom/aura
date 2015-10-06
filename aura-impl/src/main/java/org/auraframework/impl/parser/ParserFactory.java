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

import java.util.Map;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.impl.css.parser.FlavoredStyleParser;
import org.auraframework.impl.css.parser.ResourceCSSParser;
import org.auraframework.impl.css.parser.StyleParser;
import org.auraframework.impl.javascript.parser.JavascriptControllerParser;
import org.auraframework.impl.javascript.parser.JavascriptHelperParser;
import org.auraframework.impl.javascript.parser.JavascriptIncludeParser;
import org.auraframework.impl.javascript.parser.JavascriptModelParser;
import org.auraframework.impl.javascript.parser.JavascriptProviderParser;
import org.auraframework.impl.javascript.parser.JavascriptRendererParser;
import org.auraframework.impl.javascript.parser.JavascriptResourceParser;
import org.auraframework.impl.javascript.parser.JavascriptTestSuiteParser;
import org.auraframework.impl.root.parser.ApplicationXMLParser;
import org.auraframework.impl.root.parser.ComponentXMLParser;
import org.auraframework.impl.root.parser.DesignXMLParser;
import org.auraframework.impl.root.parser.DocumentationXMLParser;
import org.auraframework.impl.root.parser.EventXMLParser;
import org.auraframework.impl.root.parser.FlavorsXMLParser;
import org.auraframework.impl.root.parser.InterfaceXMLParser;
import org.auraframework.impl.root.parser.LibraryXMLParser;
import org.auraframework.impl.root.parser.NamespaceXMLParser;
import org.auraframework.impl.root.parser.TokensXMLParser;
import org.auraframework.impl.svg.parser.SVGParser;
import org.auraframework.system.Parser;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.AuraRuntimeException;

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

    static {
        parsers.put(new ParserKey(Format.SVG, DefType.SVG), SVGParser.getInstance());
        parsers.put(new ParserKey(Format.XML, DefType.APPLICATION), new ApplicationXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.COMPONENT), new ComponentXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.DESIGN), new DesignXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.DOCUMENTATION), new DocumentationXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.EVENT), new EventXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.FLAVORS), new FlavorsXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.INTERFACE), new InterfaceXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.LIBRARY), new LibraryXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.NAMESPACE), new NamespaceXMLParser());
        parsers.put(new ParserKey(Format.XML, DefType.TOKENS), new TokensXMLParser());

        parsers.put(new ParserKey(Format.CSS, DefType.RESOURCE), new ResourceCSSParser());
        parsers.put(new ParserKey(Format.CSS, DefType.STYLE), new StyleParser(true));
        parsers.put(new ParserKey(Format.TEMPLATE_CSS, DefType.STYLE), new StyleParser(false));
        parsers.put(new ParserKey(Format.CSS, DefType.FLAVORED_STYLE), new FlavoredStyleParser());

        parsers.put(new ParserKey(Format.JS, DefType.CONTROLLER), new JavascriptControllerParser());
        parsers.put(new ParserKey(Format.JS, DefType.HELPER), new JavascriptHelperParser());
        parsers.put(new ParserKey(Format.JS, DefType.INCLUDE), new JavascriptIncludeParser());
        parsers.put(new ParserKey(Format.JS, DefType.MODEL), new JavascriptModelParser());
        parsers.put(new ParserKey(Format.JS, DefType.PROVIDER), new JavascriptProviderParser());
        parsers.put(new ParserKey(Format.JS, DefType.RENDERER), new JavascriptRendererParser());
        parsers.put(new ParserKey(Format.JS, DefType.RESOURCE), new JavascriptResourceParser());
        parsers.put(new ParserKey(Format.JS, DefType.TESTSUITE), new JavascriptTestSuiteParser());
    }

    /**
     * Get a parser based on format and def type.
     *
     * This parser should be a singleton/factory that is stateless. If state is required,
     * the parse() function should instantiate a stateful handler internally.
     *
     * @param format the format of the source to be parsed.
     * @param desc the descriptor for which we need a parser.
     */
    public static <D extends Definition> Parser<D> getParser(Format format, DefDescriptor<D> desc) {
        @SuppressWarnings("unchecked")
        Parser<D> parser = (Parser<D>)parsers.get(new ParserKey(format, desc.getDefType()));
        if (parser == null) {
            throw new AuraRuntimeException("Unable to find a parser for format " + format
                    + ", for descriptor " + desc + " of type " + desc.getDefType());
        }
        return parser;
    }
}
