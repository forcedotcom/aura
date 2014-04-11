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
package org.auraframework.util.validation;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;

/**
 * Base class for validators using Rhino
 */
public abstract class RhinoBasedValidator {

    static {
        // reduces script execution time to less than half with respect to the -1 default
        System.setProperty("rhino.opt.level", "0");
    }

    protected final String tool;
    protected final ScriptEngine engine = new ScriptEngineManager().getEngineByName("js");

    /**
     * @param tool tool used for validation (i.e. "jslint")
     */
    protected RhinoBasedValidator(String tool) throws IOException {
        this.tool = tool;
        Reader toolReader = new BufferedReader(new InputStreamReader(getClass().getResourceAsStream(tool + ".js")));
        Reader helperReader = new BufferedReader(new InputStreamReader(getClass().getResourceAsStream(
                tool + "_helper.js")));
        try {
            engine.eval(toolReader);
            engine.eval(helperReader);
        } catch (ScriptException e) {
            throw new RuntimeException(e);
        } finally {
            toolReader.close();
            helperReader.close();
        }
    }
}
