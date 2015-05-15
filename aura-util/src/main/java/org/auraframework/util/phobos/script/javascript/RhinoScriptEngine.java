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

import org.auraframework.util.phobos.script.util.*;
import javax.script.*;
import org.mozilla.javascript.*;
import java.lang.reflect.Method;
import java.io.*;
import java.util.*;


/**
 * Implementation of <code>ScriptEngine</code> using the Mozilla Rhino
 * interpreter.
 *
 * @author Mike Grogan
 * @author A. Sundararajan
 * @version 1.0
 * @since 1.6
 *
 * Modified for phobos to remove some of the restrictions.
 * Modified to allow subclassing and preprocessing of script source code.
 * Modified to avoid using the RhinoTopLevel class, since that introduces
 * a circularity that prevents objects from being garbage collected.
 *
 * @author Roberto Chinnici
 *
 */
public class RhinoScriptEngine extends AbstractScriptEngine
        implements  Invocable, Compilable {

    public static final boolean DEBUG = false;
    private static final String TOPLEVEL_SCRIPT_NAME = "META-INF/toplevel.js";

    /* Scope where standard JavaScript objects and our
     * extensions to it are stored. Note that these are not
     * user defined engine level global variables. These are
     * variables have to be there on all compliant ECMAScript
     * scopes. We put these standard objects in this top level.
     */
    private ScriptableObject topLevel;

    /* map used to store indexed properties in engine scope
     * refer to comment on 'indexedProps' in ExternalScriptable.java.
     */
    private Map indexedProps;

    private ScriptEngineFactory factory;
    private InterfaceImplementor implementor;

    /*
    // in Phobos we want to support all javascript features
    static {
        ContextFactory.initGlobal(new ContextFactory() {
            protected Context makeContext() {
                Context cx = super.makeContext();
                cx.setClassShutter(RhinoClassShutter.getInstance());
                cx.setWrapFactory(RhinoWrapFactory.getInstance());
                return cx;
            }

            public boolean hasFeature(Context cx, int feature) {
                // we do not support E4X (ECMAScript for XML)!
                if (feature == Context.FEATURE_E4X) {
                    return false;
                } else {
                    return super.hasFeature(cx, feature);
                }
            }
        });
    }

    static {
        if (USE_INTERPRETER) {
            ContextFactory.initGlobal(new ContextFactory() {
                protected Context makeContext() {
                    Context cx = super.makeContext();
                    cx.setOptimizationLevel(-1);
                    return cx;
                }
            });
        }
    }
    */

    /**
     * Creates a new instance of RhinoScriptEngine
     */
    public RhinoScriptEngine() {

        Context cx = enterContext();

        try {
            /*
             * RRC - modified this code to register JSAdapter and some functions
             * directly, without using a separate RhinoTopLevel class
             */
            topLevel = new ImporterTopLevel(cx, false);
            new LazilyLoadedCtor(topLevel, "JSAdapter",
                "org.auraframework.util.script.javascript.JSAdapter",
                false);
            // add top level functions
            String names[] = { "bindings", "scope", "sync"  };
            topLevel.defineFunctionProperties(names, RhinoScriptEngine.class, ScriptableObject.DONTENUM);

            processAllTopLevelScripts(cx);
        } finally {
            cx.exit();
        }

        indexedProps = new HashMap();

        //construct object used to implement getInterface
        implementor = new InterfaceImplementor(this) {
                protected Object convertResult(Method method, Object res)
                                            throws ScriptException {
                    Class desiredType = method.getReturnType();
                    if (desiredType == Void.TYPE) {
                        return null;
                    } else {
                        return Context.jsToJava(res, desiredType);
                    }
                }
        };
    }

    public Object eval(Reader reader, ScriptContext ctxt)
    throws ScriptException {
        Object ret;

        Context cx = enterContext();
        try {
            Scriptable scope = getRuntimeScope(ctxt);
            scope.put("context", scope, ctxt);

            // NOTE (RRC) - why does it look straight into the engine instead of asking
            // the given ScriptContext object?
            // Modified to use the context
            // String filename = (String) get(ScriptEngine.FILENAME);
            String filename = null;
            if (ctxt != null && ctxt.getBindings(ScriptContext.ENGINE_SCOPE) != null) {
                filename = (String) ctxt.getBindings(ScriptContext.ENGINE_SCOPE).get(ScriptEngine.FILENAME);
            }
            if (filename == null) {
                filename = (String) get(ScriptEngine.FILENAME);
            }

            filename = filename == null ? "<Unknown source>" : filename;
            ret = cx.evaluateReader(scope, preProcessScriptSource(reader), filename , 1,  null);
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
        } catch (IOException ee) {
            throw new ScriptException(ee);
        } finally {
            cx.exit();
        }

        return unwrapReturnValue(ret);
    }

    public Object eval(String script, ScriptContext ctxt) throws ScriptException {
        if (script == null) {
            throw new NullPointerException("null script");
        }
        return eval(preProcessScriptSource(new StringReader(script)) , ctxt);
    }

    public ScriptEngineFactory getFactory() {
        if (factory != null) {
            return factory;
        } else {
            return new RhinoScriptEngineFactory();
        }
    }

    public Bindings createBindings() {
        return new SimpleBindings();
    }

    //Invocable methods
    public Object invokeFunction(String name, Object... args)
    throws ScriptException, NoSuchMethodException {
        return invokeMethod(null, name, args);
    }

    public Object invokeMethod(Object thiz, String name, Object... args)
    throws ScriptException, NoSuchMethodException {

        Context cx = enterContext();
        try {
            if (name == null) {
                throw new NullPointerException("method name is null");
            }

            if (thiz != null && !(thiz instanceof Scriptable)) {
                thiz = cx.toObject(thiz, topLevel);
            }

            Scriptable engineScope = getRuntimeScope(context);
            Scriptable localScope = (thiz != null)? (Scriptable) thiz :
                                                    engineScope;
            Object obj = ScriptableObject.getProperty(localScope, name);
            if (! (obj instanceof Function)) {
                throw new NoSuchMethodException("no such method: " + name);
            }

            Function func = (Function) obj;
            Scriptable scope = func.getParentScope();
            if (scope == null) {
                scope = engineScope;
            }
            Object result = func.call(cx, scope, localScope,
                                      wrapArguments(args));
            return unwrapReturnValue(result);
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
            cx.exit();
        }
    }

    public <T> T getInterface(Class<T> clasz) {
        try {
            return implementor.getInterface(null, clasz);
        } catch (ScriptException e) {
            return null;
        }
    }

    public <T> T getInterface(Object thiz, Class<T> clasz) {
        if (thiz == null) {
            throw new IllegalArgumentException("script object can not be null");
        }

        try {
            return implementor.getInterface(thiz, clasz);
        } catch (ScriptException e) {
            return null;
        }
    }

    private static final String printSource =
            "function print(str) {                         \n" +
            "    if (typeof(str) == 'undefined') {         \n" +
            "        str = 'undefined';                    \n" +
            "    } else if (str == null) {                 \n" +
            "        str = 'null';                         \n" +
            "    }                                         \n" +
            "    context.getWriter().println(String(str)); \n" +
            "}";

    Scriptable getRuntimeScope(ScriptContext ctxt) {
        if (ctxt == null) {
            throw new NullPointerException("null script context");
        }

        // we create a scope for the given ScriptContext
        Scriptable newScope = new ExternalScriptable(ctxt, indexedProps);

        // Set the prototype of newScope to be 'topLevel' so that
        // JavaScript standard objects are visible from the scope.
        newScope.setPrototype(topLevel);

        // define "context" variable in the new scope
        newScope.put("context", newScope, ctxt);

        // define "print" function in the new scope
        Context cx = enterContext();
        try {
            cx.evaluateString(newScope, printSource, "print", 1, null);
        } finally {
            cx.exit();
        }
        return newScope;
    }


    //Compilable methods
    public CompiledScript compile(String script) throws ScriptException {
        return compile(preProcessScriptSource(new StringReader(script)));
    }

    public CompiledScript compile(java.io.Reader script) throws ScriptException {
        CompiledScript ret = null;
        Context cx = enterContext();

        try {
            String filename = (String) get(ScriptEngine.FILENAME);
            if (filename == null) {
                filename = "<Unknown Source>";
            }

            Scriptable scope = getRuntimeScope(context);
            Script scr = cx.compileReader(scope, preProcessScriptSource(script), filename, 1, null);
            ret = new RhinoCompiledScript(this, scr);
        } catch (Exception e) {
            if (DEBUG) e.printStackTrace();
            throw new ScriptException(e);
        } finally {
            cx.exit();
        }
        return ret;
    }


    //package-private helpers

    static Context enterContext() {
        // call this always so that initializer of this class runs
        // and initializes custom wrap factory and class shutter.
        return Context.enter();
    }

    void setEngineFactory(ScriptEngineFactory fac) {
        factory = fac;
    }

    Object[] wrapArguments(Object[] args) {
        if (args == null) {
            return Context.emptyArgs;
        }
        Object[] res = new Object[args.length];
        for (int i = 0; i < res.length; i++) {
            res[i] = Context.javaToJS(args[i], topLevel);
        }
        return res;
    }

    Object unwrapReturnValue(Object result) {
        if (result instanceof Wrapper) {
            result = ( (Wrapper) result).unwrap();
        }

        return result instanceof Undefined ? null : result;
    }

    protected Reader preProcessScriptSource(Reader reader) throws ScriptException {
        return reader;
    }

    protected void processAllTopLevelScripts(Context cx) {
        processTopLevelScript(TOPLEVEL_SCRIPT_NAME, cx);
    }

    protected void processTopLevelScript(String scriptName, Context cx) {
        InputStream toplevelScript = this.getClass().getClassLoader().getResourceAsStream(scriptName);
        if (toplevelScript != null) {
            Reader reader = new InputStreamReader(toplevelScript);
            try {
                cx.evaluateReader(topLevel, reader, scriptName, 1, null);
            }
            catch (Exception e) {
                if (DEBUG) e.printStackTrace();
            }
            finally {
                try {
                    toplevelScript.close();
                }
                catch (IOException e) {
                }
            }
        }
    }

    /**
     * The bindings function takes a JavaScript scope object
     * of type ExternalScriptable and returns the underlying Bindings
     * instance.
     *
     *    var page = scope(pageBindings);
     *    with (page) {
     *       // code that uses page scope
     *    }
     *    var b = bindings(page);
     *    // operate on bindings here.
     */
    public static Object bindings(Context cx, Scriptable thisObj, Object[] args,
            Function funObj) {
        if (args.length == 1) {
            Object arg = args[0];
            if (arg instanceof Wrapper) {
                arg = ((Wrapper)arg).unwrap();
            }
            if (arg instanceof ExternalScriptable) {
                ScriptContext ctx = ((ExternalScriptable)arg).getContext();
                Bindings bind = ctx.getBindings(ScriptContext.ENGINE_SCOPE);
                return Context.javaToJS(bind,
                           ScriptableObject.getTopLevelScope(thisObj));
            }
        }
        return cx.getUndefinedValue();
    }

    /**
     * The scope function creates a new JavaScript scope object
     * with given Bindings object as backing store. This can be used
     * to create a script scope based on arbitrary Bindings instance.
     * For example, in webapp scenario, a 'page' level Bindings instance
     * may be wrapped as a scope and code can be run in JavaScripe 'with'
     * statement:
     *
     *    var page = scope(pageBindings);
     *    with (page) {
     *       // code that uses page scope
     *    }
     */
    public static Object scope(Context cx, Scriptable thisObj, Object[] args,
            Function funObj) {
        if (args.length == 1) {
            Object arg = args[0];
            if (arg instanceof Wrapper) {
                arg = ((Wrapper)arg).unwrap();
            }
            if (arg instanceof Bindings) {
                ScriptContext ctx = new SimpleScriptContext();
                ctx.setBindings((Bindings)arg, ScriptContext.ENGINE_SCOPE);
                Scriptable res = new ExternalScriptable(ctx);
                res.setPrototype(ScriptableObject.getObjectPrototype(thisObj));
                res.setParentScope(ScriptableObject.getTopLevelScope(thisObj));
                return res;
            }
        }
        return cx.getUndefinedValue();
    }

    /**
     * The sync function creates a synchronized function (in the sense
     * of a Java synchronized method) from an existing function. The
     * new function synchronizes on the <code>this</code> object of
     * its invocation.
     * js> var o = { f : sync(function(x) {
     *       print("entry");
     *       Packages.java.lang.Thread.sleep(x*1000);
     *       print("exit");
     *     })};
     * js> thread(function() {o.f(5);});
     * entry
     * js> thread(function() {o.f(5);});
     * js>
     * exit
     * entry
     * exit
     */
    public static Object sync(Context cx, Scriptable thisObj, Object[] args,
            Function funObj) {
        if (args.length == 1 && args[0] instanceof Function) {
            return new Synchronizer((Function)args[0]);
        } else {
            throw Context.reportRuntimeError("wrong argument(s) for sync");
        }
    }

    public static void main(String[] args) throws Exception {
        if (args.length == 0) {
            System.out.println("No file specified");
            return;
        }

        InputStreamReader r = new InputStreamReader(new FileInputStream(args[0]));
        ScriptEngine engine = new RhinoScriptEngine();

        SimpleScriptContext context = new SimpleScriptContext();
        engine.put(ScriptEngine.FILENAME, args[0]);
        engine.eval(r, context);
        // added this statement to save some typing to most script authors
        context.getWriter().flush();
    }
}
