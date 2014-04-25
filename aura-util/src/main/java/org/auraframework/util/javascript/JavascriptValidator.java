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
package org.auraframework.util.javascript;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import javax.script.Invocable;

import org.auraframework.util.IOUtil;
import org.auraframework.util.validation.RhinoBasedValidator;

import com.google.common.collect.Lists;

/**
 * validates javascript using jslint
 */
public class JavascriptValidator extends RhinoBasedValidator {

    private static final Pattern newlinePattern = Pattern.compile("\\r?\\n");

    public JavascriptValidator() throws IOException {
        this(false);
    }

    public JavascriptValidator(boolean use2009JSLint) throws IOException {
        super(use2009JSLint ? "jslint2009" : "jslint");
    }

    public List<JavascriptProcessingError> validate(String filename, String source, boolean allowDebugger,
            boolean allowUnfilteredForIn) {
        if (source == null) {
            source = "";
        }

        try {
            List<JavascriptProcessingError> errors = Lists.newArrayList();
            String[] src = newlinePattern.split(source);

            @SuppressWarnings("unchecked")
            List<Map<String, ?>> lintErrors = (List<Map<String, ?>>) ((Invocable) engine).invokeFunction(tool
                    + "Helper",
                    src, allowDebugger, allowUnfilteredForIn);

            for (int i = 0; i < lintErrors.size(); i++) {
                Map<String, ?> error = lintErrors.get(i);
                if (error != null) {
                    errors.add(new JavascriptProcessingError(tool, filename, error));
                }
            }
            return errors;
        } catch (Exception e) {
            // TODO: should be reported as a validation error
            throw new RuntimeException(e);
        }
    }

    //

    public static void main(String[] args) throws Exception {
        String filename = args[0];
        String source = IOUtil.readTextFile(new File(filename));
        List<JavascriptProcessingError> ret = new JavascriptValidator().validate(filename, source, false, false);
        for (JavascriptProcessingError error : ret) {
            System.out.println(error);
        }
    }
}
