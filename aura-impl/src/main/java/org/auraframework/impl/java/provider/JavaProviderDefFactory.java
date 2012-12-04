/*
 * Copyright (C) 2012 salesforce.com, inc.
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

import java.util.List;

import org.auraframework.builder.DefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ProviderDef;
import org.auraframework.impl.java.BaseJavaDefFactory;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.system.*;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 */
public class JavaProviderDefFactory extends BaseJavaDefFactory<ProviderDef>{
    public JavaProviderDefFactory(List<SourceLoader> sourceLoaders) {
        super(sourceLoaders);
    }

    @Override
    protected DefBuilder<?, ? extends ProviderDef> getBuilder(DefDescriptor<ProviderDef> descriptor)
            throws QuickFixException {
        JavaProviderDef.Builder builder;
        Class<?> providerClass = getClazz(descriptor);

        if (providerClass == null) {
            return null;
        }
        if (!providerClass.isAnnotationPresent(Provider.class)) {
            throw new InvalidDefinitionException(String.format("@Provider annotation is required on all Providers.  Not found on %s", descriptor), new Location(providerClass.getCanonicalName(), 0));
        }

        builder = new JavaProviderDef.Builder();
        builder.setDescriptor(descriptor);
        builder.setLocation(providerClass.getCanonicalName(), 0);
        builder.setProviderClass(providerClass);
        return builder;
    }
}
