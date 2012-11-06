/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import com.google.common.css.SourceCodeLocation;
import com.google.common.css.compiler.ast.*;

import java.util.Set;

/**
 * Verify that the conditions found in the CSS are within the set of
 * known conditionals.
 *
 */
public class VerifyConditions extends DefaultTreeVisitor
        implements CssCompilerPass {

    private final MutatingVisitController visitController;
    private final Set<String> allowedConditions;
    private final ErrorManager errorManager;
    private final Set<String> foundConditions;

    public VerifyConditions(MutatingVisitController visitController,
                                     Set<String> allowedConditions, Set<String> foundConditions, ErrorManager errorManager) {
        this.visitController = visitController;
        this.allowedConditions = allowedConditions;
        this.foundConditions = foundConditions;
        this.errorManager = errorManager;
    }

    @Override
    public boolean enterConditionalBlock(CssConditionalBlockNode block) {
        for(CssConditionalRuleNode r : block.getChildren()) {
            CssBooleanExpressionNode b = r.getCondition();
            // if b is null, we're at an @else with no condition
            if (b!=null) {
                String conditional = b.getValue();
                if (!allowedConditions.contains(conditional)) {
                    SourceCodeLocation scl = r.getSourceCodeLocation();
                    GssError error = new GssError("Unknown conditional: [" + conditional + "]. The allowed conditionals are: " + allowedConditions, scl);
                    errorManager.report(error);
                } else {
                    if (foundConditions!=null) {
                        foundConditions.add(conditional);
                    }
                }
            }
        }
        return true;
    }


    @Override
    public void runPass() {
        if (allowedConditions==null) return;
        visitController.startVisit(this);
    }
}
