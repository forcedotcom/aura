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
package configuration;


import org.auraframework.adapter.ExpressionAdapter;
import org.auraframework.adapter.JsonSerializerAdapter;
import org.auraframework.impl.expression.ExpressionAdapterImpl;
import org.auraframework.impl.expression.adapter.ExpressionJsonSerializerAdapterImpl;
import org.auraframework.util.ServiceLoaderImpl.Impl;
import org.auraframework.util.ServiceLoaderImpl.AuraConfiguration;

/**
 * config for expression module, provides an expression adapter
 */
@AuraConfiguration
public class AuraImplExpressionConfig {

    @Impl
    public static ExpressionAdapter auraImplExpressionExpressionAdapter() {
        return new ExpressionAdapterImpl();
    }

    @Impl
    public static JsonSerializerAdapter auraImplExpressionJsonSerializationAdapter() {
        return new ExpressionJsonSerializerAdapterImpl();
    }
}
