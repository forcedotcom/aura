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
package org.auraframework.util.javascript.builder;

import org.auraframework.util.javascript.JavascriptWriter;
import org.auraframework.util.javascript.directive.JavascriptGeneratorMode;
import org.auraframework.util.resource.ResourceLoader;

import java.net.MalformedURLException;

public class EngineJavascriptBuilder extends JavascriptBuilder {
    private String engine = "";
    private String engineMin = "";
    private String engineCompat = "";
    private String engineCompatMin = "";
    private String engineProdDebug = "";
    private String engineCompatProdDebug = "";

    public EngineJavascriptBuilder(ResourceLoader resourceLoader) {
        super(resourceLoader);
    }

    @Override
    public JavascriptResource build(JavascriptGeneratorMode mode, boolean isCompat, String inputContent, String outputFileName) {
        boolean minified = mode.getJavascriptWriter() == JavascriptWriter.CLOSURE_AURA_PROD;
        boolean isProdDebug = mode == JavascriptGeneratorMode.PRODUCTIONDEBUG;

        String output = null;
        if (mode != JavascriptGeneratorMode.DOC) {
            // jsdoc errors when parsing engine.js
            output = minified ?
                    (isCompat ? engineCompatMin : mode == JavascriptGeneratorMode.AUTOTESTING ? engine : engineMin) :
                    (isCompat ? (isProdDebug ? engineCompatProdDebug : engineCompat) : (isProdDebug ? engineProdDebug : engine));
        }

        return new JavascriptResource(null, output, null);
    }

    @Override
    public void fetchResources() {
        // Engine
        String engineSource = null;
        String engineMinSource = null;
        String engineCompatSource = null;
        String engineCompatMinSource = null;
        String engineProdDebugSource = null;
        String engineCompatProdDebugSource = null;
        // Wire
        String wireSource = null;
        String wireMinSource = null;
        String wireCompatSource = null;
        String wireCompatMinSource = null;
        String wireProdDebugSource = null;
        String wireCompatProdDebugSource = null;
        // Compat Helper
        String compatHelpersSource = null;
        String compatHelpersMinSource = null;

        try {
            engineSource = getSource("lwc/engine/es2017/engine.js");
            engineMinSource = getSource("lwc/engine/es2017/engine.min.js");

            engineCompatSource = getSource("lwc/engine/es5/engine.js");
            engineCompatMinSource = getSource("lwc/engine/es5/engine.min.js");

            engineProdDebugSource = getSource("lwc/engine/es2017/engine_debug.js");
            engineCompatProdDebugSource = getSource("lwc/engine/es5/engine_debug.js");

            wireSource = getSource("lwc/wire-service/es2017/wire.js");
            wireMinSource = getSource("lwc/wire-service/es2017/wire.min.js");

            wireCompatSource = getSource("lwc/wire-service/es5/wire.js");
            wireCompatMinSource = getSource("lwc/wire-service/es5/wire.min.js");

            wireProdDebugSource = getSource("lwc/wire-service/es2017/wire_debug.js");
            wireCompatProdDebugSource = getSource("lwc/wire-service/es5/wire_debug.js");

            compatHelpersSource = getSource("lwc/proxy-compat/compat.js");
            compatHelpersMinSource = getSource("lwc/proxy-compat/compat.min.js");
        }  catch (MalformedURLException e) {}

        String header = "\"undefined\"===typeof Aura&&(Aura={});";
        if (engineSource != null && wireSource != null) {
            engine = header
                    + engineSource
                    + wireSource;
        }

        if (engineMinSource != null && wireMinSource != null) {
            engineMin = header
                    + engineMinSource
                    + wireMinSource;
        }

        if (compatHelpersSource != null && engineCompatSource != null && wireCompatSource != null) {
            engineCompat = compatHelpersSource
                    + "\n"
                    + header
                    + engineCompatSource
                    + wireCompatSource;
        }

        if (compatHelpersMinSource != null && engineCompatMinSource != null && wireCompatMinSource != null) {
            engineCompatMin = compatHelpersMinSource
                    + "\n"
                    + header
                    + engineCompatMinSource
                    + wireCompatMinSource;
        }

        if (engineProdDebugSource != null && wireProdDebugSource != null) {
            engineProdDebug = header
                    + engineProdDebugSource
                    + wireProdDebugSource;
        }

        if (compatHelpersSource != null && engineCompatProdDebugSource != null && wireCompatProdDebugSource != null) {
            engineCompatProdDebug = compatHelpersSource
                    + "\n"
                    + header
                    + engineCompatProdDebugSource
                    + wireCompatProdDebugSource;
        }
    }
}