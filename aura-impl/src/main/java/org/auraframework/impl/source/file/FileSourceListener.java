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
import org.auraframework.impl.system.DefDescriptorImpl;
import org.auraframework.system.SourceListener;
import org.auraframework.system.SourceListener.SourceMonitorEvent;

import java.util.EnumMap;
import java.util.Map;

/**
 * Used by {@link FileSourceLoader} to monitor and notify when file has changed.
 * When a file does change, it notifies its loader to clear cache of specific descriptor.
 */
public class FileSourceListener implements FileListener {

    private static final Logger logger = Logger.getLogger(FileSourceListener.class);
    private static final EnumMap<DefDescriptor.DefType, String> extensions = new EnumMap<DefDescriptor.DefType, String>(DefDescriptor.DefType.class);

    static {
        extensions.put(DefDescriptor.DefType.APPLICATION, ".app");
        extensions.put(DefDescriptor.DefType.COMPONENT, ".cmp");
        extensions.put(DefDescriptor.DefType.EVENT, ".evt");
        extensions.put(DefDescriptor.DefType.INTERFACE, ".intf");
        extensions.put(DefDescriptor.DefType.STYLE, ".css");
        extensions.put(DefDescriptor.DefType.LAYOUTS, "Layouts.xml");
        extensions.put(DefDescriptor.DefType.NAMESPACE, ".xml");
        extensions.put(DefDescriptor.DefType.TESTSUITE, "Test.js");
        extensions.put(DefDescriptor.DefType.CONTROLLER, "Controller.js");
        extensions.put(DefDescriptor.DefType.RENDERER, "Renderer.js");
        extensions.put(DefDescriptor.DefType.PROVIDER, "Provider.js");
        extensions.put(DefDescriptor.DefType.HELPER, "Helper.js");
        extensions.put(DefDescriptor.DefType.MODEL, "Model.js");
    }

    @Override
    public void fileCreated(FileChangeEvent event) throws Exception {
        notifySourceChanges(event, SourceMonitorEvent.created);
    }

    @Override
    public void fileDeleted(FileChangeEvent event) throws Exception {
        notifySourceChanges(event, SourceMonitorEvent.deleted);
    }

    @Override
    public void fileChanged(FileChangeEvent event) throws Exception {
        notifySourceChanges(event, SourceMonitorEvent.changed);
    }

    public void onSourceChanged(DefDescriptor<?> defDescriptor, SourceListener.SourceMonitorEvent smEvent) {
        Aura.getDefinitionService().onSourceChanged(defDescriptor, smEvent);
    }

    private void notifySourceChanges(FileChangeEvent event, SourceListener.SourceMonitorEvent smEvent) {

        String filePath = event.getFile().toString();
        logger.info("File changes: " + filePath);

        DefDescriptor<?> defDescriptor = getDefDescriptor(filePath);
        onSourceChanged(defDescriptor, smEvent);
    }

    private DefDescriptor<?> getDefDescriptor(String filePath) {
        DefDescriptor<?> defDescriptor = null;
        filePath = filePath.replaceAll("\\\\", "/");
        for (Map.Entry<DefDescriptor.DefType, String> entry : extensions.entrySet()) {
            String ext = entry.getValue();
            if (filePath.endsWith(ext)) {
                DefDescriptor.DefType defType = entry.getKey();
                String paths[] = filePath.split("/");
                String namespace = paths[paths.length - 3];
                String name = paths[paths.length - 2];
                String extension = filePath.substring(filePath.lastIndexOf("."));

                String qname;
                if (defType == DefDescriptor.DefType.STYLE) {
                    qname = String.format("css://%s.%s", namespace, name);
                } else if (extension.equalsIgnoreCase(".js")) {
                    qname = String.format("js://%s.%s", namespace, name);
                } else {
                    qname = String.format("markup://%s:%s", namespace, name);
                }

                defDescriptor = DefDescriptorImpl.getInstance(qname, defType.getPrimaryInterface());
                break;
            }
        }
        return defDescriptor;
    }
}
