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

package org.auraframework.util;

/**
 * Listens for changes to a file.  Similar interface to apache vfs2
 *
 */
public interface FileListener
{
    /**
     * Called when a file is created.
     * @param event The FileChangeEvent.
     * @throws Exception if an error occurs.
     */
    void fileCreated(FileChangeEvent event) throws Exception;

    /**
     * Called when a file is deleted.
     * @param event The FileChangeEvent.
     * @throws Exception if an error occurs.
     */
    void fileDeleted(FileChangeEvent event) throws Exception;

    /**
     * Called when a file is changed.<br />
     * @param event The FileChangeEvent.
     * @throws Exception if an error occurs.
     */
    void fileChanged(FileChangeEvent event) throws Exception;
}
