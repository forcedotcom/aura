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
package org.auraframework.util.text;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * A very simple pattern matcher based on shell globbing.
 *
 * This matcher actually only matches the simplified patterns with '*' meaning any string.
 * All other globbing characters are illegal.
 *
 * Note that for the moment, this is case insensitive...
 */
public class GlobMatcher {
    private static final Pattern stringPattern = Pattern.compile("[a-zA-Z0-9_*]*");
    private static final String ALL_STRING = "*";
    private static final Pattern STAR = Pattern.compile("\\*");

    private final String original;
    private final Pattern pattern;
    private final boolean all;
    private final boolean constant;

    public GlobMatcher(String glob) {
        if (!stringPattern.matcher(glob).matches()) {
            throw new IllegalArgumentException("Illegal glob pattern: "+glob);
        }
        this.original = glob;
        if (glob.equals(ALL_STRING)) {
            this.all = true;
            this.pattern = null;
            this.constant = false;
        } else if (glob.contains(ALL_STRING)) {
            // Might need to add '.' and an escape mechanism or '/'
            Matcher matcher = STAR.matcher(glob);
            this.pattern = Pattern.compile(matcher.replaceAll(".*"), Pattern.CASE_INSENSITIVE);
            this.constant = false;
            this.all = false;
        } else {
            this.pattern = null;
            this.constant = true;
            this.all = false;
        }
    }

    public boolean isConstant() {
        return this.constant;
    }

    public boolean isAll() {
        return this.all;
    }

    public boolean match(String toMatch) {
        if (this.all) {
            return true;
        }
        if (this.constant) {
            return this.original.equalsIgnoreCase(toMatch);
        } else {
            return this.pattern.matcher(toMatch).matches();
        }
    }

    @Override
    public String toString() {
        return this.original;
    }
}
