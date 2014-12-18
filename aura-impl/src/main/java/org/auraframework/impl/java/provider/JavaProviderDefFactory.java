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

import java.util.List;

import org.auraframework.def.JavaProviderDef;
import org.auraframework.impl.java.provider.AbstractJavaProviderDef.Builder;
import org.auraframework.system.SourceLoader;

/**
 */
public class JavaProviderDefFactory extends AbstractJavaProviderDefFactory<JavaProviderDef> {
    public JavaProviderDefFactory() {
        super();
    }

    public JavaProviderDefFactory(List<SourceLoader> sourceLoaders) {
        super(sourceLoaders);
    }

    @Override
    protected Builder<JavaProviderDef> newBuilder() {
        JavaProviderDefImpl.Builder builder = new JavaProviderDefImpl.Builder();
        return builder;
    }
}
