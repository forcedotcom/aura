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
import java.util.Map;

import org.auraframework.Aura;
import org.auraframework.def.NamespaceDef;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.DefinitionNotFoundException;
import org.auraframework.throwable.quickfix.QuickFixException;

import com.google.common.collect.Lists;
import com.phloc.css.ECSSVersion;
import com.phloc.css.ICSSWriterSettings;
import com.phloc.css.decl.CSSDeclaration;
import com.phloc.css.decl.CSSExpression;
import com.phloc.css.decl.CSSExpressionMemberFunction;
import com.phloc.css.decl.CSSExpressionMemberTermSimple;
import com.phloc.css.decl.ICSSExpressionMember;
import com.phloc.css.writer.CSSWriterSettings;

/**
 * Perform namespace.xml variable substitutions.
 */
public class ReworkNamespaceConstants implements Rework<CSSDeclaration> {
    private static final ICSSWriterSettings settings = new CSSWriterSettings(ECSSVersion.LATEST);

    private final String namespace;
    private Map<String, String> nsDefs = null;

    public ReworkNamespaceConstants(String namespace) {
        this.namespace = namespace;
    }

    @Override
    public void perform(CSSDeclaration declaration, List<CSSDeclaration> reworked, List<Exception> errors) {
        CSSExpression expr = declaration.getExpression();
        List<ICSSExpressionMember> newMembers = Lists.newArrayList();

        for (int j = 0; j < expr.getMemberCount(); j++) {
            ICSSExpressionMember member = expr.getMemberAtIndex(j);
            newMembers.add(replaceMemberTokens(member));
        }

        while (expr.getMemberCount() > 0) {
            expr.removeMember(0);
        }

        for (int j = 0; j < newMembers.size(); j++) {
            expr.addMember(newMembers.get(j));
        }

        reworked.add(declaration);
    }

    private ICSSExpressionMember replaceMemberTokens(ICSSExpressionMember member) {
        if (member instanceof CSSExpressionMemberFunction) {
            CSSExpressionMemberFunction func = (CSSExpressionMemberFunction) member;
            CSSExpression expr = func.getExpression();
            List<ICSSExpressionMember> newMembers = Lists.newArrayList();
            for (int k = 0; k < expr.getMemberCount(); k++) {
                newMembers.add(replaceMemberTokens(expr.getMemberAtIndex(k)));
            }
            while (expr.getMemberCount() > 0) {
                expr.removeMember(0);
            }
            for (int j = 0; j < newMembers.size(); j++) {
                expr.addMember(newMembers.get(j));
            }
        } else {
            String value = member.getAsCSSString(settings, 0);
            if (value.matches("[A-Z]+")) {
                String val = resolveToken(value);
                if (val != null) {
                    return new CSSExpressionMemberTermSimple(val);
                }
            }
        }
        return member;
    }

    private String resolveToken(String key) {
        String ret = null;
        try {
            if (nsDefs == null) {
                NamespaceDef namespaceDef = Aura.getDefinitionService().getDefinition(namespace, NamespaceDef.class);
                nsDefs = namespaceDef.getStyleTokens();
            }
            if (nsDefs.containsKey(key)) {
                ret = nsDefs.get(key);
            }
        } catch (DefinitionNotFoundException dnfe) {
            // ignore.
        } catch (QuickFixException e) {
            throw new AuraRuntimeException(e);
        }
        return ret;
    }

}
