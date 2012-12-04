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
package org.auraframework.impl.java.securityProvider;

import java.util.List;

import org.auraframework.builder.DefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.SecurityProviderDef;
import org.auraframework.impl.java.BaseJavaDefFactory;
import org.auraframework.system.DefFactory;
import org.auraframework.system.SourceLoader;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * A {@link DefFactory} for java security providers.
 *
 * @since 0.0.172
 */
public class JavaSecurityProviderDefFactory extends BaseJavaDefFactory<SecurityProviderDef> {

    public JavaSecurityProviderDefFactory(List<SourceLoader> sourceLoaders) {
        super(sourceLoaders);
    }

    @Override
    protected DefBuilder<?, ? extends SecurityProviderDef> getBuilder(DefDescriptor<SecurityProviderDef> descriptor) throws QuickFixException {
        JavaSecurityProviderDef.Builder builder = new JavaSecurityProviderDef.Builder();
        builder.setDescriptor(descriptor);

        Class<?> securityProviderClass = getClazz(descriptor);

        if (securityProviderClass == null) {
            return null;
        }
        builder.setLocation(securityProviderClass.getCanonicalName(), -1);
        builder.setLocation(securityProviderClass.getCanonicalName(), -1);
        builder.setSecurityProviderClass(securityProviderClass);
        return builder;
    }
}
