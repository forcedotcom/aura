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

import org.apache.commons.vfs2.FileChangeEvent;
import org.apache.commons.vfs2.FileListener;
import org.apache.log4j.Logger;
import org.auraframework.Aura;
import org.auraframework.system.SourceListener;
import org.auraframework.system.SourceListener.SourceMonitorEvent;

import java.util.HashMap;
import java.util.Map;

/**
 * Used by {@link FileSourceLoader} to monitor and notify when file has changed.
 * When a file does change, it notifies its loader to clear cache of specific descriptor.
 */
public class FileSourceListener implements FileListener {

    private static final Logger logger = Logger.getLogger(FileSourceListener.class);
    // static to keep track of all loaders using FileSourceListener
    private static final Map<String, FileSourceLoader> loaderMap = new HashMap<String, FileSourceLoader>();

    public void addLoader(String directory, FileSourceLoader loader) {
        loaderMap.put(directory, loader);
    }

    @Override
    public void fileCreated(FileChangeEvent event) throws Exception {
        callLoaderOrInvalidateAll(event, SourceMonitorEvent.created);
    }

    @Override
    public void fileDeleted(FileChangeEvent event) throws Exception {
        callLoaderOrInvalidateAll(event, SourceMonitorEvent.deleted);
    }

    @Override
    public void fileChanged(FileChangeEvent event) throws Exception {
        callLoaderOrInvalidateAll(event, SourceMonitorEvent.changed);
    }

    /**
     * Calls loader of particular changed file to notify change.
     * In unlikely case loader is not found, we clear all cache by passing null DefDescriptor
     *
     * @param event file change event
     * @param sEvent event name
     */
    private void callLoaderOrInvalidateAll(
            FileChangeEvent event,
            SourceListener.SourceMonitorEvent sEvent) {

//        String filePath = event.getFile().toString();
//        FileSourceLoader loader = null;
//
//        logger.info("File changed: " + filePath);
//
//        for (String dir : loaderMap.keySet()) {
//            if (filePath.startsWith(dir)) {
//                loader = loaderMap.get(dir);
//                break;
//            }
//        }
//
//        if (loader != null) {
//            loader.notifySourceChanges(event, sEvent);
//        } else {
//            logger.debug("No loader found. Invalidating all cache.");
//            notifyInvalidateAll(sEvent);
//        }
    	
    	// Reverting to clearing all cache so that work on SFDC can continue.
    	logger.info("File changed: " + event.getFile().toString());
    	notifyInvalidateAll(sEvent);
    }

    /**
     * Uses {@link org.auraframework.impl.DefinitionServiceImpl} to clear all cache
     * @param sEvent event name
     */
    private void notifyInvalidateAll(SourceListener.SourceMonitorEvent sEvent) {
        Aura.getDefinitionService().onSourceChanged(null, sEvent);
    }
}
