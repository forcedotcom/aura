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

import org.auraframework.impl.css.token.TokenDefImpl;

import com.salesforce.omakase.ast.declaration.PropertyName;
import com.salesforce.omakase.broadcast.annotation.Validate;
import com.salesforce.omakase.error.ErrorLevel;
import com.salesforce.omakase.error.ErrorManager;
import com.salesforce.omakase.plugin.Plugin;

/**
 * Prevent XSS and other abuses of tokens. For more information see {@link TokenDefImpl#validateDefinition()}.
 */
public final class TokenSecurityPlugin implements Plugin {
    @Validate
    public void validate(TokenFunction tf, ErrorManager em) {
        // prevent any token usage with potentially dangerous properties.
        PropertyName pn = tf.parent().declaration().propertyName();
        if (pn.matches("-moz-binding")) {
            em.report(ErrorLevel.FATAL, tf, "tokens cannot be used with -moz-binding");
        } else if (pn.matches("behavior")) {
            em.report(ErrorLevel.FATAL, tf, "tokens cannot be used with the behavior property");
        }
    }
}
