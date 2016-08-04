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
package org.auraframework.impl.javascript.provider;

import org.auraframework.def.ProviderDef;
import org.auraframework.impl.javascript.BaseJavascriptDef;

public class JavascriptProviderDef extends BaseJavascriptDef<ProviderDef> implements ProviderDef {
    private static final long serialVersionUID = -3839367107553671775L;

    protected JavascriptProviderDef(Builder builder) {
        super(builder);
    }

    public static class Builder extends BaseJavascriptDef.Builder<ProviderDef> {

        public Builder() {
            super(ProviderDef.class);
        }

        @Override
        public JavascriptProviderDef build() {
            return new JavascriptProviderDef(this);
        }
    }

    @Override
    public boolean supportsRefProvide() {
        return false;
    }

    @Override
    public Class<?> getJavaType() {
        return null;
    }
}
