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

import org.auraframework.Aura;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.system.AuraContext.Mode;

import com.google.common.collect.ImmutableList;
import com.google.common.css.compiler.ast.CssCompilerPass;
import com.google.common.css.compiler.ast.CssFunctionArgumentsNode;
import com.google.common.css.compiler.ast.CssFunctionNode;
import com.google.common.css.compiler.ast.CssFunctionNode.Function;
import com.google.common.css.compiler.ast.CssValueNode;
import com.google.common.css.compiler.ast.DefaultTreeVisitor;
import com.google.common.css.compiler.ast.MutatingVisitController;

/**
 * @since 0.0.234
 */
public class GetComponentImageURLs extends DefaultTreeVisitor implements CssCompilerPass {

    private static final Function URL = Function.byName("url");

    private final MutatingVisitController visitController;
    private final ThemeParserResultHolder resultHolder;

    public GetComponentImageURLs(MutatingVisitController visitController, ThemeParserResultHolder resultHolder) {
        this.visitController = visitController;
        this.resultHolder = resultHolder;
    }

    @Override
    public void runPass() {
        if (this.visitController != null) {
            visitController.startVisit(this);
        }
    }

    @Override
    public boolean enterFunctionNode(CssFunctionNode function) {
        if (function != null && function.getFunction() == URL) {
            CssFunctionNode tempCssNode = function.deepCopy();
            CssFunctionArgumentsNode args = tempCssNode.getArguments();
            for (CssValueNode child : args.getChildren()) {
                if (child != null) {
                    String url = child.getValue();
                    if (url != null) {
                        url = url.trim().replaceAll("(^['\"])|(['\"]$)", "");
                        if (url.startsWith("/") && shouldAddCacheBuster()) {
                            url = AuraBaseServlet.addCacheBuster(url);
                            child.setValue(url);
                        }
                        resultHolder.addImageURL(url);
                    }
                }
            }
            if (shouldAddCacheBuster()) {
                visitController.replaceCurrentBlockChildWith(ImmutableList.of(tempCssNode), false);
            }
        }
        return true;
    }

    private boolean shouldAddCacheBuster() {
        return Aura.getConfigAdapter().isAuraJSStatic()
                && Aura.getContextService().getCurrentContext().getMode() != Mode.DEV;
    }

}
