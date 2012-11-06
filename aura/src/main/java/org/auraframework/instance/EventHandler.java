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
package org.auraframework.instance;

import org.auraframework.def.EventHandlerDef;
import org.auraframework.expression.PropertyReference;

/**
 * An event handler instance, similar to an attribute, maps a registered event to a controller action at runtime
 *
 *
 *
 */
public interface EventHandler extends Instance<EventHandlerDef> {

    /**
     * @return The name of this handler
     */
    String getName();

    /**
     * @return The controller action bound to this handler
     */
    PropertyReference getActionExpression();

}
