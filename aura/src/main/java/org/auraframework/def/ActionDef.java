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
package org.auraframework.def;

import java.util.List;


/**
 * Interface for actions, with params, types, and return type
 */
public interface ActionDef extends Definition {

    @Override
    DefDescriptor<ActionDef> getDescriptor();

    /**
     * Actions can be server side or client side. If they are client side the server just sends the code down
     * and remains oblivious as to how they are run
     */
    public enum ActionType {
        CLIENT,
        SERVER;
    }

    /**
     * @return type of this action
     */
    ActionType getActionType();

    /**
     * The name of this action is the unique identifier the component can use to call this action
     *
     * @return the name of this action
     */
    @Override
    String getName();

    /**
     * Basic type system stuff
     *
     * @return the type this action returns
     */
    DefDescriptor<TypeDef> getReturnType();

    /**
     * Get all the parameters for this action. They are returned in the order they are defined but
     * because the names are provided some contexts can provide args in any order and match up the params
     *
     * @return ordered list of parameters
     */
    List<ValueDef> getParameters();
}
