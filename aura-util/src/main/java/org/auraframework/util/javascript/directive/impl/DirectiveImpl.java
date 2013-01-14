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

import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.auraframework.util.javascript.directive.Directive;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;
import org.auraframework.util.json.JsonReader;
import org.auraframework.util.json.JsonStreamReader.JsonParseException;

public abstract class DirectiveImpl implements Directive {

    private final int offset; // where in the file the directive originated
    private final String line;
    private final Map<String, Object> config;
    private final Set<JavascriptGeneratorMode> modes;
    private String content;

    @SuppressWarnings("unchecked")
    public DirectiveImpl(int offset, String line) {
        this.offset = offset;
        this.line = line;
        Object parsedLine = null;
        if (line != null) {
            try {
                parsedLine = new JsonReader().read(line);
            } catch (JsonParseException e) {
                // Parsing will fail if the line is not json, which is ok if
                // it's a simple directive.
                parsedLine = null;
            }
        }
        if (parsedLine != null && parsedLine instanceof Map) {
            config = (Map<String, Object>) parsedLine;
        } else {
            config = null;
        }

        if (config != null) {
            List<Object> modeStrings = (List<Object>) config.get("modes");
            List<Object> excludeModeStrings = (List<Object>) config.get("excludeModes");

            if (modeStrings != null && excludeModeStrings != null) {
                throw new UnsupportedOperationException(
                        "mode and excludeModes cannot both be specified in a single directive");
            }

            if (modeStrings != null) {
                modes = EnumSet.noneOf(JavascriptGeneratorMode.class);
                for (Object modeObj : modeStrings) {
                    modes.add(JavascriptGeneratorMode.valueOf((String) modeObj));
                }
            } else {
                modes = getDefaultModes();

                if (excludeModeStrings != null) {
                    // Remove any excluded modes from the default set
                    for (Object modeObj : excludeModeStrings) {
                        modes.remove(JavascriptGeneratorMode.valueOf((String) modeObj));
                    }
                }
            }
        } else {
            modes = getDefaultModes();
        }

    }

    protected EnumSet<JavascriptGeneratorMode> getDefaultModes() {
        return EnumSet.allOf(JavascriptGeneratorMode.class);
    }

    @Override
    public int getOffset() {
        return offset;
    }

    @Override
    public String getLine() {
        return line;
    }

    /**
     * @return If the line was a JSON formatted map, return it as a Java Map,
     *         else null.
     */
    public Map<String, Object> getConfig() {
        return config;
    }

    /**
     * @return Returns the modes.
     */
    public Set<JavascriptGeneratorMode> getModes() {
        return modes;
    }

    @Override
    public boolean hasOutput(JavascriptGeneratorMode mode) {
        return getModes().contains(mode);
    }

    protected String getContent() {
        if (isMultiline()) {
            return this.content;
        } else {
            throw new UnsupportedOperationException("Not a multiline directive");
        }
    }

    @Override
    public boolean isMultiline() {
        return false;
    }

    @Override
    public void setContent(String content) {
        if (isMultiline()) {
            this.content = content;
        } else {
            throw new UnsupportedOperationException("Not a multiline directive");
        }
    }
}
