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
package org.auraframework.impl.root.library;

import org.auraframework.def.IncludeDef;
import org.auraframework.impl.javascript.BaseJavascriptDef;

public class JavascriptIncludeDef extends BaseJavascriptDef<IncludeDef> implements IncludeDef {
    private static final long serialVersionUID = 8478482051480999239L;

    protected JavascriptIncludeDef(Builder builder) {
        super(builder);
    }

    public static class Builder extends BaseJavascriptDef.Builder<IncludeDef> {

        public Builder() {
            super(IncludeDef.class);
        }

        @Override
        public JavascriptIncludeDef build() {
            return new JavascriptIncludeDef(this);
        }
    }
}
