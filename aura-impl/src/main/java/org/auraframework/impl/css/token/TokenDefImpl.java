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

import java.io.IOException;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.RootDefinition;
import org.auraframework.def.TokenDef;
import org.auraframework.expression.Expression;
import org.auraframework.expression.ExpressionType;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

import com.google.common.base.Objects;
import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableSet;
import com.google.common.collect.Sets;
import com.salesforce.omakase.data.Property;

public final class TokenDefImpl extends DefinitionImpl<TokenDef> implements TokenDef {
    private static final String INVALID_NAME = "Invalid token name: '%s'";
    private static final String MISSING_VALUE = "Missing required attribute 'value'";
    private static final String UNKNOWN_PROPERTY = "Unknown CSS property '%s'";
    private static final String ILLEGAL_EXPR = "Illegal expression in token value";
    private static final String ILLEGAL_CHARS = "Illegal character in token value (must "
            + "only include alphanumeric, hyphen or underscore characters)";

    private static final Pattern RESTRICTED_CHARS = Pattern.compile("[a-zA-Z0-9_-]*");

    private static final Set<String> EXTRA_PROPERTIES = ImmutableSet.of("box-flex");
    private static final long serialVersionUID = 344237166606014917L;

    private final Object value;
    private final Set<String> allowedProperties;
    private final DefDescriptor<? extends RootDefinition> parentDescriptor;

    private final int hashCode;

    public TokenDefImpl(Builder builder) {
        super(builder);
        this.value = builder.value;
        this.allowedProperties = AuraUtil.immutableSet(builder.allowedProperties);
        this.parentDescriptor = builder.parentDescriptor;

        this.hashCode = AuraUtil.hashCode(descriptor, location, value);
    }

    @Override
    public Object getValue() {
        return value;
    }

    @Override
    public Set<String> getAllowedProperties() {
        return allowedProperties;
    }

    @Override
    public void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("descriptor", descriptor);
        json.writeMapEntry("value", value);
        json.writeMapEnd();
    }

    @Override
    public void validateDefinition() throws QuickFixException {
        super.validateDefinition();

        // must have valid name
        String name = this.descriptor.getName();
        if (!AuraTextUtil.validateAttributeName(name)) {
            throw new InvalidDefinitionException(String.format(INVALID_NAME, name), getLocation());
        }

        // must have a value
        if (value == null) {
            throw new InvalidDefinitionException(MISSING_VALUE, getLocation());
        }

        // properties must be recognized
        for (String property : allowedProperties) {
            if (Property.lookup(property) == null && !EXTRA_PROPERTIES.contains(property)) {
                throw new InvalidDefinitionException(String.format(UNKNOWN_PROPERTY, property), getLocation());
            }
        }

        // SECURITY VALIDATION
        // for non-privileged namespaces, enforce extra security measures to prevent XSS attacks or general abuse:
        // 1) first and foremost, only allow alphanumeric + underscores + hyphens. This notably EXCLUDES quotes,
        // parenthesis (needed for functions like url), some characters needed for base64 encoded fonts like +,
        // escape sequences, entities, url schemes or paths. Before changing to allow quotes/parens/etc... make SURE you
        // understand the following points.

        // 2) we also need to prevent use of expression() (used by IE), or url(). however this is covered by above
        // because of the parens. If 1) is ever changed then make sure this detail is still addressed.

        // 3) Similarly, we shouldn't allow customer supplied token values to be used in url(), or with behavior or
        // -moz-binding properties. However that can't be handled here as it depends on where the token is actually
        // used, see TokenSecurityPlugin.java

        // 4) this assumes that tokens are only used for property values (and mq expressions). Generally this is
        // the only safe place to allow user-submitted data (e.g. not selectors).

        // 5) related to the above, take note of how token evaluation and substitution is performed by the parser.
        // Specifically, the token value is parsed as CSS Term units, and must result in valid syntax. This also by
        // nature guards against semicolons or other attempts to close the current CSS context (they are currently just
        // dropped, but we could throw an error message).

        // 6) finally, a user should not be able to bypass any of the above by using an aura expression
        if (!Aura.getConfigAdapter().isPrivilegedNamespace(parentDescriptor.getNamespace())) {
            // expressions, e.g., cross refs
            if (value instanceof Expression) {
                // currently only a single PropertyReference is valid, but this most likely will not hold true.
                // what we need to prevent is something like value="{!'expression' + '('}", however I'm not sure
                // how to do that without some kind of evaluation of the expression that allows checking every
                // argument. hopefully there's a better way.
                if (((Expression) value).getExpressionType() != ExpressionType.PROPERTY) {
                    throw new InvalidDefinitionException(ILLEGAL_EXPR, getLocation());
                }
            } else {
                // regular values
                Matcher matcher = RESTRICTED_CHARS.matcher(value.toString());
                if (!matcher.matches()) {
                    throw new InvalidDefinitionException(ILLEGAL_CHARS, getLocation());
                }
            }
        }
    }

    @Override
    public String toString() {
        return String.valueOf(value);
    }

    @Override
    public final int hashCode() {
        return hashCode;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj instanceof TokenDefImpl) {
            TokenDefImpl other = (TokenDefImpl) obj;
            return Objects.equal(descriptor, other.descriptor)
                    && Objects.equal(location, other.location)
                    && Objects.equal(value, other.value);
        }

        return false;
    }

    public static final class Builder extends DefinitionImpl.BuilderImpl<TokenDef> {
        public Builder() {
            super(TokenDef.class);
        }

        private Object value;
        private Set<String> allowedProperties;
        private DefDescriptor<? extends RootDefinition> parentDescriptor;

        public Builder setValue(Object value) {
            this.value = value;
            return this;
        }

        public Builder setAllowedProperties(String allowedProperties) {
            Iterable<String> split = Splitter.on(",").omitEmptyStrings().trimResults().split(allowedProperties.toLowerCase());
            this.allowedProperties = Sets.newHashSet(split);
            return this;
        }

        public Builder setParentDescriptor(DefDescriptor<? extends RootDefinition> parentDescriptor) {
            this.parentDescriptor = parentDescriptor;
            return this;
        }

        @Override
        public TokenDefImpl build() {
            return new TokenDefImpl(this);
        }
    }
}
