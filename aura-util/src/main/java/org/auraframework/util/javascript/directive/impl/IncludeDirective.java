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

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptValidator;
import org.auraframework.util.javascript.directive.*;

/**
 * includes another file, expecting just the filename relative to the root in java format (. instead of / as dir separator)
 *
 *
 *
 */
public class IncludeDirective extends DirectiveImpl {
    private File include;
    private DirectiveParser includedParser;
    private final String path;

    public IncludeDirective(int offset, String line) {
        super(offset, line);
        Map<String, Object> config = getConfig();
        if(config != null){
            path = (String)config.get("path");
            assert path != null : "Path is required in include directive config";
        }else{
            path = getLine();
        }
    }

    @Override
    public void processDirective(DirectiveBasedJavascriptGroup group) throws IOException {
        // get the file, group will do validation
        String relativeFile = path.replace('.', File.separatorChar) + ".js";
        this.include = group.addFile(relativeFile);
        includedParser = new DirectiveParser(group, include);
        includedParser.parseFile();
    }

    @Override
    public String generateOutput(JavascriptGeneratorMode mode) {
        return includedParser.generate(mode);
    }

    @Override
    public List<JavascriptProcessingError> validate(JavascriptValidator validator) {
        return includedParser.validate(validator);
    }

}
