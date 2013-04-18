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

import com.google.common.css.SourceCodeLocation;
import com.google.common.css.compiler.ast.CssCompilerPass;
import com.google.common.css.compiler.ast.CssRefinerNode;
import com.google.common.css.compiler.ast.CssRulesetNode;
import com.google.common.css.compiler.ast.CssSelectorNode;
import com.google.common.css.compiler.ast.DefaultTreeVisitor;
import com.google.common.css.compiler.ast.ErrorManager;
import com.google.common.css.compiler.ast.GssError;
import com.google.common.css.compiler.ast.VisitController;

/**
 * Ensure that all selectors in a component's theme file begin with a
 * camel-cased concatenation of the component's componentClass and name.
 * 
 * E.g., all selectors in the theme file for aura:detailPage must begin with one
 * of the following:
 * 
 * .auraDetailPage &lt;element&gt;.auraDetailPage #&lt;id&gt;.auraDetailPage
 * 
 * 
 * @since 0.0.199
 */
public class VerifyComponentClass extends DefaultTreeVisitor implements CssCompilerPass {

    private final String componentClass;
    private final ErrorManager errorManager;
    private final VisitController visitController;

    public VerifyComponentClass(String componentClass, VisitController visitController, ErrorManager errorManager) {
        this.componentClass = componentClass;
        this.visitController = visitController;
        this.errorManager = errorManager;
    }

    @Override
    public void runPass() {
        if (componentClass != null) {
            visitController.startVisit(this);
        }
    }

    @Override
    public boolean enterRuleset(CssRulesetNode rulesetNode) {
        // we could use this same class to ensure all components start include
        // CMP as their componentClass
        // we would need to disable the GCS componentClass sub in PassRunner,
        // and do it in AuraPassRunner instead
        // *after* this is called.
        for (CssSelectorNode selector : rulesetNode.getSelectors().getChildren()) {
            List<CssRefinerNode> refiners = selector.getRefiners().getChildren();
            if (refiners.size() == 0 || !refiners.get(0).getRefinerName().equals(componentClass)) {
                SourceCodeLocation scl = selector.getSourceCodeLocation();
                GssError error = new GssError("CSS selectors must include component class: \"" + componentClass + "\"",
                        scl);
                errorManager.report(error);
            }
        }
        return true;
    }

    // helpful for debugging...
    // private String debugSelectorsAndRefiners(CssRulesetNode rulesetNode) {
    // StringBuilder sb = new StringBuilder("Ruleset ");
    // for(CssSelectorNode selector : rulesetNode.getSelectors().getChildren())
    // {
    // sb.append("{" + selector.getSelectorName());
    // for (CssRefinerNode refiner : selector.getRefiners().getChildren()) {
    // sb.append("{" + refiner.getRefinerName() + "}");
    // }
    // sb.append("}");
    // }
    // return sb.toString();
    // }
    //
    // private String debugRefiners(CssSelectorNode selectorNode) {
    // StringBuilder sb = new StringBuilder("Refiners ");
    // for (CssRefinerNode refiner : selectorNode.getRefiners().getChildren()) {
    // sb.append("{" + refiner.getRefinerName() + "}");
    // }
    // return sb.toString();
    // }

}
