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

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.def.ThemeDescriptorProvider;
import org.auraframework.def.ThemeDescriptorProviderDef;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * A {@link ThemeDescriptorProviderDef} that maps to and invokes an instance of a {@link ThemeDescriptorProvider} java
 * class.
 * 
 * @see ThemeDescriptorProvider
 */
final class JavaThemeDescriptorProviderDef extends
        AbstractJavaProviderDef<ThemeDescriptorProvider, ThemeDescriptorProviderDef>
        implements ThemeDescriptorProviderDef {
    private static final long serialVersionUID = -124253037254852866L;

    public JavaThemeDescriptorProviderDef(Builder builder) throws QuickFixException {
        super(ThemeDescriptorProvider.class, builder);
    }

    @Override
    public DefDescriptor<ThemeDef> provide() throws QuickFixException {
        return provider.provide();
    }

    public static final class Builder extends AbstractJavaProviderDef.Builder<ThemeDescriptorProviderDef> {
        protected Builder() {
            super(ThemeDescriptorProviderDef.class);
        }

        @Override
        public ThemeDescriptorProviderDef build() throws QuickFixException {
            return new JavaThemeDescriptorProviderDef(this);
        }
    }
}
