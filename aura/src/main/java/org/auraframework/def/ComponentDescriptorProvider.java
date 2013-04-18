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
 * An interface for a component descriptor provider.
 * 
 * This is the simple default case of providing a descriptor for a component. In
 * this case no attributes can be specified.
 * 
 * Note that this interface is instantiated as a singleton. It should not have
 * any state data. It also needs to have a no-arg constructor.
 * 
 * 
 * @since 0.0.184
 */
public interface ComponentDescriptorProvider extends Provider {
    /**
     * Return a component descriptor.
     */
    public DefDescriptor<ComponentDef> provide() throws QuickFixException;
}
