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
package org.auraframework.util.javascript.directive.impl;

import java.io.IOException;
import java.util.List;

import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptValidator;
import org.auraframework.util.javascript.directive.DirectiveBasedJavascriptGroup;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;

/**
 * multiline directive that writes its contents out, but only in the specified modes.
 * //#if {"modes" : ["FUNKY"]}
 *   alert("get down");
 * //#end
 *
 *
 *
 */
public class IfDirective extends DirectiveImpl {

    public IfDirective(int offset, String line) {
        super(offset, line);
    }

    @Override
    public boolean isMultiline() {
        return true;
    }

    @Override
    public void processDirective(DirectiveBasedJavascriptGroup group) throws IOException {
        // could make this parse the inner content if needed
    }

    @Override
    public String generateOutput(JavascriptGeneratorMode mode) {
        return getContent();
    }

    @Override
    public List<JavascriptProcessingError> validate(JavascriptValidator validator) {
        return null;
    }

}
