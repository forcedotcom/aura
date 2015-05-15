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
/*
 * Copyright (C) 2006 Sun Microsystems, Inc. All rights reserved.
 * Use is subject to license terms.
 *
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met: Redistributions of source code
 * must retain the above copyright notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of
 * conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution. Neither the name of the Sun Microsystems nor the names of
 * is contributors may be used to endorse or promote products derived from this software
 * without specific prior written permission.

 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER
 * OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package org.auraframework.util.phobos.script.javascript;
import javax.script.*;
import java.util.*;
import org.mozilla.javascript.*;
import org.auraframework.util.phobos.script.util.*;

/**
 * Factory to create RhinoScriptEngine
 *
 * @version 1.0
 * @author Mike Grogan
 * @since 1.6
 */
public class RhinoScriptEngineFactory extends ScriptEngineFactoryBase {

    public static final String USE_INTERPRETER_SYSTEM_PROPERTY = "com.sun.phobos.javascript.useInterpreter";

    private Properties properties;
    private boolean initialized;
    private ContextFactory.Listener listener;

    public RhinoScriptEngineFactory() {
    	System.out.println("RhinoScriptEngineFactory");
    }

    public RhinoScriptEngineFactory(ContextFactory.Listener listener) {
        this.listener = listener;
    }

    public List<String> getExtensions() {
        return extensions;
    }

    public List<String> getMimeTypes() {
        return mimeTypes;
    }

    public List<String> getNames() {
        return names;
    }

    public Object getParameter(String key) {
        if (key.equals(ScriptEngine.NAME)) {
            return "javascript";
        } else if (key.equals(ScriptEngine.ENGINE)) {
            return "Mozilla Rhino";
        } else if (key.equals(ScriptEngine.ENGINE_VERSION)) {
            return "1.6R7";
        } else if (key.equals(ScriptEngine.LANGUAGE)) {
            return "ECMAScript";
        } else if (key.equals(ScriptEngine.LANGUAGE_VERSION)) {
            return "1.6";
        } else if (key.equals("THREADING")) {
            return "MULTITHREADED";
        } else {
            throw new IllegalArgumentException("Invalid key");
        }
    }

    public ScriptEngine getScriptEngine() {
        RhinoScriptEngine ret = new RhinoScriptEngine();
        ret.setEngineFactory(this);
        return ret;
    }

    public void initialize() {
        if (!initialized) {
            if ("true".equals(getProperty(USE_INTERPRETER_SYSTEM_PROPERTY))) {
                if (!ContextFactory.hasExplicitGlobal()) {
                    ContextFactory.initGlobal(new ContextFactory() {
                        protected Context makeContext() {
                            Context cx = super.makeContext();
                            cx.setOptimizationLevel(-1);
                            return cx;
                        }
                    });
                }
            }
            if (listener != null) {
                ContextFactory.getGlobal().addListener(listener);
            }
            initialized = true;
        }
    }

    public void destroy() {
        if (initialized) {
            if (listener != null) {
                ContextFactory.getGlobal().removeListener(listener);
            }
            initialized = false;
        }
    }

    public void setProperties(Properties properties) {
        this.properties = properties;
    }

    private String getProperty(String key) {
        String value = null;
        if (properties != null) {
            value = properties.getProperty(key);
        }
        if (value == null) {
            value = System.getProperty(key);
        }
        return value;
    }

    private String getProperty(String name, String defaultValue) {
        String s = getProperty(name);
        return (s == null ? defaultValue : s);
    }

    public String getMethodCallSyntax(String obj, String method, String... args) {

        String ret = obj + "." + method + "(";
        int len = args.length;
        if (len == 0) {
            ret += ")";
            return ret;
        }

        for (int i = 0; i < len; i++) {
            ret += args[i];
            if (i != len - 1) {
                ret += ",";
            } else {
                ret += ")";
            }
        }
        return ret;
    }

    public String getOutputStatement(String toDisplay) {
        return "print(" + toDisplay + ")";
    }

    public String getProgram(String... statements) {
        int len = statements.length;
        String ret = "";
        for (int i = 0; i < len; i++) {
            ret += statements[i] + ";";
        }

        return ret;
    }

    public static void main(String[] args) {
        RhinoScriptEngineFactory fact = new RhinoScriptEngineFactory();
        System.out.println(fact.getParameter(ScriptEngine.ENGINE_VERSION));
    }

    private static List<String> names;
    private static List<String> mimeTypes;
    private static List<String> extensions;

    static {
        names = new ArrayList<String>(7);
        names.add("rhino-nonjdk");
        names.add("js");
        names.add("rhino");
        names.add("JavaScript");
        names.add("javascript");
        names.add("ECMAScript");
        names.add("ecmascript");
        names = Collections.unmodifiableList(names);

        mimeTypes = new ArrayList<String>(4);
        mimeTypes.add("application/javascript");
        mimeTypes.add("application/ecmascript");
        mimeTypes.add("text/javascript");
        mimeTypes.add("text/ecmascript");
        mimeTypes = Collections.unmodifiableList(mimeTypes);

        extensions = new ArrayList<String>(1);
        extensions.add("js");
        extensions = Collections.unmodifiableList(extensions);
    }
}
