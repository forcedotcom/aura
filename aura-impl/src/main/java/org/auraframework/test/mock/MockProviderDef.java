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
package org.auraframework.test.mock;

import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.def.DefDescriptor;
import org.auraframework.def.ProviderDef;
import org.auraframework.def.RootDefinition;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * A simple ProviderDef.
 */
public class MockProviderDef extends MockDefinition<ProviderDef> implements ProviderDef {
	private static final long serialVersionUID = -8841310282805891659L;
	private final ComponentConfig config;

    public MockProviderDef(DefDescriptor<ProviderDef> descriptor, ComponentConfig componentConfig) {
        super(descriptor);
        this.config = componentConfig;
    }

    /**
     * Simpler point to mock. Called by provide methods.
     * 
     * @return the ComponentConfig provided by this Provider.
     */
    public ComponentConfig provide() {
        return config;
    }

    @Override
    public ComponentConfig provide(DefDescriptor<? extends RootDefinition> intfDescriptor) throws QuickFixException {
        return provide();
    }

    @Override
    public ComponentConfig provide(ComponentDefRefBuilder ref) throws QuickFixException {
        return provide();
    }

    @Override
    public boolean isLocal() {
        return true;
    }

    @Override
    public boolean supportsRefProvide() {
        return true;
    }
}
