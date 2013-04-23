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
import org.auraframework.impl.source.StringSourceLoader;
import org.auraframework.test.TestInventory;
import org.auraframework.util.AuraFiles;
import org.auraframework.util.ServiceLoaderImpl.AuraConfiguration;
import org.auraframework.util.ServiceLoaderImpl.Impl;

/**
 */
@AuraConfiguration
public class AuraTestConfig {

    @Impl(name = "auraTestInventory")
    public static TestInventory auraTestInventory() throws Exception {
        return new TestInventory(AuraTestConfig.class);
    }

    @Impl
    public static ComponentLocationAdapter auraTestComponentLocationAdapterImpl() {
        return new ComponentLocationAdapter.Impl(AuraFiles.TestComponents.asFile(), null, "components_aura");
    }

    @Impl
    public static ComponentLocationAdapter auraTestStringSourceAdapterImpl() {
        return new ComponentLocationAdapter.Impl(StringSourceLoader.getInstance());
    }
}
