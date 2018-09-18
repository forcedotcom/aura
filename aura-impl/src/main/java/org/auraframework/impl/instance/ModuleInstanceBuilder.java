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
import org.auraframework.def.module.ModuleDef;
import org.auraframework.impl.root.component.ModuleDefImpl;
import org.auraframework.impl.root.component.ModuleImpl;
import org.auraframework.instance.InstanceBuilder;
import org.auraframework.instance.Module;
import org.auraframework.throwable.quickfix.QuickFixException;

import java.util.Map;

/**
 * ModuleImpl instance builder
 */
@ServiceComponent
public class ModuleInstanceBuilder implements InstanceBuilder<Module, ModuleDef> {
    @Override
    public Class<?> getDefinitionClass() {
        return ModuleDefImpl.class;
    }

    @Override
    public Module getInstance(ModuleDef def, Map<String, Object> attributes) throws QuickFixException {
        return new ModuleImpl(def.getDescriptor(), attributes);
    }
}
