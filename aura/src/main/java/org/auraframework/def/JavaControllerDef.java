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
 * A definition for a Java Controller.
 *
 * Java Controllers are server side controllers written in java. They must be annotated
 * with the {@link Controller} annotation.
 *
 * <ul>
 * <li>Static Controllers:<br />
 *
 * Static controllers are never instantiated, and all methods that are annotated with {@link AuraEnabled}
 * must be static methods. There is no reason to ever have instance methods, and there can be no state stored
 * on the controller.
 *
 * <li>Bean Controllers:<br />
 * Bean controllers are annotated with {@link Controller} with bean = true. These controllers must have only
 * instance methods (non-static). They can be instantiated once per context (request), and can assume that
 * multiple actions within a single context (e.g. chained actions) will be executed on the same instance. They
 * cannot assume anything about what other actions might have been executed in the same instance (i.e. multiple
 * actions in the same XHR request will be run on the same bean, but if they get split, they will not). If
 * this is not desired, use a static controller where no state is allowed.
 * </ul>
 *
 * Note that any methods not annotated with {@link AuraEnabled} are simply ignored.
 */
public interface JavaControllerDef extends ControllerDef {
    /**
     * Get the class for the controller.
     */
    public Class<?> getJavaType();
}
