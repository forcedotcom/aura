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

import java.util.List;
import java.util.Map;

import org.auraframework.util.validation.ValidationError;

/**
 * javascript ouchies
 */
public final class JavascriptProcessingError extends ValidationError {

    public enum Level {
        Warning, Error;
    }

    public JavascriptProcessingError() {
        super("js/custom", Level.Error);
    }

    JavascriptProcessingError(String tool, String filename, Map<String, ?> error) {
        super(tool, filename, error);
    }

    public JavascriptProcessingError(String message, int line, int character, String filename, String evidence,
            Level level) {
        super("js/custom", filename, line, character, message, evidence, level, null);
    }

    private static JavascriptProcessingError make(List<JavascriptProcessingError> errorsList, String message, int line,
            int character, String filename, String evidence, Level level) {
        JavascriptProcessingError msg = new JavascriptProcessingError(message, line, character, filename, evidence,
                level);
        errorsList.add(msg);
        return msg;
    }

    public static JavascriptProcessingError makeWarning(List<JavascriptProcessingError> errorsList, String message,
            int line, int character, String filename, String evidence) {
        return make(errorsList, message, line, character, filename, evidence, Level.Warning);
    }

    public static JavascriptProcessingError makeError(List<JavascriptProcessingError> errorsList, String message,
            int line, int character, String filename, String evidence) {
        return make(errorsList, message, line, character, filename, evidence, Level.Error);
    }

    @Override
    public String toString() {
        String s = String.format("JS Processing %s: %s (line %s, char %s) : %s", getLevel(), getFilename(), getLine(),
                getStartColumn(), getMessage());
        String evidence = getEvidence();
        if (evidence != null && evidence.length() > 0) {
            s += String.format(" \n %s", evidence);
        }
        s += '\n';
        return s;
    }
}
