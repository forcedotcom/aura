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
import java.util.ArrayList;
import java.util.List;

public class EngineJavascriptBuilder extends JavascriptBuilder {
    private String engine = null;
    private String engineMin = null;
    private String engineCompat = null;
    private String engineCompatMin = null;
    private String engineProdDebug = null;
    private String engineCompatProdDebug = null;

    private String engineMinSource = null;
    private String engineMinSourcemap = null;
    private String engineCompatMinSource = null;
    private String engineCompatMinSourcemap = null;

    private String wireMinSource = null;
    private String wireMinSourcemap = null;
    private String wireCompatMinSource = null;
    private String wireCompatMinSourcemap = null;

    private String compatHelpersMinSource = null;
    private String compatHelpersMinSourcemap = null;

    private static final String ENGINE_SCRIPT_PREFIX = "\"undefined\"===typeof Aura&&(Aura={});";

    public EngineJavascriptBuilder(ResourceLoader resourceLoader) {
        super(resourceLoader);
    }

    @Override
    public List<JavascriptResource> build(JavascriptGeneratorMode mode, boolean isCompat, String inputContent, String outputFileName) {
        boolean minified = mode.getJavascriptWriter() == JavascriptWriter.CLOSURE_AURA_PROD;
        boolean isProdDebug = mode == JavascriptGeneratorMode.PRODUCTIONDEBUG;
        List<JavascriptResource> resources = new ArrayList<>();

        String output = null;
        if (mode != JavascriptGeneratorMode.DOC) {
            // jsdoc errors when parsing engine.js
            if (mode == JavascriptGeneratorMode.PRODUCTION) {
                if (isCompat) {
                    resources.add(new JavascriptResource(null, compatHelpersMinSource, compatHelpersMinSourcemap));
                    resources.add(new JavascriptResource(null, ENGINE_SCRIPT_PREFIX, null));
                    resources.add(new JavascriptResource(null, engineCompatMinSource, engineCompatMinSourcemap));
                    resources.add(new JavascriptResource(null, wireCompatMinSource, wireCompatMinSourcemap));
                } else {
                    resources.add(new JavascriptResource(null, ENGINE_SCRIPT_PREFIX, null));
                    resources.add(new JavascriptResource(null, engineMinSource, engineMinSourcemap));
                    resources.add(new JavascriptResource(null, wireMinSource, wireMinSourcemap));
                }
            } else {
                output = minified ?
                        (isCompat ? engineCompatMin : mode == JavascriptGeneratorMode.AUTOTESTING ? engine : engineMin) :
                        (isCompat ? (isProdDebug ? engineCompatProdDebug : engineCompat) : (isProdDebug ? engineProdDebug : engine));

                resources.add(new JavascriptResource(null, output, null));
            }
        }

        return resources;
    }

    @Override
    public void fetchResources() {
        // Engine
        String engineSource = null;
        String engineCompatSource = null;
        String engineProdDebugSource = null;
        String engineCompatProdDebugSource = null;

        // Wire
        String wireSource = null;
        String wireCompatSource = null;
        String wireProdDebugSource = null;
        String wireCompatProdDebugSource = null;
        // Compat Helper
        String compatHelpersSource = null;

        try {
            engineSource = getSource("lwc/engine/es2017/engine.js");
            engineMinSource = getSource("lwc/engine/es2017/engine.min.js");
            engineMinSourcemap = getSource("lwc/engine/es2017/engine.min.js.map");

            engineCompatSource = getSource("lwc/engine/es5/engine.js");
            engineCompatMinSource = getSource("lwc/engine/es5/engine.min.js");
            engineCompatMinSourcemap = getSource("lwc/engine/es5/engine.min.js.map");

            engineProdDebugSource = getSource("lwc/engine/es2017/engine_debug.js");
            engineCompatProdDebugSource = getSource("lwc/engine/es5/engine_debug.js");

            wireSource = getSource("lwc/wire-service/es2017/wire.js");
            wireMinSource = getSource("lwc/wire-service/es2017/wire.min.js");
            wireMinSourcemap = getSource("lwc/wire-service/es2017/wire.min.js.map");

            wireCompatSource = getSource("lwc/wire-service/es5/wire.js");
            wireCompatMinSource = getSource("lwc/wire-service/es5/wire.min.js");
            wireCompatMinSourcemap = getSource("lwc/wire-service/es5/wire.min.js.map");

            wireProdDebugSource = getSource("lwc/wire-service/es2017/wire_debug.js");
            wireCompatProdDebugSource = getSource("lwc/wire-service/es5/wire_debug.js");

            compatHelpersSource = getSource("lwc/proxy-compat/compat.js");
            compatHelpersMinSource = getSource("lwc/proxy-compat/compat.min.js");
            compatHelpersMinSourcemap = getSource("lwc/proxy-compat/compat.min.js.map");
        } catch (MalformedURLException e) {
        }

        if (engineSource != null && wireSource != null) {
            engine = ENGINE_SCRIPT_PREFIX
                    + engineSource
                    + wireSource;
        }

        if (engineMinSource != null && wireMinSource != null) {
            engineMin = ENGINE_SCRIPT_PREFIX
                    + engineMinSource
                    + wireMinSource;
        }

        if (compatHelpersSource != null && engineCompatSource != null && wireCompatSource != null) {
            engineCompat = compatHelpersSource
                    + "\n"
                    + ENGINE_SCRIPT_PREFIX
                    + engineCompatSource
                    + wireCompatSource;
        }

        if (compatHelpersMinSource != null && engineCompatMinSource != null && wireCompatMinSource != null) {
            engineCompatMin = compatHelpersMinSource
                    + "\n"
                    + ENGINE_SCRIPT_PREFIX
                    + engineCompatMinSource
                    + wireCompatMinSource;
        }

        if (engineProdDebugSource != null && wireProdDebugSource != null) {
            engineProdDebug = ENGINE_SCRIPT_PREFIX
                    + engineProdDebugSource
                    + wireProdDebugSource;
        }

        if (compatHelpersSource != null && engineCompatProdDebugSource != null && wireCompatProdDebugSource != null) {
            engineCompatProdDebug = compatHelpersSource
                    + "\n"
                    + ENGINE_SCRIPT_PREFIX
                    + engineCompatProdDebugSource
                    + wireCompatProdDebugSource;
        }
    }
}