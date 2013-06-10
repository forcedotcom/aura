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

import java.util.List;
import java.util.Set;

import org.auraframework.def.ComponentDefRef;
import org.auraframework.impl.root.component.ComponentDefRefImpl;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.StyleParserException;

import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import com.phloc.css.ECSSVersion;
import com.phloc.css.decl.CSSDeclaration;
import com.phloc.css.decl.CSSExpression;
import com.phloc.css.decl.CSSExpressionMemberFunction;
import com.phloc.css.decl.ICSSExpressionMember;
import com.phloc.css.writer.CSSWriterSettings;

/**
 * 
 */
final class ReworkThemeFunction implements DynamicRework<CSSDeclaration> {
    private static final CSSWriterSettings settings = new CSSWriterSettings(ECSSVersion.LATEST);
    private static final String MSG = "Cannot mix theme functions with other text. " +
            "Please rewrite to use one or more theme functions only.";

    private final Set<String> allReferences = Sets.newHashSet();

    public Set<String> getAllReferences() {
        return allReferences;
    }

    @Override
    public ComponentDefRef perform(CSSDeclaration declaration, List<Exception> errors) {
        CSSExpression expression = declaration.getExpression();
        List<String> references = collectReferences(expression);

        if (references.isEmpty()) {
            return null;
        }

        allReferences.addAll(references);

        if (references.size() != expression.getMemberCount()) {
            // you can't mix theme functions with plain text in declaration values.
            // for example, "margin: 0 theme(spacingLeftRight)" would be mixing. This
            // must be rewritten to something like "margin: theme(spacing)" or
            // "margin: theme(spaceTopBottom) theme(spaceLeftRight)". It's not expected
            // for this to be a big issue in practice, but if it does become an issue
            // we can start allowing the theme function to contain raw text, for example
            // margin: theme('0', spaceTopBottom).
            int line = expression.getSourceLocation().getFirstTokenBeginLineNumber();
            int col = expression.getSourceLocation().getFirstTokenBeginColumnNumber();
            Location l = new Location(declaration.getProperty(), line, col, -1);
            errors.add(new StyleParserException(MSG, l));
            return null;
        }

        ComponentDefRefImpl.Builder builder = new ComponentDefRefImpl.Builder();

        builder.setDescriptor("aura:themedDeclaration");
        builder.setAttribute("property", declaration.getProperty());
        builder.setAttribute("references", references);

        return builder.build();
    }

    /**
     * Finds all references to theme variables in the given expression.
     */
    private List<String> collectReferences(CSSExpression expression) {
        List<String> references = Lists.newArrayList();

        for (ICSSExpressionMember member : expression.getAllMembers()) {
            if (!(member instanceof CSSExpressionMemberFunction)) {
                continue;
            }

            CSSExpressionMemberFunction f = (CSSExpressionMemberFunction) member;
            if (f.getFunctionName().equals("theme") || f.getFunctionName().equals("t")) {
                references.add(f.getExpression().getAsCSSString(settings, 0));
            }
        }

        return references;
    }
}
