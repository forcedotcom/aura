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

import java.util.List;

/**
 * javascript ouchies
 *
 *
 *
 */
public class JavascriptProcessingError {

    public enum Level {
        Warning, Error;
    }

    private String message;
    private int line;
    private int character;
    private String filename;
    private String evidence;
    private Level level;

    public JavascriptProcessingError() {
        this.level = Level.Error;
    }

    public JavascriptProcessingError(String message, int line, int character, String filename, String evidence,
            Level level) {
        this.message = message;
        this.line = line;
        this.character = character;
        this.filename = filename;
        this.evidence = evidence;
        this.level = level;
    }

    public static JavascriptProcessingError make(List<JavascriptProcessingError> errorsList, String message, int line,
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

    public String getMessage() {
        return this.message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public int getLine() {
        return this.line;
    }

    public void setLine(int line) {
        this.line = line;
    }

    public int getCharacter() {
        return this.character;
    }

    public void setCharacter(int character) {
        this.character = character;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getEvidence() {
        return evidence;
    }

    public void setEvidence(String evidence) {
        this.evidence = evidence;
    }

    public Level getLevel() {
        return level;
    }

    public void setLevel(Level l) {
        this.level = l;
    }

    @Override
    public String toString() {
        if (evidence == null || evidence.length() == 0) {
            return String.format("JS Processing %s: %s (line %s, char %s) : %s\n", level, filename, line,
                    character, message);
        } else {
            return String.format("JS Processing %s: %s (line %s, char %s) : %s \n %s\n", level, filename, line,
                    character, message, evidence);
        }
    }
}
