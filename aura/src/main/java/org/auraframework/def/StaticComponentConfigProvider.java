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

import org.auraframework.builder.ComponentDefRefBuilder;
import org.auraframework.instance.ComponentConfig;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * An interface for a component config provider.
 * 
 * This provider provides a component config (based on a
 * ComponentDefRefBuilder), which means that it can set both the descriptor and
 * attributes.
 * 
 * Note that this interface is instantiated as a singleton, no state should be
 * held on the class. It also needs to have a no-arg constructor.
 * 
 * 
 * @since 0.0.226
 */
public interface StaticComponentConfigProvider extends Provider {
    /**
     * Populate and return a ComponentConfig.
     */
    public ComponentConfig provide(ComponentDefRefBuilder ref) throws QuickFixException;
}
