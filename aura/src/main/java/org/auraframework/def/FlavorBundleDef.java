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
package org.auraframework.def;

import org.auraframework.service.DefinitionService;

/**
 * Currently a marker interface (actual files/resources of this type won't exist), representing the "main" definition of
 * bundles containing custom {@link FlavoredStyleDef}s.
 * <p>
 * This marker interface is needed because a proper DefType/Definition is required for the bundle param in
 * {@link DefinitionService#getDefDescriptor(String, Class, DefDescriptor)}) and similar methods.
 */
public interface FlavorBundleDef extends RootDefinition {
    @Override
    DefDescriptor<FlavorBundleDef> getDescriptor();
}
