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
package org.auraframework.modules.impl.source;

import org.auraframework.adapter.ComponentLocationAdapter;
import org.auraframework.annotations.Annotations.ServiceComponent;
import org.springframework.context.annotation.Lazy;

/**
 * Provides location of Aura components for aura-modules
 */
@Lazy
@ServiceComponent
public class AuraModulesComponentsLocationAdapter extends ComponentLocationAdapter.Impl {
    public AuraModulesComponentsLocationAdapter() {
        super(AuraModulesFiles.COMPONENTS_DIR.asFile(), null, "components_aura_modules");
    }
}
