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
package org.auraframework.impl.css.util;

import org.auraframework.Aura;
import org.auraframework.css.TokenCache;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokensDef;
import org.auraframework.http.AuraBaseServlet;
import org.auraframework.system.AuraContext;

import com.google.common.base.Optional;

/**
 * Utilities for working with CSS tokens.
 */
public final class Tokens {
    /**
     * Builds a def descriptor for the namespace-default {@link TokensDef}, from the same namespace as the given def
     * descriptor. The given def descriptor can be for any type (component, style, etc...).
     *
     * @param descriptor Find the namespace-default tokens from the same namespace as this descriptor.
     */
    public static DefDescriptor<TokensDef> namespaceDefaultDescriptor(DefDescriptor<?> descriptor) {
        return Aura.getStyleAdapter().getNamespaceDefaultDescriptor(descriptor);
    }

    /**
     * FIXMENM: doc Gets the list of overrides explicitly specified to this context. These are the tokens that are used
     * to "override" the default token values.
     * <p>
     * While usually the token overrides are specified on the application tag itself, in some situations the overrides
     * may be directly specified to this context, e.g., in some usages of the integration service.
     * <p>
     * The application's overrides are not implicitly included in this result by default. However, note that the
     * application's overrides are explicitly added to the context at one point during the request (See
     * {@link AuraBaseServlet#getStyles()}). Effectively this means that these <em>will</em> be included during the
     * actual CSS request itself. See {@link #addAppTokensDescriptors()}.
     */
    public static Optional<TokenCache> getTokenOverrides(AuraContext context) {
        return null;
    }
}
