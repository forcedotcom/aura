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
package org.auraframework.util.validation;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.auraframework.util.javascript.JavascriptProcessingError.Level;
import org.auraframework.util.json.Json;
import org.auraframework.util.json.JsonReader;
import org.auraframework.util.json.JsonSerializable;

import com.google.common.collect.Lists;

/**
 * Base class for all ValidationError implementations
 */
public class ValidationError implements JsonSerializable {

    protected static final Log LOG = LogFactory.getLog(ValidationError.class);

    private String validatingTool;
    private String message;
    private int line;
    private int startColumn;
    private String filename;
    private String evidence;
    private Level level;
    private String rule;

    /**
     * @param validationTool tool used to generate the errors (i.e. jslint)
     */
    public ValidationError(String tool) {
        setValidatingTool(tool);
    }

    public ValidationError(String tool, Level level) {
        this(tool);
        this.level = level;
    }

    public ValidationError(String tool, String filename, int line, int startColumn, String message, String evidence,
            Level level, String rule) {
        this(tool);
        this.filename = filename;
        this.line = line;
        this.startColumn = startColumn;
        this.message = message;
        this.evidence = evidence;
        this.level = level;
        setRule(rule);
    }

    public ValidationError(String tool, String filename, Map<String, ?> error) {
        validatingTool = tool;
        this.filename = filename;
        message = (String) error.get("message");
        if (message.endsWith(".")) {
            message = message.substring(0, message.length() - 1);
        }
        line = toInt(error.get("line"));
        startColumn = toInt(error.get("startColumn"));
        evidence = (String) error.get("evidence");
        setRule((String) error.get("rule"));
        level = toLevel((String) error.get("level"));
    }

    public final String getValidatingTool() {
        return validatingTool;
    }

    private void setValidatingTool(String tool) {
        if (tool.indexOf('&') != -1 && tool.indexOf(':') != 1)
            throw new IllegalArgumentException("invalid tool name: " + tool);
        validatingTool = tool;
    }

    public final String getMessage() {
        return this.message;
    }

    public final void setMessage(String message) {
        this.message = message;
    }

    public final int getLine() {
        return this.line;
    }

    public final void setLine(int line) {
        this.line = line;
    }

    public final int getStartColumn() {
        return this.startColumn;
    }

    public final void setStartColumn(int startColumn) {
        this.startColumn = startColumn;
    }

    public final String getFilename() {
        return filename;
    }

    public final void setFilename(String filename) {
        this.filename = filename;
    }

    public final String getRule() {
        return rule;
    }

    public final void setRule(String rule) {
        if (rule != null && rule.indexOf('&') != -1 && rule.indexOf(':') != 1)
            throw new IllegalArgumentException("invalid rule name: " + rule);
        this.rule = rule;
    }

    public final String getEvidence() {
        return evidence;
    }

    public final void setEvidence(String evidence) {
        this.evidence = evidence;
    }

    public final Level getLevel() {
        return level;
    }

    public final void setLevel(Level l) {
        this.level = l;
    }

    @Override
    public String toString() {
        return toCommonFormat();
    }

    /**
     * @return error formatted for the jenkins and eclipse plugins
     */
    public final String toCommonFormat() {
        // format: file.js [line 12, char 2] jslint @ rule: message
        StringBuilder sb = new StringBuilder();
        sb.append(toFilePath(filename));
        sb.append(" [line ");
        sb.append(line);
        sb.append(", column ");
        sb.append(startColumn);
        sb.append("] ");
        sb.append(validatingTool);
        if (rule != null) {
            sb.append(" @ ");
            sb.append(rule);
        }
        sb.append(": ");
        sb.append(message);
        return sb.toString();
    }

    /**
     * Parses error text from toCommonFormat and returns a ValidationError object.
     */
    public static final ValidationError fromCommonFormat(String text) {
        // format: file [line 12, column 2] jslint @ rule: message
        int lb = text.indexOf('[');
        int comma = text.indexOf(',', lb);
        int rb = text.indexOf(']', comma);
        int cl = text.indexOf(':', rb);
        int at = text.indexOf('&', rb);
        if (at > cl) {
            at = -1;
        }
        String filename = text.substring(0, lb).trim();
        int line = Integer.parseInt(text.substring(lb + 6, comma));
        int startColumn = Integer.parseInt(text.substring(comma + 9, rb));
        String rule = (at != -1) ? text.substring(at + 1, cl).trim() : null;
        String tool = text.substring(rb + 2, cl).trim();
        String message = text.substring(cl + 1).trim();

        ValidationError error = new ValidationError(tool);
        error.filename = filename;
        error.line = line;
        error.startColumn = startColumn;
        error.setRule(rule);
        error.message = message;
        return error;
    }

    @Override
    public final void serialize(Json json) throws IOException {
        json.writeMapBegin();
        json.writeMapEntry("tool", validatingTool);
        json.writeMapEntry("filename", toFilePath(filename));
        json.writeMapEntry("line", line);
        json.writeMapEntry("startColumn", startColumn);
        json.writeMapEntry("level", level);
        json.writeMapEntry("rule", rule);
        json.writeMapEntry("message", message);
        json.writeMapEntry("evidence", evidence);
        json.writeMapEnd();
    }

    public static final ValidationError deserialize(Map<String, ?> json) {
        ValidationError error = new ValidationError((String) json.get("tool"));
        error.filename = (String) json.get("filename");
        error.line = ((BigDecimal) json.get("line")).intValue();
        error.startColumn = ((BigDecimal) json.get("startColumn")).intValue();
        error.level = Level.valueOf((String) json.get("level"));
        error.setRule((String) json.get("rule"));
        error.message = (String) json.get("message");
        error.evidence = (String) json.get("evidence");
        return error;
    }

    //

    private static int toInt(Object line) {
        if (line instanceof Number) {
            return ((Number) line).intValue();
        }
        if (line instanceof String) {
            String sLine = (String) line;
            if ("undefined".equals(sLine)) {
                return -1;
            }
            LOG.warn("unexpected line [" + sLine + ']');
            return -1;
        }
        throw new IllegalArgumentException(String.valueOf(line));
    }

    private static Level toLevel(String sLevel) {
        if (sLevel == null) {
            return Level.Error;
        }
        if (sLevel.equals("error")) {
            return Level.Error;
        }
        if (sLevel.equals("warning")) {
            return Level.Warning;
        }
        throw new IllegalArgumentException(sLevel);
    }

    private static String toFilePath(String uri) {
        if (uri.startsWith("file:")) {
            return uri.substring(7);
        }
        if (uri.startsWith("jar:")) {
            return uri.substring(uri.lastIndexOf('!') + 2);
        }
        return uri;
    }

    //

    /**
     * @return List of ValidationErrors parsed from the json String.
     */
    public static List<String> parseErrors(String json) throws IOException {
        return parseErrors(new StringReader(json));
    }

    /**
     * @return List of ValidationErrors parsed from the text input
     */
    public static List<String> parseErrors(Reader input) throws IOException {
        BufferedReader reader = new BufferedReader(input);
        List<String> errors = Lists.newArrayList();
        String line;
        while ((line = reader.readLine()) != null) {
            errors.add(line);
        }
        return errors;
    }

    /**
     * @return List of ValidationErrors parsed from the json input
     */
    public static List<ValidationError> parseJsonErrors(Reader input) {
        @SuppressWarnings("unchecked")
        List<Map<String, ?>> jsonErrors = (List<Map<String, ?>>) new JsonReader().read(input);
        List<ValidationError> errors = Lists.newArrayListWithCapacity(jsonErrors.size());
        for (Map<String, ?> jsonError : jsonErrors) {
            errors.add(deserialize(jsonError));
        }
        return errors;
    }
}
