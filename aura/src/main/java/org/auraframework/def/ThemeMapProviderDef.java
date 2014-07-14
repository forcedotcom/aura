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

import java.util.Map;

import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * Similar to {@link ThemeDescriptorProvider}, except this is for providing dynamic content of a theme via a map instead
 * of providing a particular theme descriptor.
 */
public interface ThemeMapProviderDef extends Definition {
    @Override
    DefDescriptor<ThemeMapProviderDef> getDescriptor();

    /**
     * Invokes the provide method on the associated map provider class.
     * 
     * @return The result from the associated class's provide method.
     */
    Map<String, String> provide() throws QuickFixException;
}
