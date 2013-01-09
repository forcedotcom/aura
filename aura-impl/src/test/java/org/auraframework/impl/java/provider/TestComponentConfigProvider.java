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

import org.auraframework.def.ComponentConfigProvider;
import org.auraframework.def.ComponentDef;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.system.Annotations.Provider;

/**
 * An interface provider used for testing.
 */
@Provider
public class TestComponentConfigProvider implements ComponentConfigProvider {
    @Override
    public ComponentConfig provide() {
        ComponentConfig config = new ComponentConfig();

        config.setDescriptor(DefDescriptorImpl.getInstance("test:test_Preload_Interface_Impl", ComponentDef.class));
        return config;
    }
}
