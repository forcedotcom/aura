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

import org.auraframework.def.Definition;
import org.auraframework.def.Provider;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

/**
 * Base class for java provider defs.
 */
abstract class AbstractJavaProviderDef<T extends Provider, D extends Definition> extends DefinitionImpl<D> {
    private static final long serialVersionUID = -8713728986587088353L;

    protected final T provider;

    public AbstractJavaProviderDef(Class<T> providerType, Builder<D> builder) throws QuickFixException {
        super(builder);

        Class<?> klass = builder.getProviderClass();
        if (providerType.isAssignableFrom(klass)) {
            try {
                provider = providerType.cast(klass.newInstance());
            } catch (InstantiationException ie) {
                throw new InvalidDefinitionException("Cannot instantiate " + klass.getName(), location);
            } catch (IllegalAccessException iae) {
                throw new InvalidDefinitionException("Constructor is inaccessible for " + klass.getName(), location);
            } catch (RuntimeException e) {
                throw new InvalidDefinitionException("Failed to instantiate " + klass.getName(), location, e);
            }
        } else {
            throw new InvalidDefinitionException("Provider must implement " + providerType, location);
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    static abstract class Builder<T extends Definition> extends DefinitionImpl.BuilderImpl<T> {
        private Class<?> providerClass;
        private boolean useAdapter;

        protected Builder(Class<T> defClass) {
            super(defClass);
        }

        public Builder<T> setProviderClass(Class<?> klass) {
            this.providerClass = klass;
            return this;
        }

        public Builder<T> setUseAdapter(boolean useAdapter) {
            this.useAdapter = useAdapter;
            return this;
        }

        public boolean isUseAdapter() {
            return useAdapter;
        }

        public Class<?> getProviderClass() {
            return providerClass;
        }
    }
}
