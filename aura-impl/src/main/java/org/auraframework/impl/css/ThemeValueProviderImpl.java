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
package org.auraframework.impl.css;

import static com.google.common.base.Preconditions.checkNotNull;

import org.auraframework.css.ThemeList;
import org.auraframework.css.ThemeValueProvider;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.StyleDef;
import org.auraframework.def.ThemeDef;
import org.auraframework.expression.Expression;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.AuraImpl;
import org.auraframework.impl.root.theme.Themes;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.AuraValidationException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.ThemeValueNotFoundException;

import com.google.common.base.Optional;

/**
 * Responsible for taking a String reference to a theme variable and finding the applicable value.
 * 
 * @see ThemeValueProvider
 */
public final class ThemeValueProviderImpl implements ThemeValueProvider {
    private static final String MALFORMED = "Invalid number of parts in theme reference, for theme function argument '%s'";

    private final DefDescriptor<ThemeDef> cmpTheme;
    private final DefDescriptor<ThemeDef> namespaceTheme;
    private final ThemeList overrideThemes;

    /**
     * Creates a new {@link ThemeValueProvider}.
     * 
     * @param scope Provide vars for this {@link StyleDef}.
     * @param overrideThemes The list of themes that override the default var values.
     */
    public ThemeValueProviderImpl(DefDescriptor<StyleDef> scope, ThemeList overrideThemes) throws QuickFixException {
        checkNotNull(scope, "scope cannot be null");

        DefDescriptor<ThemeDef> cmpTheme = Themes.getCmpTheme(scope);
        this.cmpTheme = cmpTheme.exists() ? cmpTheme : null;
        this.namespaceTheme = Themes.getNamespaceDefaultTheme(scope);
        this.overrideThemes = overrideThemes;
    }

    @Override
    public Object getValue(String reference, Location location) throws QuickFixException {
        return getExpression(reference, location).evaluate(this);
    }

    @Override
    public Object getValue(PropertyReference reference) throws QuickFixException {
        checkNotNull(reference, "reference cannot be null");

        Optional<Object> value;
        if (reference.size() == 1) {
            value = getGlobalVar(reference);
        } else {
            throw new AuraRuntimeException(String.format(MALFORMED, reference));
        }

        // check for cross references (expressions)
        if (value.get() instanceof PropertyReference) {
            return getValue((PropertyReference) value.get());
        }

        return value.get();
    }

    /**
     * Gets a var from the global space, first checking override themes, otherwise the component bundle theme, otherwise
     * the namespace-default theme.
     */
    private Optional<Object> getGlobalVar(PropertyReference reference) throws QuickFixException {
        Optional<Object> value = Optional.absent();

        // check from an override
        if (overrideThemes != null) {
            value = overrideThemes.getValue(reference.getRoot());
            if (value.isPresent()) {
                return value;
            }
        }

        // check from component bundle
        if (cmpTheme != null) {
            value = cmpTheme.getDef().getVar(reference.getRoot());
            if (value.isPresent()) {
                return value;
            }
        }

        // check namespace-default theme
        value = namespaceTheme.getDef().getVar(reference.getRoot());
        if (!value.isPresent()) {
            throw new ThemeValueNotFoundException(reference.getRoot(), namespaceTheme, reference.getLocation());
        }

        return value;
    }

    /**
     * Gets an expression representing the given reference. If simply trying to evaluate a string reference, prefer
     * {@link #getValue(String, Location)} instead.
     * 
     * @param reference The string input source (should not be quoted).
     * @param location The location of the reference in the source code.
     * 
     * @return A new expression representing the given reference.
     * 
     * @throws AuraValidationException
     */
    private static Expression getExpression(String reference, Location location) throws AuraValidationException {
        return AuraImpl.getExpressionAdapter().buildExpression(reference, location);
    }
}
