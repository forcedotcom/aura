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
package org.auraframework.impl.java.securityProvider;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.SecurityProvider;
import org.auraframework.def.SecurityProviderDef;
import org.auraframework.impl.system.DefinitionImpl;
import org.auraframework.impl.util.AuraUtil;
import org.auraframework.service.LoggingService;
import org.auraframework.system.Annotations;
import org.auraframework.system.Location;
import org.auraframework.throwable.AuraExecutionException;
import org.auraframework.throwable.NoAccessException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;
import org.auraframework.util.json.Json;

public class JavaSecurityProviderDef extends DefinitionImpl<SecurityProviderDef> implements SecurityProviderDef {
    private static final long serialVersionUID = -372148094339951062L;
    private final SecurityProvider securityProvider;

    protected JavaSecurityProviderDef(Builder builder) {
        super(builder);
        this.securityProvider = builder.securityProvider;
    }

    @Override
    public boolean isAllowed(DefDescriptor<?> toCheck) {
        LoggingService loggingService = Aura.getLoggingService();
        loggingService.stopTimer(LoggingService.TIMER_AURA);
        loggingService.startTimer("java");
        boolean ret = false;
        try {
            ret = securityProvider.isAllowed(toCheck);
            loggingService.incrementNum("JavaCallCount");
        } catch (Exception e) {
            throw new NoAccessException("Access Denied", e);
        } finally {
            loggingService.stopTimer("java");
            loggingService.startTimer(LoggingService.TIMER_AURA);
        }
        return ret;
    }

    @Override
    public void serialize(Json json) throws IOException {
    }

    private static class MethodSecurityProvider implements SecurityProvider {
        private final Method method;
        private final Location location;

        public MethodSecurityProvider(Method method, Location location) {
            this.method = method;
            this.location = location;
        }

        @Override
        public boolean isAllowed(DefDescriptor<?> descriptor) {
            Boolean value;
            try {
                value = (Boolean) method.invoke(null, new Object[] { descriptor });
            } catch (InvocationTargetException e) {
                throw new AuraExecutionException(e.getCause(), this.location);
            } catch (Exception e) {
                throw new AuraExecutionException(e, this.location);
            }
            return (value == null) ? false : value.booleanValue();
        }
    }

    public static class Builder extends DefinitionImpl.BuilderImpl<SecurityProviderDef> {
        public Builder() {
            super(SecurityProviderDef.class);
        }

        private SecurityProvider securityProvider;

        public Builder setSecurityProviderClass(Class<?> clazz) throws QuickFixException {
            List<Class<? extends SecurityProvider>> ifcs;

            ifcs = AuraUtil.findInterfaces(clazz, SecurityProvider.class);
            if (ifcs.size() > 0) {
                try {
                    this.securityProvider = (SecurityProvider) clazz.newInstance();
                } catch (InstantiationException ie) {
                    throw new InvalidDefinitionException("Cannot instantiate " + clazz.getName(), getLocation());
                } catch (IllegalAccessException iae) {
                    throw new InvalidDefinitionException("Constructor is inaccessible for " + clazz.getName(),
                            getLocation());
                }
            } else {
                try {
                    Method isAllowed = null;
                    isAllowed = clazz.getMethod("isAllowed", DefDescriptor.class);
                    if (Modifier.isStatic(isAllowed.getModifiers())) {
                        Class<?> retType = isAllowed.getReturnType();
                        if ((retType.equals(boolean.class) || retType.equals(Boolean.class))
                                && clazz.isAnnotationPresent(Annotations.SecurityProvider.class)) {
                            this.securityProvider = new MethodSecurityProvider(isAllowed, getLocation());
                        }
                    }
                } catch (NoSuchMethodException e) {
                }
                if (this.securityProvider == null) {
                    throw new InvalidDefinitionException(
                            "SecurityProviders must implement the SecurityProvider interface", getLocation());
                }
            }
            return this;
        }

        @Override
        public JavaSecurityProviderDef build() {
            return new JavaSecurityProviderDef(this);
        }
    }
}
