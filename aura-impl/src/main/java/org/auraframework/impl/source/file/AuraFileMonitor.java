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
package org.auraframework.impl.source.file;

import java.util.HashSet;
import java.util.Set;

import org.apache.commons.vfs2.FileObject;
import org.apache.commons.vfs2.FileSystemException;
import org.apache.commons.vfs2.FileSystemManager;
import org.apache.commons.vfs2.VFS;
import org.apache.commons.vfs2.impl.DefaultFileMonitor;
import org.apache.log4j.Logger;

/**
 * File monitor allowing to ability to add watched directory. Used to update files and clear caches on source
 * changes during development
 */
public final class AuraFileMonitor {

    private static final Logger LOG = Logger.getLogger(AuraFileMonitor.class);
    private static final Set<String> monitoredDirs = new HashSet<String>();

    private static FileSystemManager fileMonitorManager;
    private static DefaultFileMonitor fileMonitor;
    private static boolean started = false;

    static {
        try {
            fileMonitorManager = VFS.getManager();
            fileMonitor = new DefaultFileMonitor(new FileSourceListener());
        } catch (FileSystemException e) {
            fileMonitorManager = null;
            fileMonitor = null;
        }
    }

    // static
    private AuraFileMonitor() {}

    /**
     * Add a root directory to monitor for changes Synchronized due to updating single static monitor. This should be
     * called rarely (only on encountering a new namespace) and have no performance impact
     *
     * @param dirPath name of a root directory to monitor
     */
    public static synchronized void addDirectory(String dirPath) {
        if (fileMonitorManager == null || fileMonitor == null || monitoredDirs.contains(dirPath)) return;
        try {
            monitoredDirs.add(dirPath);
            FileObject listenDir = fileMonitorManager.resolveFile(dirPath);
            fileMonitor.setRecursive(true);
            fileMonitor.addFile(listenDir);
            LOG.info("Monitoring directory " + dirPath);
        } catch (Exception ex) {
            // eat error - monitoring simply won't happen for requested dir, but should never occur
        }
    }

    /**
     * Start monitor when aura services are ready
     */
    public static synchronized void start() {
        if (fileMonitorManager != null && fileMonitor != null && !started) {
            fileMonitor.start();
            fileMonitor.setDelay(50);
            started = true;
            LOG.info("Aura file monitor started");
        }
    }

    /**
     * Stop monitor
     */
    public static synchronized void stop() {
        if (fileMonitorManager != null && fileMonitor != null && started) {
            fileMonitor.stop();
            started = false;
            LOG.info("Aura file monitor stopped");
        }
    }

}
