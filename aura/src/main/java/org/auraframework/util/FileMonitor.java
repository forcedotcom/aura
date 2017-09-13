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

import org.auraframework.system.SourceListener;

/**
 * File monitor allowing to ability to add watched directory. Used to update files and clear caches on source changes
 * during development
 */
public interface FileMonitor extends SourceListener {
    /**
     * Add a root directory to monitor for changes Synchronized due to updating single static monitor. This should be
     * called rarely (only on encountering a new namespace) and have no performance impact
     *
     * @param dirPath name of a root directory to monitor
     */
    void addDirectory(String dirPath, Long registryCreationTime);

    /**
     * Start monitor when aura services are ready
     */
    void start();

    /**
     * Stop monitor
     */
    void stop();

    /**
     * Register interest in real-time changes to source, if available
     *
     * @param listener - which listener to register
     */
    void subscribeToChangeNotification(SourceListener listener);

    /**
     * Unregister interest in real-time changes to source
     *
     * @param listener - which listener to unregister
     */
    void unsubscribeToChangeNotification(SourceListener listener);
}
