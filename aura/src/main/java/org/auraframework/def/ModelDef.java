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

import org.auraframework.instance.Model;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 */
public interface ModelDef extends Definition {
    @Override
    DefDescriptor<ModelDef> getDescriptor();

    /**
     * Get the member definition by name
     * 
     * @param name of the member to get
     * @return definition of the param
     */
    ValueDef getMemberByName(String name);

    /**
     * @return Does this model expose any data to serialize?
     */
    boolean hasMembers();

    /**
     * Create a new instance of this model.
     * 
     * @return an instance of this model type
     */
    Model newInstance();

    /**
     * Parses a formula reference and returns the type of the target
     * 
     * @param s the formula
     * @return the type, for now using a AuraType
     * @throws QuickFixException
     */
    TypeDef getType(String s) throws QuickFixException;

}
