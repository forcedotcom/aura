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
import javax.script.CompiledScript;
import javax.script.ScriptContext;
import javax.script.ScriptEngine;
import javax.script.ScriptException;

import org.auraframework.util.phobos.script.util.ExtendedScriptException;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.JavaScriptException;
import org.mozilla.javascript.RhinoException;
import org.mozilla.javascript.Script;
import org.mozilla.javascript.Scriptable;

/**
 * Represents compiled JavaScript code.
 *
 * @author Mike Grogan
 * @version 1.0
 * @since 1.6
 */
final class RhinoCompiledScript extends CompiledScript {

    private RhinoScriptEngine engine;
    private Script script;
    private final static boolean DEBUG = RhinoScriptEngine.DEBUG;

    RhinoCompiledScript(RhinoScriptEngine engine, Script script) {
        this.engine = engine;
        this.script = script;
    }

    @Override
    public Object eval(ScriptContext context) throws ScriptException {

        Object result = null;
        Context cx = RhinoScriptEngine.enterContext();
        try {

            Scriptable scope = engine.getRuntimeScope(context);
            Object ret = script.exec(cx, scope);
            result = engine.unwrapReturnValue(ret);
        } catch (JavaScriptException jse) {
            if (DEBUG) jse.printStackTrace();
            int line = (line = jse.lineNumber()) == 0 ? -1 : line;
            Object value = jse.getValue();
            String str = (value != null && value.getClass().getName().equals("org.mozilla.javascript.NativeError") ?
                          value.toString() :
                          jse.toString());
            throw new ExtendedScriptException(jse, str, jse.sourceName(), line);
        } catch (RhinoException re) {
            if (DEBUG) re.printStackTrace();
            int line = (line = re.lineNumber()) == 0 ? -1 : line;
            throw new ExtendedScriptException(re, re.toString(), re.sourceName(), line);
        } finally {
            Context.exit();
        }

        return result;
    }

    @Override
    public ScriptEngine getEngine() {
        return engine;
    }

}
