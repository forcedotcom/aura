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
package org.auraframework.system;

import java.io.File;

/**
 * Information about a source directory containing bundle namespaces.
 */
public interface FileSourceLocation {
    /**
     * Gets the directory containing the namespace folders.
     */
    File getSourceDirectory();

    /**
     * Returns true if this source location contains components.
     */
    boolean isComponentSource();

    /**
     * Returns true if this source location contains modules.
     */
    boolean isModuleSource();
}