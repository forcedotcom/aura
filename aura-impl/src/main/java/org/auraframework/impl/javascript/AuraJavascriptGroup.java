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
package org.auraframework.impl.javascript;

import java.io.File;
import java.io.IOException;
import java.util.EnumSet;

import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.util.javascript.directive.DirectiveBasedJavascriptGroup;
import org.auraframework.util.javascript.directive.DirectiveTypes;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;

/**
 * the aura javascript. starts at Force.js
 */
public class AuraJavascriptGroup extends DirectiveBasedJavascriptGroup {

    static final String GROUP_NAME = "aura";

    public AuraJavascriptGroup() throws IOException {
        this(AuraImplFiles.AuraJavascriptSourceDirectory.asFile());
    }

    /**
     * Alternate constructor for tests which might want to control the root
     * directory.
     */
    protected AuraJavascriptGroup(File rootDirectory) throws IOException {
        super(GROUP_NAME, rootDirectory, "aura/Aura.js", DirectiveTypes.DEFAULT_TYPES, EnumSet.of(
                JavascriptGeneratorMode.DEVELOPMENT, JavascriptGeneratorMode.STATS, JavascriptGeneratorMode.TESTING,
                JavascriptGeneratorMode.AUTOTESTING, JavascriptGeneratorMode.TESTINGDEBUG,
                JavascriptGeneratorMode.AUTOTESTINGDEBUG, JavascriptGeneratorMode.PRODUCTION,
                JavascriptGeneratorMode.PRODUCTIONDEBUG, JavascriptGeneratorMode.DOC));
    }

}
