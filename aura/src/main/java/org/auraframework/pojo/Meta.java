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
package org.auraframework.pojo;

import java.io.Serializable;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.lang3.StringEscapeUtils;
import org.auraframework.system.Location;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * aura:meta
 * Holds aura:documentation meta
 */
public class Meta implements Serializable {

    private static final long serialVersionUID = 1L;
    private static final Pattern NAME_PATTERN = Pattern.compile("^[a-zA-Z_].[-a-zA-Z0-9_]*$");
    private final String name;
    private final String value;
    private final Location location;

    public Meta(String name, String value, Location location) {
        super();
        this.name = name;
        this.value = value;
        this.location = location;
    }
    
    public String getName() {
        return this.name;
    }
    
    public String getValue() {
        return this.value;
    }
    
    public String getEscapedValue() {
        return StringEscapeUtils.escapeHtml4(this.value);
    }

    public void validate() throws QuickFixException {
        String name = getName();
        if (name == null) {
            throw new InvalidDefinitionException(String.format("Invalid name '%s' for aura:meta tag.", name), this.location);
        }

        Matcher matcher = NAME_PATTERN.matcher(name);
        if (!matcher.matches()) {
           throw new InvalidDefinitionException(String.format("Invalid name '%s' for aura:meta tag.", name), this.location);
        }
        
        if (value == null) {
            throw new InvalidDefinitionException(String.format("Missing value for aura:meta tag '%s'", name), this.location);
        }
    }

    @Override
    public String toString() {
        return this.value;
    }
}
