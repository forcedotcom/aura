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

/**
 * Aura-specific PassRunner.
 *
 *
 * @since 0.0.199
 */

import com.google.common.css.compiler.ast.CssTree;
import com.google.common.css.compiler.ast.ErrorManager;

public class AuraPassRunner {

    private final ErrorManager errorManager;
    private final String namespace;
    private final ThemeParserResultHolder resultHolder;

    public AuraPassRunner(String namespace, ErrorManager errorManager, ThemeParserResultHolder resultHolder) {
        this.namespace = namespace;
        this.errorManager = errorManager;
        this.resultHolder = resultHolder;
    }

    public void runPasses(CssTree cssTree) {
        if (namespace!=null) {
            new VerifyComponentClass(namespace, cssTree.getMutatingVisitController(), errorManager).runPass();
            if (resultHolder!=null) {
                new GetComponentImageURLs(cssTree.getMutatingVisitController(), resultHolder).runPass();
            }
        }
    }

}
