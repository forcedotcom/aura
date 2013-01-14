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
package org.auraframework.util.javascript.directive;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.auraframework.util.javascript.JavascriptProcessingError;
import org.auraframework.util.javascript.JavascriptValidator;

/**
 * parses files for directives
 */
public class DirectiveParser {

    // 1 space is allowed, for dutch.
    public static final Pattern DIRECTIVE_MARKER = Pattern.compile("^// ?#");
    public static final String END_DIRECTIVE = "end";

    private final DirectiveBasedJavascriptGroup group;
    private final File file;

    private boolean parsed = false;
    protected LinkedList<Directive> directives;
    private final StringBuilder content;
    private final List<JavascriptProcessingError> parseErrors;

    public DirectiveParser(DirectiveBasedJavascriptGroup group, File startFile) {
        this.group = group;
        this.file = startFile;
        directives = new LinkedList<Directive>();
        content = new StringBuilder(1000);
        parseErrors = new LinkedList<JavascriptProcessingError>();
    }

    public List<DirectiveType<?>> getDirectiveTypes() {
        return group.getDirectiveTypes();
    }

    public void parseFile() throws IOException {
        BufferedReader reader = null;
        Map<String, DirectiveType<?>> byString = new HashMap<String, DirectiveType<?>>();
        for (DirectiveType<?> type : getDirectiveTypes()) {
            String label = type.getLabel();
            if (byString.containsKey(label)) {
                throw new RuntimeException(String.format("Mutliple directives registered for label %s", label));
            }
            byString.put(label, type);
        }
        if (byString.containsKey(END_DIRECTIVE)) {
            throw new RuntimeException("cannot create a directive with the reserved label \"end\"");
        }

        try {
            reader = new BufferedReader(new FileReader(file));
            int lineNum = 1;
            String line = reader.readLine();
            // remember if we are in a multiline directive
            Directive multiline = null;
            StringBuilder multilineContent = null;
            while (line != null) {
                // allow whitespace before the directive
                String trimmed = line.trim();
                Matcher m = DIRECTIVE_MARKER.matcher(trimmed);
                if (m.find()) {
                    String stripped = trimmed.substring(m.end());
                    int end = stripped.indexOf(' ');
                    String dirString = end == -1 ? stripped : stripped.substring(0, end);
                    DirectiveType<?> type = byString.get(dirString);
                    if (type != null) {
                        if (multiline != null) {
                            addError(lineNum, "nested directive found, ignored", trimmed);
                        } else {
                            String restOfLine = end == -1 ? "" : stripped.substring(end + 1);
                            Directive d = type.constructDirective(content.length(), restOfLine);
                            if (d.isMultiline()) {
                                multiline = d;
                                multilineContent = new StringBuilder();
                            }
                            directives.addFirst(d);
                        }
                    } else if (END_DIRECTIVE.equals(dirString)) {
                        if (multiline == null) {
                            addError(lineNum, "unmatched end directive", trimmed);
                        } else {
                            multiline.setContent(multilineContent.toString());
                            multiline = null;
                            multilineContent = null;
                        }
                    } else {
                        addError(lineNum, "unrecognized directive", trimmed);
                    }
                    content.append('\n');
                } else if (multiline != null) {
                    multilineContent.append(line);
                    multilineContent.append('\n');
                } else {
                    content.append(line);
                    content.append('\n');
                }
                line = reader.readLine();
                lineNum++;
            }
            if (multiline != null) {
                addError(lineNum, "no end found for directive", "");
            }
        } finally {
            if (reader != null) {
                reader.close();
            }
        }
        for (Directive d : directives) {
            d.processDirective(group);
        }
        parsed = true;
    }

    private void addError(int lineNum, String message, String code) {
        JavascriptProcessingError e = new JavascriptProcessingError();
        e.setFilename(file.getName());
        e.setLine(lineNum);
        e.setCharacter(0);
        e.setMessage(message);
        e.setEvidence(code);
        this.parseErrors.add(e);
    }

    public List<JavascriptProcessingError> validate(JavascriptValidator validator) {
        List<JavascriptProcessingError> errors = new LinkedList<JavascriptProcessingError>(parseErrors);
        errors.addAll(validator.validate(file.getName(), content.toString(), false, true));
        for (Directive d : directives) {
            List<JavascriptProcessingError> dErrors = d.validate(validator);
            if (dErrors != null) {
                errors.addAll(dErrors);
            }
        }
        return errors;
    }

    public String generate(JavascriptGeneratorMode mode) {
        if (!parsed) {
            throw new RuntimeException("Must parse before generation");
        }
        StringBuilder generated = new StringBuilder(content.length() + 16);
        if (mode.addComments()) {
            generated.append("/* file ");
            generated.append(file.getName());
            generated.append(" */\n");
        }
        int commentOffset = generated.length();
        generated.append(content);
        for (Directive d : directives) {
            if (d.hasOutput(mode)) {
                generated.insert(d.getOffset() + commentOffset, d.generateOutput(mode));
            }
        }
        return generated.toString();
    }

}
