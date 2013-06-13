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
package org.auraframework.impl.css.parser;

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.Map;
import java.util.Set;

import org.auraframework.css.parser.ThemeOverrideMap;
import org.auraframework.css.parser.ThemeValueProvider;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.expression.Expression;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.AuraImpl;
import org.auraframework.impl.root.theme.ThemeDefImpl;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.AuraValidationException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.ThemeValueNotFoundException;

import com.google.common.base.CharMatcher;
import com.google.common.base.Optional;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Sets;

/**
 * Responsible for taking a String reference to a theme variable and finding the applicable value.
 * 
 * @see ThemeValueProvider
 */
public class ThemeValueProviderImpl implements ThemeValueProvider {
    private static final String MISSING_CLOSING = "Missing closing quote in theme function argument %s";
    private static final String MALFORMED = "Expected exactly 2 or 3 parts in theme function argument '%s'";
    private static final String BAD_ALIAS = "No alias named '%s' found";

    private final Optional<ThemeOverrideMap> overrides;
    private final Map<String, String> aliases;

    /**
     * Creates a {@link ThemeValueProvider} with no overrides or alias support.
     */
    public ThemeValueProviderImpl() {
        this(null, null);
    }

    /**
     * Creates a {@link ThemeValueProvider} with the given overrides and supported aliases.
     * 
     * @param overrides Enabled theme overrides.
     * @param aliases Theme aliases. Should map from single word to a descriptor name (including the colon).
     */
    public ThemeValueProviderImpl(ThemeOverrideMap overrides, Map<String, String> aliases) {
        this.overrides = Optional.fromNullable(overrides);
        this.aliases = (aliases == null) ? ImmutableMap.<String, String> of() : ImmutableMap.copyOf(aliases);
    }

    @Override
    public Object getValue(PropertyReference reference) throws QuickFixException {
        checkNotNull(reference, "reference cannot be null");

        DefDescriptor<ThemeDef> descriptor = checkOverridden(getDescriptor(reference));
        Optional<Object> value = descriptor.getDef().variable(reference.getLeaf());

        // throw a quick fix exception if value doesn't exist
        if (!value.isPresent()) {
            throw new ThemeValueNotFoundException(reference.getLeaf(), descriptor, reference.getLocation());
        }

        // check for cross references (expressions)
        if (value.get() instanceof PropertyReference) {
            return getValue((PropertyReference) value.get());
        }

        return value.get();
    }

    @Override
    public Object getValue(String reference, Location location) throws QuickFixException {
        return getExpression(reference, location).evaluate(this);
    }

    @Override
    public DefDescriptor<ThemeDef> getDescriptor(PropertyReference reference) {
        checkNotNull(reference, "reference cannot be null");

        if (reference.size() == 2) {
            // aliased reference
            String actual = aliases.get(reference.getRoot());
            if (actual == null) {
                throw new AuraRuntimeException(String.format(BAD_ALIAS, reference.getRoot()));
            }
            return ThemeDefImpl.descriptor(actual);
        } else if (reference.size() == 3) {
            // fully qualified
            PropertyReference sub = reference.getSub(0, 2);
            return ThemeDefImpl.descriptor(String.format("%s:%s", sub.getRoot(), sub.getLeaf()));
        }

        throw new AuraRuntimeException(String.format(MALFORMED, reference));
    }

    @Override
    public Set<DefDescriptor<ThemeDef>> getDescriptors(String reference, Location location) throws QuickFixException {
        checkNotNull(reference, "reference cannot be null");
        reference = formatReference(reference, location);

        Set<DefDescriptor<ThemeDef>> descriptors = Sets.newHashSet();
        Set<PropertyReference> propRefs = Sets.newHashSet();

        // get all references to theme defs (there could be multiple)
        getExpression(reference, location).gatherPropertyReferences(propRefs);

        // resolve each reference to the theme def descriptor
        for (PropertyReference propRef : propRefs) {
            descriptors.add(getDescriptor(propRef));
        }

        return descriptors;
    }

    /**
     * Checks if the given descriptor is overridden, and if so returns the override instead.
     * 
     * @param descriptor Check for an override of this descriptor.
     * 
     * @return The overridden descriptor if present, otherwise the same descriptor that is passed in.
     */
    private DefDescriptor<ThemeDef> checkOverridden(DefDescriptor<ThemeDef> descriptor) {
        if (!overrides.isPresent()) {
            return descriptor;
        }

        return overrides.get().getOverride(descriptor).or(descriptor);
    }

    /**
     * Gets an expression representing the given reference. If simply trying to evaluate a string reference, prefer
     * {@link #getValue(String, Location)} instead.
     * 
     * @param reference The string input source.
     * @param location The location of the reference in the source code.
     * 
     * @return A new expression representing the given reference
     * 
     * @throws AuraValidationException
     */
    private static Expression getExpression(String reference, Location location) throws AuraValidationException {
        checkNotNull(reference, "reference cannot be null");
        reference = formatReference(reference, location);
        return AuraImpl.getExpressionAdapter().buildExpression(reference, location);
    }

    /**
     * Format a raw reference before passing to the expression engine. Basically the means we strip the first leading
     * and trailing double quotes or single quotes. This is only if the reference begins and ends with matching quotes.
     * In CSS the quotes are necessary for the CSS Parser, however we don't want to pass the quotes to the expression
     * engine, or it will end up seeing the whole thing as a literal.
     * 
     * <p>
     * If the first character is <i>not</i> a quote then we return the original reference unchanged. This might be true
     * if evaluating a reference that isn't coming from a CSS file source.
     * 
     * @param reference The raw reference string, e.g., including quotes, "namespace.theme.variable"
     * 
     * @return The formatted reference.
     * 
     * @throws AuraRuntimeException if the reference is not enclosed with matching quotes.
     */
    private static String formatReference(String reference, Location location) {
        CharMatcher singleQ = CharMatcher.is('"');
        CharMatcher doubleQ = CharMatcher.is('\'');
        CharMatcher mode;

        // figure out if using double or single quotes
        if (singleQ.matches(reference.charAt(0))) {
            mode = singleQ;
        } else if (doubleQ.matches(reference.charAt(0))) {
            mode = doubleQ;
        } else {
            // unquoted
            return reference;
        }

        // ensure the last character is a matching quote
        if (!mode.matches(reference.charAt(reference.length() - 1))) {
            throw new AuraRuntimeException(String.format(MISSING_CLOSING, reference), location);
        }

        // remove first and last chars, which should be quotes
        return reference.substring(1, reference.length() - 1);
    }
}
