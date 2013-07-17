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

import org.auraframework.Aura;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.system.AuraContext.Mode;

import com.google.common.collect.Lists;
import com.phloc.css.decl.CSSDeclaration;
import com.phloc.css.decl.CSSExpression;
import com.phloc.css.decl.CSSExpressionMemberFunction;
import com.phloc.css.decl.CSSExpressionMemberTermURI;
import com.phloc.css.decl.ICSSExpressionMember;

/**
 * Add cache-busters to urls.
 */
public class ReworkImageUrls implements Rework<CSSDeclaration> {

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
        } else if (member instanceof CSSExpressionMemberTermURI) {
            CSSExpressionMemberTermURI uri = (CSSExpressionMemberTermURI) member;
            String url = uri.getURIString().trim();
            if (url.startsWith("/") && shouldAddCacheBuster()) {
                url = AuraBaseServlet.addCacheBuster(url);
            }

            return new CSSExpressionMemberTermURI(url);
        }
        return member;
    }

    private boolean shouldAddCacheBuster() {
        return Aura.getConfigAdapter().isAuraJSStatic()
                && Aura.getContextService().getCurrentContext().getMode() != Mode.DEV;
    }
}
