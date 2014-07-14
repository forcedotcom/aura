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

import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Similar to {@link ProviderDef}, except that this is only used to invoke {@link ThemeDef} providers. The reason a
 * separate class hierarchy is created for theme providers is because, as of this writing, the other Provider classes
 * are too closely tied to the nuances of providing components.
 */
public interface ThemeDescriptorProviderDef extends Definition {
    @Override
    DefDescriptor<ThemeDescriptorProviderDef> getDescriptor();

    /**
     * Invokes the provide method on the associated provider class.
     * 
     * @return The result from the associated class's provide method.
     */
    DefDescriptor<ThemeDef> provide() throws QuickFixException;
}
