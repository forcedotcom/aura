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

import org.apache.log4j.Logger;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.CachingServiceImpl;
import org.auraframework.service.CachingService;
import org.auraframework.system.SourceListener;
import org.auraframework.util.FileChangeEvent;
import org.auraframework.util.FileListener;
import org.auraframework.util.FileMonitor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

import javax.inject.Inject;
import java.io.IOException;
import java.lang.ref.WeakReference;
import java.nio.file.FileSystems;
import java.nio.file.FileVisitOption;
import java.nio.file.FileVisitResult;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.SimpleFileVisitor;
import java.nio.file.WatchEvent;
import java.nio.file.WatchKey;
import java.nio.file.WatchService;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentLinkedQueue;

import static java.nio.file.LinkOption.NOFOLLOW_LINKS;
import static java.nio.file.StandardWatchEventKinds.ENTRY_CREATE;
import static java.nio.file.StandardWatchEventKinds.ENTRY_DELETE;
import static java.nio.file.StandardWatchEventKinds.ENTRY_MODIFY;
import static java.nio.file.StandardWatchEventKinds.OVERFLOW;

/**
 * File monitor allowing to ability to add watched directory. Used to update files and clear caches on source changes
 * during development
 */
public final class FileMonitorImpl implements FileMonitor, Runnable {
    private final static Logger LOG = Logger.getLogger(FileMonitorImpl.class);

    @Configuration
    public static class BeanConfiguration {
        private static final FileMonitorImpl INSTANCE;
        
        static {
            synchronized (BeanConfiguration.class) {
                INSTANCE = new FileMonitorImpl();
                INSTANCE.start();
                
                //force side effects.
                new CachingServiceImpl.BeanConfiguration();
            }
        }
        
        @Lazy
        @Bean
        public FileMonitor fileMonitorImpl() {
            return INSTANCE;
        }
    }
    
    @Inject
    private CachingService cachingService;

    private final ConcurrentLinkedQueue<WeakReference<SourceListener>> listeners = new ConcurrentLinkedQueue<>();

    // keep track of directories monitored
    private final Set<String> monitoredDirs;

    // keep track of watch service keys for directories monitored,
    // for the purpose of reporting with the same directory root as the original
    private final Map<WatchKey, Path> monitoredKeys;

    private WatchService watchService;
    private Thread watchServiceThread;
    private boolean terminateThread;
    private final FileListener listener;

    public FileMonitorImpl() {
        this(null);
    }

    private FileMonitorImpl(FileListener listener)
    {
        if (listener == null) {
            listener = new FileSourceListener(this);
        }
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
        return (WatchEvent<T>) event;
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
     * Register the given directory, and all its sub-directories, with the WatchService.
     */
    private void registerAll(final Path start) throws IOException {
        // register directory and sub-directories
        // follow links: the uitier workspace component folders are symbolic links to the core workspace component folders
        Files.walkFileTree(start, EnumSet.of(FileVisitOption.FOLLOW_LINKS),
                Integer.MAX_VALUE, new SimpleFileVisitor<Path>() {
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
            for (WatchEvent<?> event : events) {
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
                    } catch (Exception ex) {
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

    private boolean isStarted() {
        return watchService != null && watchServiceThread != null && watchServiceThread.isAlive()
                && !isTerminateThread();
    }

    /**
     * Add a root directory to monitor for changes Synchronized due to updating single static monitor. This should be
     * called rarely (only on encountering a new namespace) and have no performance impact
     * 
     * @param dirPath name of a root directory to monitor
     */
    @Override
    public synchronized void addDirectory(String dirPath) {
        Path dir = Paths.get(dirPath);
        if (watchService == null || monitoredDirs.contains(dir.toString())) {
            return;
        }

        try {
            registerAll(dir);
            LOG.info("Monitoring directory " + dirPath);
        } catch (Exception ex) {
            LOG.info("Unable to monitor directory " + dirPath + " due to exception: " + ex.getMessage());
        }
    }

    /**
     * Start monitor when aura services are ready
     */
    @Override
    public synchronized void start() {
        if (!isStarted()) {
            setTerminateThread(false);
            watchServiceThread = new Thread(this);
            watchServiceThread.setDaemon(true);
            watchServiceThread.start();
            LOG.info("Aura file monitor started");
        }
    }

    /**
     * Stop monitor
     */
    @Override
    public synchronized void stop() {
        if (isStarted()) {
            // notify thread to exit main loop, ending thread naturally
            setTerminateThread(true);
            watchService.notifyAll();
            watchServiceThread = null;
            LOG.info("Aura file monitor signaled to stop");
        }
    }

    private boolean isTerminateThread() {
        return terminateThread;
    }

    private void setTerminateThread(boolean terminateThread) {
        this.terminateThread = terminateThread;
    }

    @Override
    public void onSourceChanged(SourceListener.SourceMonitorEvent event, String filePath) {
        for (WeakReference<SourceListener> i : listeners) {
            if (i.get() == null) {
                listeners.remove(i);
            }
        }
        cachingService.notifyDependentSourceChange(listeners, event, filePath);
    }

    @Override
    public void subscribeToChangeNotification(SourceListener listener) {
        listeners.add(new WeakReference<>(listener));
    }

    @Override
    public void unsubscribeToChangeNotification(SourceListener listener) {
        for (WeakReference<SourceListener> i : listeners) {
            if (i.get() == null || i.get() == listener) {
                listeners.remove(i);
            }
        }
    }
}
