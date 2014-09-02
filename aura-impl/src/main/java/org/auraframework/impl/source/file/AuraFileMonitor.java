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

import java.io.IOException;
import java.nio.file.FileSystems;
import java.nio.file.WatchService;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.nio.file.*;

import static java.nio.file.StandardWatchEventKinds.*;
import static java.nio.file.LinkOption.*;

import java.nio.file.attribute.*;

import org.apache.log4j.Logger;
import org.auraframework.util.FileChangeEvent;
import org.auraframework.util.FileListener;


/**
 * File monitor allowing to ability to add watched directory. Used to update files and clear caches on source
 * changes during development
 */
public final class AuraFileMonitor implements Runnable{

    private final static Logger LOG;
    private static AuraFileMonitor singletonMonitor;

    
    // keep track of directories monitored
    private final Set<String> monitoredDirs; 
    
    // keep track of watch service keys for directories monitored,
    // for the purpose of reporting with the same directory root as the original 
    private final Map<WatchKey,Path> monitoredKeys; 

    private  WatchService watchService;
    private  Thread watchServiceThread;
    private boolean terminateThread;
    private final FileListener listener;
    
    static {
        LOG = Logger.getLogger(AuraFileMonitor.class);
        singletonMonitor = new AuraFileMonitor(new FileSourceListener());
    }

    
    private AuraFileMonitor(FileListener listener) 
    {
        this.listener = listener;
        this.monitoredDirs = new HashSet<>();
        this.monitoredKeys = new HashMap<>();
        this.setTerminateThread(false);
        try {
            watchService = FileSystems.getDefault().newWatchService();
        } catch (IOException e) {
            LOG.error("Could not create aura WatchService.  File changes will not be noticed");
        }
        
    }
    
    @SuppressWarnings("unchecked")
    static <T> WatchEvent<T> cast(WatchEvent<?> event) {
        return (WatchEvent<T>)event;
    }
    
    /**
     * Register a single directory with the WatchService
     */
    private void register(Path dir) throws IOException {
        WatchKey key = dir.register(watchService, ENTRY_CREATE, ENTRY_DELETE, ENTRY_MODIFY);
        monitoredKeys.put(key, dir);
        monitoredDirs.add(dir.toString());
        // uncomment to see every directory, rather than parent directories only.
        // LOG.info("Monitoring individual directory " + dir.toString());
    }
 
    /**
     * Register the given directory, and all its sub-directories, with the
     * WatchService.
     */
    private void registerAll(final Path start) throws IOException {
        // register directory and sub-directories
        Files.walkFileTree(start, new SimpleFileVisitor<Path>() {
            @Override
            public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs)
                throws IOException
            {
                register(dir);
                return FileVisitResult.CONTINUE;
            }
        });
    }
    
    @Override
    public void run() {
        // loop forever, waiting on monitor for watchService, unless isTerminateThread
        for (;;) {
 
            // wait for watchService to become signaled
            WatchKey key;
            try {
                key = watchService.take();
                if (isTerminateThread()) {
                    return;
                }
            } catch (InterruptedException x) {
                return;
            }
 
            Path dir = monitoredKeys.get(key);
            if (dir == null) {
                LOG.info("did not recognize the requested WatchKey!");
                continue;
            }
            
            List<WatchEvent<?>> events = key.pollEvents();
            // process all events on the key
            for (WatchEvent<?> event: events) {
                WatchEvent.Kind<?> kind = event.kind();
 
                if (kind == OVERFLOW) {
                    // TODO - perhaps notify a special event to clear all caches, 
                    // if file changes overflow the monitor
                    LOG.info("WatchService for aura file changes has overflowed.  Changes may have been missed.");
                    continue;
                }
 
                // once we have a directory event, we know the context is the file name of entry
                WatchEvent<Path> pathWatchEvent = cast(event);
                Path name = pathWatchEvent.context();
                
                // ensure the path resolution (absolute, relative) matches between paths
                Path child = dir.resolve(name);

                // isDir is true is file exists and is directory
                boolean isDir = Files.isDirectory(child, NOFOLLOW_LINKS);
 
                // signal appropriate handlers
                if (!isDir) {
                    try {
                        if (kind == ENTRY_CREATE) {
                            listener.fileCreated(new FileChangeEvent(child));
                        }
                        else if (kind == ENTRY_MODIFY) {
                            listener.fileChanged(new FileChangeEvent(child));
                        }
                        else if (kind == ENTRY_DELETE) {
                            listener.fileDeleted(new FileChangeEvent(child));
                        }
                    }
                    catch (Exception ex) {
                        LOG.info("Unable to signal source change due to exception: " + ex.getMessage());
                    }
                }
                // recursively add any new directories created
                else if (kind == ENTRY_CREATE) {
                    try {
                            registerAll(child);
                    } catch (IOException x) {
                        // if we can't monitor it for some reason, it is not an error
                    }
                }
            }
 
            // reset key and remove from set if directory no longer accessible
            boolean valid = key.reset();
            if (!valid) {
                monitoredKeys.remove(key);
                monitoredDirs.remove(dir.toString());
 
                // all directories are inaccessible
                if (monitoredKeys.isEmpty()) {
                    break;
                }
            }
        }
    }

    private boolean isStarted() { return watchService != null && watchServiceThread != null && watchServiceThread.isAlive() && !isTerminateThread(); }

    
    /**
     * Add a root directory to monitor for changes Synchronized due to updating single static monitor. This should be
     * called rarely (only on encountering a new namespace) and have no performance impact
     *
     * @param dirPath name of a root directory to monitor
     */
    public static synchronized void addDirectory(String dirPath) {
        Path dir = Paths.get(dirPath);
        if (singletonMonitor == null || 
            singletonMonitor.watchService == null || 
            singletonMonitor.monitoredDirs.contains(dir.toString())) {
            return;
        }

        try {
            singletonMonitor.registerAll(dir);
            LOG.info("Monitoring directory " + dirPath);
        } catch (Exception ex) {
            // eat error - monitoring simply won't happen for requested dir, but should never occur
        }
    }

    /**
     * Start monitor when aura services are ready
     */
    public static synchronized void start() {
        if (singletonMonitor != null && !singletonMonitor.isStarted()) {
            singletonMonitor.setTerminateThread(false);
            singletonMonitor.watchServiceThread = new Thread(singletonMonitor);
            singletonMonitor.watchServiceThread.setDaemon(true);
            singletonMonitor.watchServiceThread.start();
            LOG.info("Aura file monitor started");
        }
    }

    /**
     * Stop monitor
     */
    public static synchronized void stop() {
        if (singletonMonitor != null && singletonMonitor.isStarted()) {
            
            // notify thread to exit main loop, ending thread naturally
            singletonMonitor.setTerminateThread(true);
            singletonMonitor.watchService.notifyAll(); 

            singletonMonitor.watchServiceThread = null;
            LOG.info("Aura file monitor signaled to stop");
        }
    }

    private boolean isTerminateThread() {
        return terminateThread;
    }

    private void setTerminateThread(boolean terminateThread) {
        this.terminateThread = terminateThread;
    }
 
}
