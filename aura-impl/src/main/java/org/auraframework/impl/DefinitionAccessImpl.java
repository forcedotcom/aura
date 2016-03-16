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
package org.auraframework.impl;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.List;

import org.auraframework.Aura;
import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

public class DefinitionAccessImpl implements DefinitionAccess {
    private static final long serialVersionUID = 8409052764733035151L;
    private static final String accessKey=Json.ApplicationKey.ACCESS.toString();

    static public DefinitionAccess defaultAccess(String namespace) {
        return new DefinitionAccessImpl(Aura.getConfigAdapter().isInternalNamespace(namespace));
    }

    public DefinitionAccessImpl(String namespace, String access) throws InvalidAccessValueException {
        this.namespace = namespace;
        this.accessString = access;
        this.isInternalNamespace = Aura.getConfigAdapter().isInternalNamespace(namespace);
        parseAccess(namespace, access);
        defaultAccess();
    }
    
    private DefinitionAccessImpl(boolean isInternalNamespace) {
        this.namespace = null;
        this.accessString = null;
        this.isInternalNamespace=isInternalNamespace;
        defaultAccess();
    }

    private void parseAccess(String namespace, String accessValue) throws InvalidAccessValueException {
        List<String> items = AuraTextUtil.splitSimpleAndTrim(accessValue, ",", 10);
        for (String item: items) {
            parseAccessItem(namespace, item);
        }
    }
    
    protected void parseAccessItem(String namespace, String item) throws InvalidAccessValueException {
        // See if we have authentication
        String ucItem = item.toUpperCase();
        try {
            Authentication auth = Authentication.valueOf(ucItem);
            if (authentication != null && auth != authentication) {
                throw new InvalidAccessValueException("Access attribute cannot specify both AUTHENTICATED and UNAUTHENTICATED");
            }
            authentication = auth;
            return;
        } catch (IllegalArgumentException e) {
            // continue to try other possibilities
        }
        
        // See if it is one of the scope constants
        try {
            Access acc = Access.valueOf(ucItem);
            if (access != null && access != acc) {
                throw new InvalidAccessValueException("Access attribute can only specify one of GLOBAL, PUBLIC, or PRIVATE"); // or internal or privileged
            }
            access = acc;
            return;
        } catch (IllegalArgumentException e) {
            // continue to try other possibilities
        }
        
        // Look for classname.methodname
        int dotPos = item.lastIndexOf('.');
        if (dotPos > 0) {
            String className = item.substring(0, dotPos);
            String methodName = item.substring(dotPos + 1);
            try {
                Class<?> clazz = Class.forName(className);
                Method meth = clazz.getMethod(methodName, new Class[0]);
                if (!Modifier.isStatic(meth.getModifiers())) {
                    throw new InvalidAccessValueException("\"" + item + "\" must be a static method");
                }
                Class<?> retType = meth.getReturnType();
                if (! Access.class.equals(retType)) {
                    throw new InvalidAccessValueException("\"" + item + "\" must return a result of type " + 
                        Access.class.getName());
                }   
                if (this.accessMethod != null) {
                    throw new InvalidAccessValueException("Access attribute may not specify more than one static method");
                }
                this.accessMethod = meth;
                return;
            } catch (ClassNotFoundException e) {
            } catch (SecurityException e) {
            } catch (NoSuchMethodException e) {
            }
            throw new InvalidAccessValueException("\"" + item + "\" is not a valid public method reference");
        }
        
        throw new InvalidAccessValueException("Invalid access attribute value \"" + item + "\"");
    }

    @Override
    public boolean requiresAuthentication() {
        return authentication == null || authentication == Authentication.AUTHENTICATED;
    }

    @Override
    public boolean isGlobal() {
        return getAccess() == Access.GLOBAL;
    }

    @Override
    public boolean isPublic() {
        return getAccess() == Access.PUBLIC;
    }

    @Override
    public boolean isPrivate() {
        return getAccess() == Access.PRIVATE;
    }

    @Override
    public boolean isPrivileged() {
        return getAccess() == Access.PRIVILEGED;
    }

    @Override
    public boolean isInternal() {
        return getAccess() == Access.INTERNAL;
    }

    @Override
    public void validate(String namespace, boolean allowAuth, boolean allowPrivate)
            throws InvalidAccessValueException {
        ConfigAdapter config=Aura.getConfigAdapter();
        boolean isInternalNamespace = config.isInternalNamespace(namespace);
        boolean isPrivilegedNamespace = config.isPrivilegedNamespace(namespace);
        if (authentication != null && (!allowAuth || !isInternalNamespace)) {
            throw new InvalidAccessValueException("Invalid access attribute value \"" + authentication.name() + "\"");
        }
        if (access == Access.PRIVATE  && !allowPrivate) {
            throw new InvalidAccessValueException("Invalid access attribute value \"" + access.name() + "\"");
        }
        if (access == Access.INTERNAL && !isInternalNamespace) {
            throw new InvalidAccessValueException("Invalid access attribute value \"" + access.name() + "\"");
        }
        if (access == Access.PRIVILEGED && !(isInternalNamespace || isPrivilegedNamespace)) {
            throw new InvalidAccessValueException("Invalid access attribute value \"" + access.name() + "\"");
        }
        if (access != null && accessMethod != null) {
            throw new InvalidAccessValueException("Access attribute may not specify \"" + access.name() + "\" when a static method is also specified");
        }
        if (!isInternalNamespace && accessMethod != null) {
            throw new InvalidAccessValueException("Access attribute may not use a static method");
        }
        
    }

    @Override
    public void serialize(Json json) throws IOException{
        if(this.isGlobal()) {
            // "G" - GLOBAL
            json.writeMapEntry(accessKey, 'G');
        }
        if(this.isPrivileged()){
            // "PP" - PRIVILEGED
            json.writeMapEntry(accessKey, "PP");
        }
        if(this.isPrivate()){
            // "p" - PRIVATE
            json.writeMapEntry(accessKey, 'p');
        }
        if(this.isPublic()||this.isInternal()){
            // "P" - PUBLIC, "I" - INTERNAL, "" - DEFAULT DEPENDING ON NAMESPACE
            Access defaultAccess=this.isInternalNamespace?Access.INTERNAL:Access.PUBLIC;
            Access currentAccess=getAccess();
            if(currentAccess!=defaultAccess){
                json.writeMapEntry(accessKey, currentAccess.name().charAt(0));
            }
        }
    }

    protected void defaultAccess() {
        // Default access if necessary
        if (access == null && accessMethod == null) {
            access = this.isInternalNamespace ? Access.INTERNAL : Access.PUBLIC;
        }
    }

    protected Access getAccess() {
        if (accessMethod != null) {
            try {
                return (Access) accessMethod.invoke(null);
            } catch (Exception e) {
                throw new AuraRuntimeException("Exception executing access-checking method " + 
                        accessMethod.getClass().getName() + "." + accessMethod.getName(), e); 
            }
        } else {
            return access;
        }
    }
    
    protected boolean isAccessSpecified() {
        return access != null || accessMethod != null;
    }

    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject();
        if (accessString != null) {
            try {
                parseAccess(namespace, accessString);
            } catch (InvalidAccessValueException iave) {
                throw new ClassNotFoundException("Unable to parse access", iave);
            }
        }
    }

    private Authentication authentication = null;
    private Access access = null;
    private transient Method accessMethod = null;
    private boolean isInternalNamespace=false;
    private final String namespace;
    private final String accessString;

}
