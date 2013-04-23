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
import org.auraframework.def.DefDescriptor;
import org.auraframework.system.SourceListener;
import org.auraframework.system.SourceListener.SourceMonitorEvent;

public class FileSourceListener
        implements FileListener
{

    private static final Logger logger = Logger.getLogger("FileSourceListener");

    private void notifySourceChanges(
            FileChangeEvent event,
            DefDescriptor<?> source,
            SourceListener.SourceMonitorEvent smEvent) {

        logger.info("Change to " + (source == null ? "file" : source.toString())
                + " caused sourceChange event");
        Aura.getDefinitionService().onSourceChanged(source, smEvent);
    }

    @Override
    public void fileCreated(FileChangeEvent event) throws Exception {
        SourceListener.SourceMonitorEvent sEvent = SourceMonitorEvent.created;
        notifySourceChanges(event, null, sEvent);
    }

    @Override
    public void fileDeleted(FileChangeEvent event) throws Exception {
        SourceListener.SourceMonitorEvent sEvent = SourceMonitorEvent.deleted;
        notifySourceChanges(event, null, sEvent);
    }

    @Override
    public void fileChanged(FileChangeEvent event) throws Exception {
        SourceListener.SourceMonitorEvent sEvent = SourceMonitorEvent.changed;
        notifySourceChanges(event, null, sEvent);
    }
}
