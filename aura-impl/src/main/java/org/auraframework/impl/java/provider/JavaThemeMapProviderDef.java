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
package org.auraframework.impl.java.provider;

import java.util.Map;

import org.auraframework.def.ThemeMapProvider;
import org.auraframework.def.ThemeMapProviderDef;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * A {@link ThemeMapProviderDef} that maps to and invokes an instance of a {@link ThemeMapProvider} java class.
 * 
 * @see ThemeMapProvider
 */
final class JavaThemeMapProviderDef extends AbstractJavaProviderDef<ThemeMapProvider, ThemeMapProviderDef>
        implements ThemeMapProviderDef {
    private static final long serialVersionUID = -6882943436136564021L;

    public JavaThemeMapProviderDef(Builder builder) throws QuickFixException {
        super(ThemeMapProvider.class, builder);
    }

    @Override
    public Map<String, String> provide() throws QuickFixException {
        return provider.provide();
    }

    public static final class Builder extends AbstractJavaProviderDef.Builder<ThemeMapProviderDef> {
        protected Builder() {
            super(ThemeMapProviderDef.class);
        }

        @Override
        public ThemeMapProviderDef build() throws QuickFixException {
            return new JavaThemeMapProviderDef(this);
        }
    }
}
