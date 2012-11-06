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
package org.auraframework.impl.javascript;

import java.io.IOException;
import java.util.EnumSet;


import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.util.javascript.directive.*;

/**
 * the aura javascript. starts at Force.js
 *
 *
 *
 */
public class AuraJavascriptGroup extends DirectiveBasedJavascriptGroup {

    public AuraJavascriptGroup() throws IOException {
        super("aura", AuraImplFiles.AuraJavascriptSourceDirectory.asFile(), "aura/Aura.js",
                DirectiveTypes.DEFAULT_TYPES,
                EnumSet.of(JavascriptGeneratorMode.DEVELOPMENT,
                        JavascriptGeneratorMode.STATS,
                        JavascriptGeneratorMode.TESTING,
                        JavascriptGeneratorMode.AUTOTESTING,
                        JavascriptGeneratorMode.TESTINGDEBUG,
                        JavascriptGeneratorMode.AUTOTESTINGDEBUG,
                        JavascriptGeneratorMode.PRODUCTION,
                        JavascriptGeneratorMode.PRODUCTIONDEBUG,
                        JavascriptGeneratorMode.DOC));
    }

}
