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

import java.util.Collections;
import java.util.Set;

import com.google.common.base.Optional;
import com.google.common.collect.Sets;
import com.salesforce.omakase.Message;
import com.salesforce.omakase.ast.RawSyntax;
import com.salesforce.omakase.ast.atrule.AtRule;
import com.salesforce.omakase.broadcast.Broadcaster;
import com.salesforce.omakase.parser.ParserException;
import com.salesforce.omakase.parser.Source;
import com.salesforce.omakase.parser.refiner.AtRuleRefiner;
import com.salesforce.omakase.parser.refiner.MasterRefiner;
import com.salesforce.omakase.parser.refiner.Refinement;
import com.salesforce.omakase.parser.token.Tokens;

/**
 * Parses {@code @flavor} custom at-rules.
 */
public final class AuraFlavorRefiner implements AtRuleRefiner {
    private static final String NAME = "flavor";
    private final Set<String> flavorNames = Sets.newHashSet();

    @Override
    public Refinement refine(AtRule atRule, Broadcaster broadcaster, MasterRefiner refiner) {
        if (!atRule.name().equals(NAME)) {
            return Refinement.NONE;
        }

        Optional<RawSyntax> expression = atRule.rawExpression();
        if (!expression.isPresent()) {
            throw new ParserException(atRule, "Expected to find the flavor name");
        }

        String flavorName = expression.get().content();

        // comma-separated list of names
        Source source = new Source(flavorName, expression.get().line(), expression.get().column());

        do {
            Optional<String> ident = source.skipWhitepace().readIdent();
            if (!ident.isPresent()) {
                throw new ParserException(source, Message.EXPECTED_VALID_ID);
            }
            flavorNames.add(ident.get());
        } while (source.skipWhitepace().optional(Tokens.COMMA).isPresent());

        atRule.markAsMetadataRule();
        return Refinement.FULL;
    }

    /**
     * Returns an unmodifiable view of all currently parsed flavor names.
     */
    public Set<String> flavorNames() {
        return Collections.unmodifiableSet(flavorNames);
    }
}
