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
package org.auraframework.builder;

import org.auraframework.def.DependencyDef;
import org.auraframework.expression.PropertyReference;

/**
 * Interface for builders that support client code.
 */
public interface JavascriptCodeBuilder {

   /**
     * Set the client JavaScript code, normally a client class.
     * @param code the client JavaScript code.
     */
    void setCode(String code);

    /**
     * Add a label (global value provider) found in the JavaScript code.
     * @param expressionRef Expression referencing the label.
     */
    void addExpressionRef(PropertyReference propRef);

    /**
     * Add a dependency (fully qualified names) found in the JavaScript code.
     * @param dependency The dependency.
     */
    void addDependency(DependencyDef dependency);
}
