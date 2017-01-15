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
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokensDef;

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
}
