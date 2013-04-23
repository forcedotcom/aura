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

import org.auraframework.def.ComponentDef;
import org.auraframework.def.ComponentDescriptorProvider;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.Annotations.Provider;

/**
 * A simple provider to ensure concrete instantiation.
 * 
 * This provider is part of the test to ensure that concrete components always
 * intantiate as such. It always provides 'provider:providerB' to allow us to
 * test 'provider:providerA' instantiating.
 */
@Provider
public class TestBaseProvider implements ComponentDescriptorProvider {
    @Override
    public DefDescriptor<ComponentDef> provide() {
        return DefDescriptorImpl.getInstance("provider:providerB", ComponentDef.class);
    }
}
