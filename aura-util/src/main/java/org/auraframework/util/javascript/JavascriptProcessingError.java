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

import org.auraframework.util.validation.ValidationError;

/**
 * javascript error with position information.
 */
public final class JavascriptProcessingError extends ValidationError {
    public enum Level {
        Warning, Error;
    }

    public JavascriptProcessingError(String message, int line, int character, String filename, String evidence,
            Level level) {
        super("js/custom", filename, line, character, message, evidence, level, null);
    }

    @Override
    public String toString() {
        String s = String.format("JS Processing %s: %s (line %s, char %s) : %s", getLevel(), getFilename(), Integer.valueOf(getLine()),
                Integer.valueOf(getStartColumn()), getMessage());
        String evidence = getEvidence();
        if (evidence != null && evidence.length() > 0) {
            s += String.format(" \n %s", evidence);
        }
        s += '\n';
        return s;
    }
}
