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
package org.auraframework.def;

/**
 * Used inside of {@link TokensDef}s.
 * <p>
 * <aura:token name="xxx" value="xxx"/>
 */
public interface TokenDef extends Definition {
    @Override
    DefDescriptor<TokenDef> getDescriptor();

    /**
     * Gets the value of the token. This may be a String, Integer, etc... but it might also be an expression.
     */
    Object getValue();
}
