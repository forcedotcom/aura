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
package org.auraframework.impl.css.parser.plugin;

import static com.google.common.base.Preconditions.checkNotNull;

import java.util.List;
import java.util.Set;

import org.auraframework.css.TokenValueProvider;
import org.auraframework.def.TokenDef;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.base.Optional;
import com.salesforce.omakase.ast.CssAnnotation;
import com.salesforce.omakase.ast.declaration.Declaration;
import com.salesforce.omakase.broadcast.annotation.Validate;
import com.salesforce.omakase.error.ErrorLevel;
import com.salesforce.omakase.error.ErrorManager;
import com.salesforce.omakase.plugin.Plugin;

/**
 * Checks that tokens are used on the correct property.
 */
public final class TokenPropertyValidationPlugin implements Plugin {
    private static final String BYPASS_ANNOTATION = "reviewed-violation";
    private static final String MSG = "the '%s' token cannot be used with the %s property.\nAllowed properties: %s";
    private static final String MISSING_EXPLANATION = "missing explanation for " + BYPASS_ANNOTATION + " annotation";

    private final TokenValueProvider tokenProvider;

    public TokenPropertyValidationPlugin(TokenValueProvider tokenProvider) {
        this.tokenProvider = checkNotNull(tokenProvider, "tokenProvider cannot be null");
    }

    @Validate
    public void validate(TokenFunction function, ErrorManager em) throws QuickFixException {
        Declaration declaration = function.parent().declaration();
        String property = declaration.propertyName().unprefixed();

        for (List<TokenDef> defs : tokenProvider.extractTokenDefs(function.args())) {
            for (TokenDef def : defs) {
                Set<String> allowed = def.getAllowedProperties();
                if (!allowed.isEmpty() && !allowed.contains(property)) {
                    // check for bypass annotation
                    Optional<CssAnnotation> annotation = declaration.annotation(BYPASS_ANNOTATION);
                    if (annotation.isPresent()) {
                        // must have explanation
                        if (annotation.get().arguments().size() == 0) {
                            em.report(ErrorLevel.FATAL, declaration, MISSING_EXPLANATION);
                        }
                    } else {
                        // report the violation
                        em.report(ErrorLevel.FATAL, function, String.format(MSG, def.getName(), property, allowed));
                    }
                }
            }
        }
    }
}
