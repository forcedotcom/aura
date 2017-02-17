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

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.TokenMapProviderDef;
import org.auraframework.impl.DefinitionAccessImpl;
import org.auraframework.impl.java.JavaSourceImpl;
import org.auraframework.system.Annotations.Provider;
import org.auraframework.system.AuraContext;
import org.auraframework.system.DefinitionFactory;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Factory for token map provider classes.
 */
@ServiceComponent
public final class JavaTokenMapProviderDefFactory
        implements DefinitionFactory<JavaSourceImpl<TokenMapProviderDef>, TokenMapProviderDef> {

    @Override
    public TokenMapProviderDef getDefinition(DefDescriptor<TokenMapProviderDef> descriptor, 
            JavaSourceImpl<TokenMapProviderDef> source) throws QuickFixException {
        Class<?> providerClass = source.getJavaClass();
        JavaTokenMapProviderDef.Builder builder = new JavaTokenMapProviderDef.Builder();

        builder.setDescriptor(descriptor);
        builder.setLocation(providerClass.getCanonicalName(), 0);
        builder.setProviderClass(providerClass);
        builder.setAccess(new DefinitionAccessImpl(AuraContext.Access.PUBLIC));
        Provider ann = source.findAnnotation(Provider.class);
        if (ann == null) {
            throw new InvalidDefinitionException(String.format(
                    "@Provider annotation is required on all Providers.  Not found on %s", descriptor),
                    builder.getLocation());
        }
        return builder.build();
    }

    @Override
    public Class<?> getSourceInterface() {
        return JavaSourceImpl.class;
    }

    @Override
    public Class<TokenMapProviderDef> getDefinitionClass() {
        return TokenMapProviderDef.class;
    }

    @Override
    public String getMimeType() {
        return JavaSourceImpl.JAVA_MIME_TYPE;
    }
}
