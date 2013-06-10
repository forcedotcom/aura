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

import org.auraframework.css.parser.ThemeOverrideMap;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.impl.root.theme.ThemeDefImpl;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.ThemeVariableNotFoundException;

import com.google.common.base.CharMatcher;
import com.google.common.base.Optional;

/**
 * Responsible for taking a String reference to a theme variable and finding the applicable value.
 * 
 * <p>
 * Fully qualified references (For example, "namespace.themeName.variableName") will resolved as specified to the
 * referenced theme variable value. It's possible for the returned value to be different from the one referenced if
 * theme overrides are provided (see {@link ThemeOverrideMap}.
 * 
 * <p>
 * Simple references (For example, "color") will resolve to the localTheme that is provided to this resolver. If no
 * local theme is provided then simple references will not be resolved.
 * 
 * <p>
 * This can also handle taking a reference and resolving to the actual {@link DefDescriptor} instead. See
 * {@link #resolveToDescriptor(String)}.
 */
public final class ThemeValueResolver {
    private final Optional<ThemeDef> localTheme;
    private final Optional<ThemeOverrideMap> overrides;

    /**
     * Creates a resolver that can only locate fully qualified variable references.
     */
    public ThemeValueResolver() {
        this(null, null);
    }

    /**
     * Creates a resolver that will account for the given {@link ThemeDef} overrides.
     */
    public ThemeValueResolver(ThemeOverrideMap overrides) {
        this(overrides, null);
    }

    /**
     * Creates a resolver that can locate fully qualified variable references and simple references from the provided
     * localTheme.
     * 
     * @param localTheme Resolve simple references from this theme.
     */
    public ThemeValueResolver(ThemeDef localTheme) {
        this(null, localTheme);
    }

    /**
     * Creates a resolver that will honor the given {@link ThemeDef} overrides as well as lookup simple references from
     * the provided localTheme.
     */
    public ThemeValueResolver(ThemeOverrideMap overrides, ThemeDef localTheme) {
        this.overrides = Optional.fromNullable(overrides);
        this.localTheme = Optional.fromNullable(localTheme);
    }

    /**
     * Finds the value for the given reference.
     * 
     * @param reference A fully qualified or simple reference.
     * @return The resolved value, or {@link Optional#absent()} if not found.
     * @throws QuickFixException If the referenced theme or theme variable does not exist.
     */
    public String resolve(String reference) throws QuickFixException {
        checkNotNull(reference, "reference should not be null.");

        // trim quotes and stuff
        reference = clean(reference);

        // attempt to resolve the value.
        Optional<String> value = fullyQualified(reference).or(local(reference));

        // throw a quick fix exception if we haven't found the value.
        if (!value.isPresent()) {
            throw new ThemeVariableNotFoundException(name(reference), resolveToDescriptor(reference).orNull());
        }

        // return the actual value of the variable
        return value.get();
    }

    /**
     * Find the referenced {@link DefDescriptor} in the given string. This will only work for fully qualified
     * references, otherwise this will return {@link Optional#absent()}.
     * 
     * @param reference Get the {@link DefDescriptor} matching the fully qualified theme in this reference.
     * @return The {@link DefDescriptor}, otherwise {@link Optional#absent()}.
     */
    public Optional<DefDescriptor<ThemeDef>> resolveToDescriptor(String reference) {
        reference = clean(reference);

        Optional<String> descriptorString = descriptorString(reference);
        if (descriptorString.isPresent()) {
            return Optional.fromNullable(ThemeDefImpl.descriptor(descriptorString.get()));
        }
        return Optional.absent();
    }

    /**
     * Determines whether the given reference is fully qualified.
     * 
     * @param name The reference to check.
     * @return True if the reference is fully qualified.
     */
    private boolean isQualifiedReference(String name) {
        return getParts(name).length == 3;
    }

    /**
     * Resolves a fully qualified reference. If the reference is not fully qualified this will return
     * {@link Optional#absent()}.
     * 
     * @return The resolved value, or {@link Optional#absent()} if the reference cannot be found.
     * @throws QuickFixException If the referenced theme or theme variable does not exist.
     */
    private Optional<String> fullyQualified(String reference) throws QuickFixException {
        if (!isQualifiedReference(reference)) {
            return Optional.absent();
        }

        Optional<DefDescriptor<ThemeDef>> descriptor = resolveToDescriptor(reference);
        if (!descriptor.isPresent()) {
            return Optional.absent();
        }

        DefDescriptor<ThemeDef> actual = checkOverriden(descriptor.get());
        return actual.getDef().variable(name(reference));
    }

    /**
     * Resolve a simple reference.
     * 
     * @return The resolved value, or {@link Optional#absent()} if the reference cannot be found.
     */
    private Optional<String> local(String reference) throws QuickFixException {
        if (!localTheme.isPresent()) {
            return Optional.absent();
        }

        return localTheme.get().variable(name(reference));
    }

    /**
     * Gets the theme descriptor string within a reference, if present.
     * 
     * @return the theme descriptor string, or {@link Optional#absent()} if the reference is not fully qualified.
     */
    private Optional<String> descriptorString(String reference) {
        if (!isQualifiedReference(reference)) {
            return Optional.absent();
        }

        String[] parts = getParts(reference);
        return Optional.of(String.format("%s:%s", parts[0], parts[1]));
    }

    /**
     * Gets the variable name within a reference.
     */
    private String name(String reference) {
        String[] parts = getParts(reference);
        if (isQualifiedReference(reference) && parts.length == 3) {
            return parts[2];
        }

        return reference;
    }

    /**
     * Get the individual parts of a reference.
     * 
     * @return [0] = namespace, [1] = themeName, [2] = variableName
     */
    private String[] getParts(String reference) {
        return reference.split("\\.");
    }

    /**
     * Checks if the given descriptor is overridden, and if so returns the override instead.
     * 
     * @param descriptor Check for an override of this descriptor.
     * @return The overridden descriptor if present, otherwise the same descriptor that is passed in.
     */
    private DefDescriptor<ThemeDef> checkOverriden(DefDescriptor<ThemeDef> descriptor) {
        if (!overrides.isPresent()) {
            return descriptor;
        }

        return overrides.get().getOverride(descriptor).or(descriptor);
    }

    /**
     * Cleans a reference by stripping leading and trailing quotes.
     * 
     * @param reference The reference to clean.
     * @return The cleaned reference.
     */
    private String clean(String reference) {
        return CharMatcher.anyOf("'\" ").trimFrom(reference); // single, double or space characters
    }

}