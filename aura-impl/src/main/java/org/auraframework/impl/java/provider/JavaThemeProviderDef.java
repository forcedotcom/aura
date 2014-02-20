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

import java.io.IOException;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ThemeDef;
import org.auraframework.def.ThemeDescriptorProvider;
import org.auraframework.def.ThemeProviderDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 * A {@link ThemeProviderDef} that maps to and invokes an instance of a {@link ThemeDescriptorProvider} java class.
 * 
 * @see ThemeDescriptorProvider
 */
public class JavaThemeProviderDef extends DefinitionImpl<ThemeProviderDef> implements ThemeProviderDef {
    private static final long serialVersionUID = -124253037254852866L;
    private final ThemeDescriptorProvider provider;

    public JavaThemeProviderDef(Builder builder) throws QuickFixException {
        super(builder);

        Class<?> klass = builder.klass;
        if (ThemeDescriptorProvider.class.isAssignableFrom(klass)) {
            try {
                provider = (ThemeDescriptorProvider) klass.newInstance();
            } catch (InstantiationException ie) {
                throw new InvalidDefinitionException("Cannot instantiate " + klass.getName(), location);
            } catch (IllegalAccessException iae) {
                throw new InvalidDefinitionException("Constructor is inaccessible for " + klass.getName(), location);
            } catch (RuntimeException e) {
                throw new InvalidDefinitionException("Failed to instantiate " + klass.getName(), location, e);
            }
        } else {
            throw new InvalidDefinitionException("Provider must implement " + ThemeDescriptorProvider.class, location);
        }
    }

    @Override
    public DefDescriptor<ThemeDef> provide() throws QuickFixException {
        return provider.provide();
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<ThemeProviderDef> {
        protected Builder() {
            super(ThemeProviderDef.class);
        }

        private Class<?> klass;

        public Builder setProviderClass(Class<?> klass) {
            this.klass = klass;
            return this;
        }

        @Override
        public ThemeProviderDef build() throws QuickFixException {
            return new JavaThemeProviderDef(this);
        }
    }
}
