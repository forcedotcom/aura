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
package org.auraframework.util.javascript;

import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import javax.script.Invocable;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

import org.auraframework.util.IOUtil;

/**
 * validates some javascript using jslint
 */
public class JavascriptValidator {
    public static final String JSLINT = "jslint.js";
    public static final String JSLINT_HELPER = "jslint_helper.js";

    private final ScriptEngineManager manager = new ScriptEngineManager();
    private final ScriptEngine engine = manager.getEngineByName("js");
    private static final Pattern newlinePattern = Pattern.compile("\\r?\\n");

    public JavascriptValidator() throws IOException {

        InputStreamReader jsLintReader = new InputStreamReader(JavascriptValidator.class.getResourceAsStream(JSLINT));
        InputStreamReader helperReader = new InputStreamReader(
                JavascriptValidator.class.getResourceAsStream(JSLINT_HELPER));
        try {
            engine.eval(jsLintReader);
            engine.eval(helperReader);
        } catch (ScriptException e) {
            throw new RuntimeException(e);
        } finally {
            jsLintReader.close();
            helperReader.close();
        }
    }

    public List<JavascriptProcessingError> validate(String filename, String source, boolean allowDebugger,
            boolean allowUnfilteredForIn) {
        return runJSLint(filename, source, allowDebugger, allowUnfilteredForIn);
    }

    @SuppressWarnings("unchecked")
    private List<JavascriptProcessingError> runJSLint(String filename, String source, boolean allowDebugger,
            boolean allowUnfilteredForIn) {
        try {
            List<JavascriptProcessingError> errors = new ArrayList<JavascriptProcessingError>();

            if (source == null) {
                source = "";
            }

            String[] src = newlinePattern.split(source);

            List<Map<String, ?>> lintErrors = (List<Map<String, ?>>) ((Invocable) engine).invokeFunction(
                    "JSLintHelper", src, allowDebugger, allowUnfilteredForIn);

            for (int i = 0; i < lintErrors.size(); i++) {
                Map<?, ?> error = lintErrors.get(i);
                if (error != null) {
                    JavascriptProcessingError err = new JavascriptProcessingError();
                    err.setFilename(filename);
                    err.setMessage((String) error.get("reason"));
                    int line = -1;
                    try {
                        line = ((Number) error.get("line")).intValue();
                        err.setLine(line + 1);
                        err.setCharacter(((Number) error.get("character")).intValue() + 1);
                    } catch (ClassCastException e) {
                    }
                    err.setEvidence(error.get("evidence").toString());

                    errors.add(err);
                }
            }
            return errors;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static void main(String[] args) {
        try {
            String filename = args[0];
            String source = IOUtil.readTextFile(new File(filename));
            List<JavascriptProcessingError> ret = new JavascriptValidator().validate(filename, source, false, false);
            for (JavascriptProcessingError error : ret) {
                System.out.println(error);
            }
        } catch (Throwable e) {
            e.printStackTrace();
        }
    }

}
