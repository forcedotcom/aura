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

package org.auraframework.impl.root;

import com.google.common.base.Suppliers;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Maps;
import com.google.common.collect.Multimap;
import com.google.common.collect.Multimaps;
import com.google.common.collect.Sets;
import org.auraframework.def.genericxml.GenericXmlElement;
import org.auraframework.def.genericxml.GenericXmlValidator;
import org.auraframework.impl.system.BaseXmlElementImpl;
import org.auraframework.throwable.quickfix.QuickFixException;

import javax.annotation.Nonnull;
import javax.annotation.Nullable;
import javax.management.modelmbean.XMLParseException;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;

/**
 * Generic tag implementation. Responsible for basic xml validation.
 * Most validation should be done on a per implementation basis
 */
public class GenericXmlElementImpl extends BaseXmlElementImpl implements GenericXmlElement {
    private final Multimap<Class<? extends GenericXmlValidator>, GenericXmlElement> children;
    private final Map<String, String> attributes;
    private final String text;
    private final Class<? extends GenericXmlValidator> validatorClass;

    private GenericXmlElementImpl(Builder builder) {
        super(builder);
        this.children = builder.children;
        this.attributes = builder.attributes;
        this.text = builder.text;
        this.validatorClass = builder.validatorClass;
    }

    @Override
    @Nonnull
    public Set<GenericXmlElement> getChildren() {
        return ImmutableSet.copyOf(children.values());
    }

    @Nonnull
    @Override
    public Set<GenericXmlElement> getChildren(Class implementingDef) {
        Collection<GenericXmlElement> child = children.get(implementingDef);
        if (child == null) {
            return Collections.emptySet();
        }
        return ImmutableSet.copyOf(child);
    }

    @Override
    @Nonnull
    public Map<String, String> getAttributes() {
        return attributes;
    }

    @Override
    @Nullable
    public String getText() {
        return text;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        GenericXmlElementImpl that = (GenericXmlElementImpl) o;

        if (!getName().equalsIgnoreCase(that.getName())) return false;
        if (!attributes.equals(that.attributes)) return false;
        return text != null ? text.equalsIgnoreCase(that.text) : that.text == null;

    }

    @Override
    public int hashCode() {
        int result = attributes.hashCode();
        result = 31 * result + (text != null ? text.hashCode() : 0) + getName().toLowerCase().hashCode();
        return result;
    }

    public Class<? extends GenericXmlValidator> getValidatorClass() {
        return validatorClass;
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();

        for (GenericXmlElement child : children.values()) {
            child.validateDefinition();
        }
    }

    public static class Builder extends BaseBuilderImpl {

        private final Class<? extends GenericXmlValidator> validatorClass;
        private Multimap<Class<? extends GenericXmlValidator>, GenericXmlElement> children =
                Multimaps.newSetMultimap(Maps.newHashMap(), Suppliers.ofInstance(Sets.newHashSet()));
        private Map<String, String> attributes = new TreeMap<>(String::compareToIgnoreCase);
        private String text = null;

        public Builder(Class<? extends GenericXmlValidator> validatorClass, String tagName) {
            super(GenericXmlElement.class);
            this.validatorClass = validatorClass;
            setTagName(tagName);
        }

        public GenericXmlElement build() throws QuickFixException {
            return new GenericXmlElementImpl(this);
        }

        public void appendChild(Class<? extends GenericXmlValidator> validatorClass, GenericXmlElement child) {
            if (text != null) {
                setParseError(new XMLParseException("Elements can not contain child tags and text."));
                return;
            }
            children.put(validatorClass, child);
        }

        public void appendAttribute(String attribute, String value) {
            if (attributes.containsKey(attribute)) {
                setParseError(new XMLParseException(String.format("Element contains duplicate attribute \"%s\"", attribute)));
                return;
            }
            attributes.put(attribute, value);
        }

        public void addText(String text) {
            if (!children.isEmpty()) {
                setParseError(new XMLParseException("Elements can not contain child tags and text."));
                return;
            }
            this.text = text;
        }
    }
}
