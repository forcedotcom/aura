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

/**
 * Interface for definitions that can have a Java or a JavaScript implementation.
 */
public interface RemotableDefinition extends Definition {

    /**
     * Get the source JavaScript for this component.
     * @return the source code. Null for Java definitions.
     */
    String getCode();

    /**
     * Return whether we have a Java or JavaScript definition.
     * @return true for local/Java definitions, false for remote/JavaScript.
     */
    boolean isLocal();
}
