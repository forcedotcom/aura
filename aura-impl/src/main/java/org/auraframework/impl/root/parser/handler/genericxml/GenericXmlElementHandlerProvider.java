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

package org.auraframework.impl.root.parser.handler.genericxml;

import org.auraframework.def.genericxml.GenericXmlCapableDef;
import org.auraframework.def.genericxml.GenericXmlValidator;
import org.auraframework.def.genericxml.RootLevelGenericXmlValidator;
import org.auraframework.system.Source;
import org.auraframework.util.ServiceLocator;

import javax.xml.stream.XMLStreamReader;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Provider for a GenericXmlHandler given the parentTag and the current tag name.
 */
public class GenericXmlElementHandlerProvider {
    private final static GenericXmlElementHandlerProvider INSTANCE = new GenericXmlElementHandlerProvider();
    private final GenericXmlElementHandlerFactory generator;

    //Do not allow instantiation, this class is a singleton
    private GenericXmlElementHandlerProvider() {
        generator = new GenericXmlElementHandlerFactory();
    }

    //Used for unit testing - DO NOT INSTANTIATE ME, use the get() method.
    GenericXmlElementHandlerProvider(Set<RootLevelGenericXmlValidator> validators) {
        generator = new GenericXmlElementHandlerFactory(validators);
    }

    public static GenericXmlElementHandlerProvider get() {
        return INSTANCE;
    }

    /**
     * Given a parentTag and the element name, returns a handler to handle the eleemnt and any children
     *
     * @return a handler or null if unable to handle the tag.
     */
    public GenericXmlElementHandler getHandler(XMLStreamReader xmlReader,
                                                      Source<?> source, Class<? extends GenericXmlCapableDef> currentDefinition,
                                                      String tag, boolean isInternalNamespace) {
        return generator.getHandler(xmlReader, source, currentDefinition, tag, isInternalNamespace);
    }

    /**
     * Returns if there exists a handler to handle the tag
     *
     * @param currentDefinition the current Defintion before entering the next element.
     * @param tag              the next element being parsed
     * @return whether a handler exists to handle the tag.
     */
    public boolean handlesTag(Class<? extends GenericXmlCapableDef> currentDefinition, String tag, boolean isInternalNamespace) {
        return generator.handlesTag(currentDefinition, tag, isInternalNamespace);
    }

    /**
     * Factory class to load all validators and store them for quick lookups.
     */
    private static class GenericXmlElementHandlerFactory {
        private Map<GenerticXmlHandlerKey, GenericXmlValidator> validators;

        private GenericXmlElementHandlerFactory() {
            this(ServiceLocator.get().getAll(RootLevelGenericXmlValidator.class));

        }

        /**
         * Used for testing, allows injection of validators
         */
        private GenericXmlElementHandlerFactory(Set<RootLevelGenericXmlValidator> validators) {
            this.validators = validators.stream()
                    .collect(Collectors.toMap(val -> new GenerticXmlHandlerKey(val.getParentTag(), val.getTag()), validator -> validator));
        }

        private GenericXmlElementHandler getHandler(XMLStreamReader xmlReader,
                                                    Source<?> source, Class<? extends GenericXmlCapableDef> curentDefinition,
                                                    String tag, boolean isInternalNamespace) {
            GenericXmlValidator validator = getValidator(curentDefinition, tag, isInternalNamespace);
            return validator == null ? null : new GenericXmlElementHandler(xmlReader, source, isInternalNamespace, validator);
        }

        private boolean handlesTag(Class<? extends GenericXmlCapableDef> curentDefinition, String tag, boolean isInternalNamespace) {
            return getValidator(curentDefinition, tag, isInternalNamespace) != null;
        }

        private GenericXmlValidator getValidator(Class<? extends GenericXmlCapableDef> curentDefinition, String tag, boolean isInternalNamespace) {
            GenericXmlValidator validator = validators.get(new GenerticXmlHandlerKey(curentDefinition, tag));
            if (validator == null || (validator.requiresInternalNamespace() && !isInternalNamespace)) {
                return null;
            }
            return validator;
        }

        private class GenerticXmlHandlerKey {
            private final Class<? extends GenericXmlCapableDef> parent;
            private final String tag;

            public GenerticXmlHandlerKey(Class<? extends GenericXmlCapableDef> parent, String tag) {
                this.parent = parent;
                this.tag = tag;
            }

            @Override
            public boolean equals(Object o) {
                if (this == o) return true;
                if (o == null || getClass() != o.getClass()) return false;

                GenerticXmlHandlerKey that = (GenerticXmlHandlerKey) o;

                if (!parent.equals(that.parent)) return false;
                return tag.equals(that.tag);

            }

            @Override
            public int hashCode() {
                int result = parent.hashCode();
                result = 31 * result + tag.hashCode();
                return result;
            }
        }
    }
}
