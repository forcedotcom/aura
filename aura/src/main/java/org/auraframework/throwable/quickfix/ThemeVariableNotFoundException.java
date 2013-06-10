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
package org.auraframework.throwable.quickfix;

import static com.google.common.base.Preconditions.checkNotNull;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;

/**
 * Exceptions used when a variable (attribute) isn't found in a {@link ThemeDef}.
 * 
 * TODONM add quickfix action.
 */
public class ThemeVariableNotFoundException extends AuraValidationException {
    private static final long serialVersionUID = -2571041901012359701L;

    public ThemeVariableNotFoundException(String variable) {
        this(variable, null);
    }

    public ThemeVariableNotFoundException(String variable, DefDescriptor<ThemeDef> descriptor) {
        super(getMessage(checkNotNull(variable), descriptor));
    }

    private static String getMessage(String variable, DefDescriptor<ThemeDef> descriptor) {
        if (descriptor != null) {
            String msg = "No theme variable named %s exists in theme %s";
            return String.format(msg, variable, descriptor.getDescriptorName());
        } else {
            String msg = "No theme variable named %s exists";
            return String.format(msg, variable);
        }
    }

}