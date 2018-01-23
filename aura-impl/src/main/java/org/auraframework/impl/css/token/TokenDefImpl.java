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

import com.google.common.base.Objects;
import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSet;
import com.salesforce.omakase.data.Property;
import com.salesforce.omakase.util.Properties;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokenDef;
import org.auraframework.def.TokensDef;
import org.auraframework.expression.Expression;
import org.auraframework.expression.ExpressionType;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

import java.io.IOException;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class TokenDefImpl extends DefinitionImpl<TokenDef> implements TokenDef {
    private static final String INVALID_NAME = "Invalid token name: '%s'";
    private static final String MISSING_VALUE = "Missing required attribute 'value'";
    private static final String UNKNOWN_PROPERTY = "Unknown CSS property '%s'";
    private static final String ILLEGAL_EXPR = "Illegal expression in token value";
    private static final String ILLEGAL_CHARS = "Illegal character in token value";
    private static final String ILLEGAL_VALUE = "'%s' is not allowed in token values";
    private static final String ILLEGAL_TOKEN_REF = "Token function not allowed in value for token '%s'";

    /**
     * allows all alpha-numeric, spaces, underscores, hyphens, commas (for font lists), dots (for numbers), % (for
     * units), # (for hex values), forward slash (font shorthand), single quote, parens (for functions). See comments
     * below before changing.
     */
    private static final Pattern ALLOWED_CHARS = Pattern.compile("[ a-zA-Z0-9_\\-%#.,()'/]*");
    private static final List<String> DISALLOWED = ImmutableList.of("url", "expression", "javascript");
    private static final List<Pattern> TOKEN_PATTERNS = ImmutableList.of(
        Pattern.compile("token\\("), // token() anywhere
        Pattern.compile("^t\\("), // t() at the start (don't catch linear-gradient())
        Pattern.compile(" +t\\(") // t() following one or more spaces, e.g., 1px t(foo)
    );
    
    private static final Set<String> EXTRA_PROPERTIES = ImmutableSet.of("box-flex");
    
    private static final long serialVersionUID = 344237166606014917L;

    private final Object value;
    private final Set<String> allowedProperties;
    private final String allowedPropertiesString;
    private final DefDescriptor<TokensDef> parentDescriptor;
    private transient final ConfigAdapter configAdapter;

    private final int hashCode;

    public TokenDefImpl(Builder builder) {
        super(builder);
        this.value = builder.value;
        this.allowedProperties = AuraUtil.immutableSet(builder.allowedProperties);
        this.allowedPropertiesString = builder.allowedPropertiesString;
        this.parentDescriptor = builder.parentDescriptor;
        this.configAdapter = builder.configAdapter;

        this.hashCode = AuraUtil.hashCode(descriptor, location, value);
    }

    @Override
    public DefDescriptor<TokensDef> getParentDescriptor() {
        return parentDescriptor;
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
    public String getAllowedPropertiesString() {
        return allowedPropertiesString;
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
        if (!validateTokenName(name)) {
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
        
        // cannot reference the token function
        if (!(value instanceof Expression)) {
            String check = value.toString().trim().toLowerCase();
            for (Pattern pattern: TOKEN_PATTERNS) {
                if (pattern.matcher(check).find()) {
                    throw new InvalidDefinitionException(String.format(ILLEGAL_TOKEN_REF, name), getLocation());
                }
            }            
        }

        // for external namespaces, enforce extra security measures to prevent XSS attacks or other abuse:

        // 1) only allow a whitelist of characters. This notably EXCLUDES blackslashes used for escape sequences, html
        // entities (&...;), comments (could be used to work around the blacklist, below), and : (necessary for url protocols).

        // 2) disallow words from a blacklist, case insensitive. Specifically prevent any usage of url(), expression()
        // or attempts to use the javascript protocol.

        // 3) similarly, we shouldn't allow customer supplied token values to be used in url(), or with behavior or
        // -moz-binding properties. However that can't be handled here as it depends on where the token is actually
        // used, see TokenSecurityPlugin.java

        // 4) the user should not be able to bypass any of the above with aura expressions

        // also note that if the value does not parse as valid syntax for where the token is referenced, the value
        // will not be included in the output. This is handled by nature of how the substitution is performed.

        if (configAdapter != null && !configAdapter.isInternalNamespace(parentDescriptor.getNamespace())) {
            // expressions, e.g., cross refs
            if (value instanceof Expression) {
                // currently only a single PropertyReference is valid, but this most likely will not hold true.
                // what we need to prevent is something like value="{!'ur' + 'l('}"
                if (((Expression) value).getExpressionType() != ExpressionType.PROPERTY) {
                    throw new InvalidDefinitionException(ILLEGAL_EXPR, getLocation());
                }
            } else {
                // regular values
                String stringValue = value.toString().toLowerCase();
                Matcher matcher = ALLOWED_CHARS.matcher(stringValue);
                if (!matcher.matches()) {
                    throw new InvalidDefinitionException(ILLEGAL_CHARS, getLocation());
                }
                for (String blacklisted : DISALLOWED) {
                    if (stringValue.contains(blacklisted)) {
                        throw new InvalidDefinitionException(String.format(ILLEGAL_VALUE, blacklisted), getLocation());
                    }
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
        private String allowedPropertiesString;
        private DefDescriptor<TokensDef> parentDescriptor;
        private ConfigAdapter configAdapter;

        public Builder setValue(Object value) {
            this.value = value;
            return this;
        }

        public Builder setAllowedProperties(String rawString) {
            this.allowedPropertiesString = rawString;
            
            allowedProperties = new LinkedHashSet<>();

            for (String name : Splitter.on(",").trimResults().split(rawString.toLowerCase())) {
                if (name.length() > 1 && name.contains("*")) { // handle wildcards
                    for (Property property : Properties.expand(name)) {
                        allowedProperties.add(property.toString());
                    }
                } else {
                    allowedProperties.add(name);
                }
            }

            return this;
        }

        public Builder setParentDescriptor(DefDescriptor<TokensDef> parentDescriptor) {
            this.parentDescriptor = parentDescriptor;
            return this;
        }

        public Builder setConfigAdapter(ConfigAdapter configAdapter) {
            this.configAdapter = configAdapter;
            return this;
        }

        @Override
        public TokenDefImpl build() {
            return new TokenDefImpl(this);
        }
    }

    private boolean validateTokenName(String name) {
        Pattern p = Pattern.compile("^[a-zA-Z_](\\.?[-a-zA-Z0-9_]*)*$");
        Matcher m = p.matcher(name);
        return m.find();
    }
}
