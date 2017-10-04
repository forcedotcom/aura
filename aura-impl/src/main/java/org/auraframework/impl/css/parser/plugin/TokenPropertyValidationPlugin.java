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
package org.auraframework.impl.css.parser.plugin;

import com.salesforce.omakase.ast.declaration.Declaration;
import com.salesforce.omakase.broadcast.annotation.Validate;
import com.salesforce.omakase.error.ErrorManager;
import com.salesforce.omakase.plugin.Plugin;
import org.auraframework.throwable.quickfix.QuickFixException;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Checks that tokens are used on the correct property.
 */
public final class TokenPropertyValidationPlugin implements Plugin {

    public final Map<String, Set<String>> tokensInCssProperties = new HashMap<>();

    @Validate
    public void validate(TokenFunction function, ErrorManager em) throws QuickFixException {
        Declaration declaration = function.parent().declaration();
        String property = declaration.propertyName().unprefixed();

        Set<String> propertyReferenceSet = tokensInCssProperties.getOrDefault(property, new HashSet<>());
        propertyReferenceSet.add(function.args());
        tokensInCssProperties.put(property, propertyReferenceSet);
    }
}
