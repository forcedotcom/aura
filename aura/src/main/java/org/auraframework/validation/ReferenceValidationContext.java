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
package org.auraframework.validation;

import org.auraframework.def.DefDescriptor;
import org.auraframework.def.Definition;

public interface ReferenceValidationContext extends ErrorAccumulator {
    /**
     * Get a definition that is accessible to this validation.
     *
     * This should be used to get any definition that is needed by definition during
     * validation. If the definition is not in the set, it was not included in appendDependencies
     * which is a bug in the code.
     *
     * @param descriptor the descriptor for the definition that we want.
     * @return the definition, or null if there is none.
     */
    <T extends Definition> T getAccessibleDefinition(DefDescriptor<T> descriptor);
}
