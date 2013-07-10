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
package configuration;

import org.auraframework.adapter.ComponentLocationAdapter;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.adapter.LoggingAdapter;
import org.auraframework.adapter.RegistryAdapter;
import org.auraframework.impl.DefinitionServiceImplTest.AuraTestRegistryProviderWithNulls;
import org.auraframework.impl.adapter.MockConfigAdapterImpl;
import org.auraframework.impl.context.TestLoggingAdapterImpl;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.test.TestContextAdapter;
import org.auraframework.test.TestInventory;
import org.auraframework.test.adapter.TestContextAdapterImpl;
import org.auraframework.util.ServiceLoaderImpl.AuraConfiguration;
import org.auraframework.util.ServiceLoaderImpl.Impl;
import org.auraframework.util.ServiceLoaderImpl.PrimaryImpl;

/**
 */
@AuraConfiguration
public class AuraImplTestConfig {

    @Impl(name = "auraImplTestInventory")
    public static TestInventory auraImplTestInventory() throws Exception {
        return new TestInventory(AuraImplTestConfig.class);
    }

    @Impl(name = "auraImplTestComponentLocationAdapterImpl")
    public static ComponentLocationAdapter auraImplTestComponentLocationAdapterImpl() {
        return new ComponentLocationAdapter.Impl(AuraImplFiles.TestComponents.asFile(), null, "components_aura_impl");
    }

    @Impl
    @PrimaryImpl
    public static ConfigAdapter auraImplTestConfigAdapter() {
        return new MockConfigAdapterImpl();
    }

    @Impl
    @PrimaryImpl
    public static LoggingAdapter auraImplTestLoggingAdapter() {
        return new TestLoggingAdapterImpl();
    }

    @Impl
    public static RegistryAdapter auraImplTestRegistryAdapterWithNulls() {
        return new AuraTestRegistryProviderWithNulls();
    }

    @Impl
    public static TestContextAdapter auraImplTestContextAdapter() {
        return new TestContextAdapterImpl();
    }
}
