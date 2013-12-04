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
package org.auraframework.impl.javascript;

import java.io.File;
import java.io.IOException;
import java.util.EnumSet;

import org.auraframework.Aura;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.source.file.AuraFileMonitor;
import org.auraframework.impl.util.AuraImplFiles;
import org.auraframework.system.SourceListener;
import org.auraframework.util.javascript.directive.DirectiveBasedJavascriptGroup;
import org.auraframework.util.javascript.directive.DirectiveTypes;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;

/**
 * the aura javascript. starts at Force.js
 */
public class AuraJavascriptGroup extends DirectiveBasedJavascriptGroup implements SourceListener {

    public static final String GROUP_NAME = "aura";
    // file name of properties file that contains compiled version info
    public static final String FILE_NAME = "aurafwuid.properties";
    public static final File ROOT_DIR = AuraImplFiles.AuraJavascriptSourceDirectory.asFile();
    private boolean isStale = true;

    public AuraJavascriptGroup() throws IOException {
        this(false);
    }

    public AuraJavascriptGroup(boolean monitor) throws IOException {
        this(ROOT_DIR);
        if (monitor) {
            Aura.getDefinitionService().subscribeToChangeNotification(this);
            AuraFileMonitor.addDirectory(ROOT_DIR.getPath());
        }
    }

    /**
     * Alternate constructor for tests which might want to control the root
     * directory.
     */
    protected AuraJavascriptGroup(File rootDirectory) throws IOException {
        super(GROUP_NAME, rootDirectory, "aura/Aura.js", DirectiveTypes.DEFAULT_TYPES, EnumSet.of(
                JavascriptGeneratorMode.DEVELOPMENT, JavascriptGeneratorMode.STATS, JavascriptGeneratorMode.TESTING,
                JavascriptGeneratorMode.AUTOTESTING, JavascriptGeneratorMode.TESTINGDEBUG,
                JavascriptGeneratorMode.AUTOTESTINGDEBUG, JavascriptGeneratorMode.PRODUCTION,
                JavascriptGeneratorMode.PRODUCTIONDEBUG, JavascriptGeneratorMode.DOC,
                JavascriptGeneratorMode.PTEST));
    }

    @Override
    public boolean isStale() {
        if (!isGroupHashKnown()) {
            return true;
        }
        return isStale;
    }

    @Override
    public void generate(File destRoot, boolean doValidation) throws IOException {
        isStale = false;
        super.generate(destRoot, doValidation);
    }

    @Override
    public void regenerate(File destRoot) throws IOException {
        isStale = false;
        super.regenerate(destRoot);
    }


    @Override
    public void onSourceChanged(DefDescriptor<?> source, SourceMonitorEvent event, String filePath) {
        if (filePath != null) {
            File updatedFile = new File(filePath);
            if (filePath.startsWith(ROOT_DIR.getPath()) && JS_FILTER.accept(updatedFile)) {
                isStale = true;
            }
        }
    }

}
