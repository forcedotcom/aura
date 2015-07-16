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
package org.auraframework.impl.css.token;

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.HashSet;
import java.util.Set;

import org.auraframework.css.ResolveStrategy;
import org.auraframework.css.TokenOptimizer;
import org.auraframework.css.TokenValueProvider;
import org.auraframework.def.BaseStyleDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokensDef;
import org.auraframework.expression.Expression;
import org.auraframework.expression.PropertyReference;
import org.auraframework.impl.AuraImpl;
import org.auraframework.impl.css.util.Tokens;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.AuraValidationException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.throwable.quickfix.TokenValueNotFoundException;

import com.google.common.base.Optional;

/**
 * Responsible for taking a String reference to a token name and finding the applicable value.
 *
 * @see TokenValueProvider
 */
public final class TokenValueProviderImpl implements TokenValueProvider {
    private static final String MALFORMED = "Invalid number of parts in token reference, for token function argument '%s'";

    private final DefDescriptor<TokensDef> namespaceDefault;
    private final TokenOptimizer overrides;
    private final ResolveStrategy strategy;

    /**
     * Creates a new {@link TokenValueProvider}.
     *
     * @param style Provide tokens for this {@link BaseStyleDef}.
     * @param overrides The tokens that override the default token values. Null is ok.
     * @param strategy The indication of how token resolution is being handled (if in doubt about this, use
     *            {@link ResolveStrategy#RESOLVE_NORMAL}).
     */
    public TokenValueProviderImpl(DefDescriptor<? extends BaseStyleDef> style, TokenOptimizer overrides, ResolveStrategy strategy) {
        checkNotNull(style, "style cannot be null");
        this.namespaceDefault = Tokens.namespaceDefaultDescriptor(style);
        this.overrides = overrides;
        this.strategy = strategy;
    }

    @Override
    public ResolveStrategy getResolveStrategy() {
        return strategy;
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
            value = getGlobalToken(reference);
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
     * Gets a token from the global space, first checking overrides, otherwise the namespace-default tokens.
     */
    private Optional<Object> getGlobalToken(PropertyReference reference) throws QuickFixException {
        Optional<Object> value = Optional.absent();

        // check from an override
        if (overrides != null) {
            value = overrides.getValue(reference.getRoot());
            if (value.isPresent()) {
                return value;
            }
        }

        // check namespace-default
        value = namespaceDefault.getDef().getToken(reference.getRoot());
        if (!value.isPresent()) {
            throw new TokenValueNotFoundException(reference.getRoot(), namespaceDefault, reference.getLocation());
        }

        return value;
    }

    @Override
    public Set<String> extractTokenNames(String expression, boolean followCrossReferences) throws QuickFixException {
        checkNotNull(expression, "expression cannot be null");

        Set<PropertyReference> propRefs = new HashSet<>();
        getExpression(expression, null).gatherPropertyReferences(propRefs);

        Set<String> names = new HashSet<>();
        for (PropertyReference ref : propRefs) {
            // add the name itself
            names.add(ref.getRoot());

            // add cross references (aliases)
            if (followCrossReferences) {
                Optional<Object> value = getGlobalToken(ref);
                while (value.isPresent() && value.get() instanceof PropertyReference) {
                    PropertyReference aliased = (PropertyReference) value.get();
                    names.add(aliased.getRoot());
                    value = getGlobalToken(aliased);
                }
            }
        }

        return names;
    }

    /**
     * Gets an expression representing the given reference. If simply trying to evaluate a string reference, prefer
     * {@link #getValue(String, Location)} instead.
     *
     * @param expression The string input source (should not be quoted).
     * @param location The location of the reference in the source code.
     *
     * @return A new expression representing the given reference.
     *
     * @throws AuraValidationException
     */
    private static Expression getExpression(String expression, Location location) throws AuraValidationException {
        return AuraImpl.getExpressionAdapter().buildExpression(expression, location);
    }
}
