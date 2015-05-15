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
import org.mozilla.javascript.*;
import javax.script.*;
import java.util.*;

/**
 * ExternalScriptable is an implementation of Scriptable
 * backed by a JSR 223 Bindings instance.
 *
 * @author Mike Grogan
 * @author A. Sundararajan
 * @since 1.6
 */
final class ExternalScriptable implements Scriptable {
    /* Underlying ScriptContext that we use to store
     * named variables of this scope.
     */
    private ScriptContext context;

    /* JavaScript allows variables to be named as numbers (indexed
     * properties). This way arrays, objects (scopes) are treated uniformly.
     * Note that JSR 223 API supports only String named variables and
     * so we can't store these in Bindings. Also, JavaScript allows name
     * of the property name to be even empty String! Again, JSR 223 API
     * does not support empty name. So, we use the following fallback map
     * to store such variables of this scope. This map is not exposed to
     * JSR 223 API. We can just script objects "as is" and need not convert.
     */
    private Map indexedProps;

    // my prototype
    private Scriptable prototype;
    // my parent scope, if any
    private Scriptable parent;

    ExternalScriptable(ScriptContext context) {
        this(context, new HashMap());
    }

    ExternalScriptable(ScriptContext context, Map indexedProps) {
        if (context == null) {
            throw new NullPointerException("context is null");
        }
        this.context = context;
        this.indexedProps = indexedProps;
    }

    ScriptContext getContext() {
        return context;
    }

    private boolean isInIndexedProps(Object key) {
        return indexedProps != null && indexedProps.containsKey(key);
    }

    private boolean isEmpty(String name) {
        return name.equals("");
    }

    /**
     * Return the name of the class.
     */
    public String getClassName() {
        return "Global";
    }

    /**
     * Returns the value of the named property or NOT_FOUND.
     *
     * If the property was created using defineProperty, the
     * appropriate getter method is called.
     *
     * @param name the name of the property
     * @param start the object in which the lookup began
     * @return the value of the property (may be null), or NOT_FOUND
     */
    public synchronized Object get(String name, Scriptable start) {
        if (isEmpty(name)) {
            if (indexedProps.containsKey(name)) {
                return indexedProps.get(name);
            } else {
                return NOT_FOUND;
            }
        } else {
            synchronized (context) {
                int scope = context.getAttributesScope(name);
                if (scope != -1) {
                    Object value = context.getAttribute(name, scope);
                    return Context.javaToJS(value, this);
                } else {
                    return NOT_FOUND;
                }
            }
        }
    }

    /**
     * Returns the value of the indexed property or NOT_FOUND.
     *
     * @param index the numeric index for the property
     * @param start the object in which the lookup began
     * @return the value of the property (may be null), or NOT_FOUND
     */
    public synchronized Object get(int index, Scriptable start) {
        Integer key = new Integer(index);
        if (indexedProps.containsKey(index)) {
            return indexedProps.get(key);
        } else {
            return NOT_FOUND;
        }
    }

    /**
     * Returns true if the named property is defined.
     *
     * @param name the name of the property
     * @param start the object in which the lookup began
     * @return true if and only if the property was found in the object
     */
    public synchronized boolean has(String name, Scriptable start) {
        if (isEmpty(name)) {
            return indexedProps.containsKey(name);
        } else {
            synchronized (context) {
                return context.getAttributesScope(name) != -1;
            }
        }
    }

    /**
     * Returns true if the property index is defined.
     *
     * @param index the numeric index for the property
     * @param start the object in which the lookup began
     * @return true if and only if the property was found in the object
     */
    public synchronized boolean has(int index, Scriptable start) {
        Integer key = new Integer(index);
        return indexedProps.containsKey(key);
    }

    /**
     * Sets the value of the named property, creating it if need be.
     *
     * @param name the name of the property
     * @param start the object whose property is being set
     * @param value value to set the property to
     */
    public void put(String name, Scriptable start, Object value) {
        if (start == this) {
            synchronized (this) {
                if (isEmpty(name)) {
                    indexedProps.put(name, value);
                } else {
                    synchronized (context) {
                        int scope = context.getAttributesScope(name);
                        if (scope == -1) {
                            scope = ScriptContext.ENGINE_SCOPE;
                        }
                        context.setAttribute(name, jsToJava(value), scope);
                    }
                }
            }
        } else {
            start.put(name, start, value);
        }
    }

    /**
     * Sets the value of the indexed property, creating it if need be.
     *
     * @param index the numeric index for the property
     * @param start the object whose property is being set
     * @param value value to set the property to
     */
    public void put(int index, Scriptable start, Object value) {
        if (start == this) {
            synchronized (this) {
                indexedProps.put(new Integer(index), value);
            }
        } else {
            start.put(index, start, value);
        }
    }

    /**
     * Removes a named property from the object.
     *
     * If the property is not found, no action is taken.
     *
     * @param name the name of the property
     */
    public synchronized void delete(String name) {
        if (isEmpty(name)) {
            indexedProps.remove(name);
        } else {
            synchronized (context) {
                int scope = context.getAttributesScope(name);
                if (scope != -1) {
                    context.removeAttribute(name, scope);
                }
            }
        }
    }

    /**
     * Removes the indexed property from the object.
     *
     * If the property is not found, no action is taken.
     *
     * @param index the numeric index for the property
     */
    public void delete(int index) {
        indexedProps.remove(new Integer(index));
    }

    /**
     * Get the prototype of the object.
     * @return the prototype
     */
    public Scriptable getPrototype() {
        return prototype;
    }

    /**
     * Set the prototype of the object.
     * @param prototype the prototype to set
     */
    public void setPrototype(Scriptable prototype) {
        this.prototype = prototype;
    }

    /**
     * Get the parent scope of the object.
     * @return the parent scope
     */
    public Scriptable getParentScope() {
        return parent;
    }

    /**
     * Set the parent scope of the object.
     * @param parent the parent scope to set
     */
    public void setParentScope(Scriptable parent) {
        this.parent = parent;
    }

     /**
     * Get an array of property ids.
     *
     * Not all property ids need be returned. Those properties
     * whose ids are not returned are considered non-enumerable.
     *
     * @return an array of Objects. Each entry in the array is either
     *         a java.lang.String or a java.lang.Number
     */
    public synchronized Object[] getIds() {
        String[] keys = getAllKeys();
        int size = keys.length + indexedProps.size();
        Object[] res = new Object[size];
        System.arraycopy(keys, 0, res, 0, keys.length);
        int i = keys.length;
        // now add all indexed properties
        for (Object index : indexedProps.keySet()) {
            res[i++] = index;
        }
        return res;
    }

    /**
     * Get the default value of the object with a given hint.
     * The hints are String.class for type String, Number.class for type
     * Number, Scriptable.class for type Object, and Boolean.class for
     * type Boolean. <p>
     *
     * A <code>hint</code> of null means "no hint".
     *
     * See ECMA 8.6.2.6.
     *
     * @param hint the type hint
     * @return the default value
     */
    public Object getDefaultValue(Class typeHint) {
        for (int i=0; i < 2; i++) {
            boolean tryToString;
            if (typeHint == ScriptRuntime.StringClass) {
                tryToString = (i == 0);
            } else {
                tryToString = (i == 1);
            }

            String methodName;
            Object[] args;
            if (tryToString) {
                methodName = "toString";
                args = ScriptRuntime.emptyArgs;
            } else {
                methodName = "valueOf";
                args = new Object[1];
                String hint;
                if (typeHint == null) {
                    hint = "undefined";
                } else if (typeHint == ScriptRuntime.StringClass) {
                    hint = "string";
                } else if (typeHint == ScriptRuntime.ScriptableClass) {
                    hint = "object";
                } else if (typeHint == ScriptRuntime.FunctionClass) {
                    hint = "function";
                } else if (typeHint == ScriptRuntime.BooleanClass
                           || typeHint == Boolean.TYPE)
                {
                    hint = "boolean";
                } else if (typeHint == ScriptRuntime.NumberClass ||
                         typeHint == ScriptRuntime.ByteClass ||
                         typeHint == Byte.TYPE ||
                         typeHint == ScriptRuntime.ShortClass ||
                         typeHint == Short.TYPE ||
                         typeHint == ScriptRuntime.IntegerClass ||
                         typeHint == Integer.TYPE ||
                         typeHint == ScriptRuntime.FloatClass ||
                         typeHint == Float.TYPE ||
                         typeHint == ScriptRuntime.DoubleClass ||
                         typeHint == Double.TYPE)
                {
                    hint = "number";
                } else {
                    throw Context.reportRuntimeError(
                        "Invalid JavaScript value of type " +
                        typeHint.toString());
                }
                args[0] = hint;
            }
            Object v = ScriptableObject.getProperty(this, methodName);
            if (!(v instanceof Function))
                continue;
            Function fun = (Function) v;
            Context cx = RhinoScriptEngine.enterContext();
            try {
                v = fun.call(cx, fun.getParentScope(), this, args);
            } finally {
                cx.exit();
            }
            if (v != null) {
                if (!(v instanceof Scriptable)) {
                    return v;
                }
                if (typeHint == ScriptRuntime.ScriptableClass
                    || typeHint == ScriptRuntime.FunctionClass)
                {
                    return v;
                }
                if (tryToString && v instanceof Wrapper) {
                    // Let a wrapped java.lang.String pass for a primitive
                    // string.
                    Object u = ((Wrapper)v).unwrap();
                    if (u instanceof String)
                        return u;
                }
            }
        }
        // fall through to error
        String arg = (typeHint == null) ? "undefined" : typeHint.getName();
        throw Context.reportRuntimeError(
                  "Cannot find default value for object " + arg);
    }

    /**
     * Implements the instanceof operator.
     *
     * @param instance The value that appeared on the LHS of the instanceof
     *              operator
     * @return true if "this" appears in value's prototype chain
     *
     */
    public boolean hasInstance(Scriptable instance) {
        // Default for JS objects (other than Function) is to do prototype
        // chasing.
        Scriptable proto = instance.getPrototype();
        while (proto != null) {
            if (proto.equals(this)) return true;
            proto = proto.getPrototype();
        }
        return false;
    }

    private String[] getAllKeys() {
        ArrayList<String> list = new ArrayList<String>();
        synchronized (context) {
            for (int scope : context.getScopes()) {
                Bindings bindings = context.getBindings(scope);
                if (bindings != null) {
                    list.ensureCapacity(bindings.size());
                    for (String key : bindings.keySet()) {
                        list.add(key);
                    }
                }
            }
        }
        String[] res = new String[list.size()];
        list.toArray(res);
        return res;
    }

   /**
    * We convert script values to the nearest Java value.
    * We unwrap wrapped Java objects so that access from
    * Bindings.get() would return "workable" value for Java.
    * But, at the same time, we need to make few special cases
    * and hence the following function is used.
    */
    private Object jsToJava(Object jsObj) {
        if (jsObj instanceof Wrapper) {
            Wrapper njb = (Wrapper) jsObj;
            /* importClass feature of ImporterTopLevel puts
             * NativeJavaClass in global scope. If we unwrap
             * it, importClass won't work.
             */
            if (njb instanceof NativeJavaClass) {
                return njb;
            }

            /* script may use Java primitive wrapper type objects
             * (such as java.lang.Integer, java.lang.Boolean etc)
             * explicitly. If we unwrap, then these script objects
             * will become script primitive types. For example,
             *
             *    var x = new java.lang.Double(3.0); print(typeof x);
             *
             * will print 'number'. We don't want that to happen.
             */
            Object obj = njb.unwrap();
            if (obj instanceof Number || obj instanceof String ||
                obj instanceof Boolean || obj instanceof Character) {
                // special type wrapped -- we just leave it as is.
                return njb;
            } else {
                // return unwrapped object for any other object.
                return obj;
            }
        } else { // not-a-Java-wrapper
            return jsObj;
        }
    }
}
