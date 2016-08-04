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

import com.google.common.collect.Maps;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.DefDescriptor.DefType;
import org.auraframework.def.Definition;
import org.auraframework.system.Parser;
import org.auraframework.system.Parser.Format;
import org.auraframework.throwable.AuraRuntimeException;

import javax.inject.Inject;
import java.util.List;
import java.util.Map;

/**
 * Factory for returning the appropriate Parser for the given Format.
 */
public interface ParserFactory {

    /**
     * Get a parser based on format and DefType.
     * <p>
     * This parser should be a singleton/factory that is stateless. If state is required, the parse() function should
     * instantiate a stateful handler internally.
     *
     * @param format the format of the source to be parsed.
     * @param desc   the descriptor for which we need a parser.
     */
    <D extends Definition> Parser<D> getParser(Format format, DefDescriptor<D> desc);

    @ServiceComponent
    final class Impl implements ParserFactory {
        private final Map<ParserKey, Parser<?>> parserMap = Maps.newHashMap();

        @Inject
        private void initializeParsers(List<Parser<?>> parsers) {
            for (Parser<?> parser : parsers) {
                parserMap.put(new ParserKey(parser.getFormat(), parser.getDefType()), parser);
            }
        }

        @Override
        public <D extends Definition> Parser<D> getParser(Format format, DefDescriptor<D> desc) {
            @SuppressWarnings("unchecked")
            Parser<D> parser = (Parser<D>) parserMap.get(new ParserKey(format, desc.getDefType()));
            if (parser == null) {
                throw new AuraRuntimeException("Unable to find a parser for format " + format
                        + ", for descriptor " + desc + " of type " + desc.getDefType());
            }
            return parser;
        }

        private final class ParserKey {
            private Format format;
            private DefType defType;

            public ParserKey(Format format, DefType defType) {
                this.format = format;
                this.defType = defType;
            }

            @Override
            public int hashCode() {
                return format.hashCode() + defType.hashCode();
            }

            @Override
            public boolean equals(Object o) {
                if (o == null || !(o instanceof ParserKey)) {
                    return false;
                }
                ParserKey pk = (ParserKey) o;
                return pk.format == format && pk.defType == defType;
            }
        }
    }
}
