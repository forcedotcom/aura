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
package org.auraframework.impl.instance;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.annotations.Annotations.ServiceComponentProvider;
import org.auraframework.def.TokenMapProvider;
import org.auraframework.def.TokenMapProviderDef;
import org.auraframework.impl.java.provider.JavaTokenMapProviderDef;
import org.auraframework.impl.java.provider.TokenMapProviderInstance;
import org.auraframework.instance.InstanceBuilder;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.springframework.context.ApplicationContext;

import javax.inject.Inject;
import java.util.Map;

/**
 * Instance builder for Token Map Provider. Retrieves bean or creates new instance.
 */
@ServiceComponent
public class TokenMapProviderInstanceBuilder implements InstanceBuilder<TokenMapProviderInstance, TokenMapProviderDef> {

    @Inject
    private ApplicationContext applicationContext;

    @Override
    public Class<?> getDefinitionClass() {
        return JavaTokenMapProviderDef.class;
    }

    @Override
    public TokenMapProviderInstance getInstance(TokenMapProviderDef tokenDef, Map<String, Object> attributes) throws QuickFixException {
        Class<?> providerClass = tokenDef.getProviderClass();
        Class<?> providerType = tokenDef.getProviderType();
        Object instance;

        if (providerType.isAssignableFrom(providerClass)) {
            boolean isServiceComponentProvider = providerClass.getAnnotation(ServiceComponentProvider.class) != null;
            if (isServiceComponentProvider) {
                instance = applicationContext.getBean(providerClass);
            } else {
                try {
                    instance = providerClass.newInstance();
                } catch (InstantiationException ie) {
                    throw new InvalidDefinitionException("Cannot instantiate " + providerClass, tokenDef.getLocation());
                } catch (IllegalAccessException iae) {
                    throw new InvalidDefinitionException("Constructor is inaccessible for " + providerClass, tokenDef.getLocation());
                } catch (RuntimeException e) {
                    throw new InvalidDefinitionException("Failed to instantiate " + providerClass, tokenDef.getLocation(), e);
                }
            }
        } else {
            throw new InvalidDefinitionException(providerClass + " must implement " + providerType,
                    tokenDef.getLocation());
        }

        return new TokenMapProviderInstance(tokenDef, (TokenMapProvider) instance);
    }
}
