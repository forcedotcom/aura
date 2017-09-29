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

import org.auraframework.adapter.ConfigAdapter;
import org.auraframework.def.DefinitionAccess;
import org.auraframework.system.AuraContext;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidAccessValueException;
import org.auraframework.util.AuraTextUtil;
import org.auraframework.util.json.Json;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class DefinitionAccessImpl implements DefinitionAccess {
    private static final long serialVersionUID = 8409052764733035151L;
    private static final String accessKey=Json.ApplicationKey.ACCESS.toString();
    private Authentication authentication = null;
    private Access access = null;
    private transient Method accessMethod = null;
    protected boolean isInternalNamespace=false;
    private String methodString;
    private final String accessString;
   
    private static final Map<String, Access> ACCESS_MAP;
    private static final Map<String, Authentication> AUTHENTICATION_MAP ;
    static {
        ACCESS_MAP = Stream.of(Access.values()).collect(Collectors.toMap(Access::name, Function.identity()));
        AUTHENTICATION_MAP = Stream.of(Authentication.values()).collect(Collectors.toMap(Authentication::name, Function.identity()));
    }

    public DefinitionAccessImpl(AuraContext.Access access) {
        assert access != null : "You must specify the access level, null is not allowed.";
        this.accessString = access.toString();
        this.access = access;
        this.methodString = null;
    }

    public DefinitionAccessImpl(String namespace, String access, boolean isInternalNamespace) throws InvalidAccessValueException {
        assert access != null : "You must specify the access level, null is not allowed.";
        this.accessString = access;
        this.isInternalNamespace = isInternalNamespace;
        this.methodString = null;
        parseAccess(namespace, access);
        defaultAccess(this.isInternalNamespace);
    }

    private void parseAccess(String namespace, String accessValue) throws InvalidAccessValueException {
        List<String> items = AuraTextUtil.splitSimpleAndTrim(accessValue, ",", 10);
        for (String item : items) {
            parseAccessItem(namespace, item);
        }
    }
    
    protected void parseAccessItem(String namespace, String item) throws InvalidAccessValueException {
        String ucItem = item.toUpperCase();
        
        // See if we have authentication
        final Authentication auth = AUTHENTICATION_MAP.get(ucItem);
        if(auth != null) {
            if (authentication != null && auth != authentication) {
                throw new InvalidAccessValueException("Access attribute cannot specify both AUTHENTICATED and UNAUTHENTICATED");
            }
            authentication = auth;
            return;
        }
        
        // See if it is one of the scope constants
        final Access acc = ACCESS_MAP.get(ucItem);
        if(acc != null) {
            if (access != null && access != acc) {
                throw new InvalidAccessValueException("Access attribute can only specify one of GLOBAL, PUBLIC, or PRIVATE"); // or internal or privileged
            }
            access = acc;
            return;
        }
        
        // Look for classname.methodname
        int dotPos = item.lastIndexOf('.');
        if (dotPos > 0) {
            if (methodString != null) {
                throw new InvalidAccessValueException("Access attribute may not specify more than one static method");
            }
            methodString = item;
            return;
        }
        throw new InvalidAccessValueException("Invalid access attribute value \"" + item + "\"");
    }

    @Override
    public boolean requiresAuthentication() {
        return authentication == null || authentication == Authentication.AUTHENTICATED;
    }

    @Override
    public boolean isGlobal() {
        return getAccess().equals(Access.GLOBAL);
    }

    @Override
    public boolean isPublic() {
        return getAccess().equals(Access.PUBLIC);
    }

    @Override
    public boolean isPrivate() {
        return getAccess().equals(Access.PRIVATE);
    }

    @Override
    public boolean isPrivileged() {
        return getAccess().equals(Access.PRIVILEGED);
    }

    @Override
    public boolean isInternal() {
        return getAccess().equals(Access.INTERNAL);
    }

    @Override
    public void validateReferences() throws InvalidAccessValueException {
        if (methodString != null && accessMethod == null) {
            int dotPos = methodString.lastIndexOf('.');
            String className = methodString.substring(0, dotPos);
            String methodName = methodString.substring(dotPos + 1);
            try {
                Class<?> clazz = Class.forName(className);
                Method meth = clazz.getMethod(methodName, new Class[0]);
                if (!Modifier.isStatic(meth.getModifiers())) {
                    throw new InvalidAccessValueException("\"" + methodString + "\" must be a static method");
                }
                Class<?> retType = meth.getReturnType();
                if (! Access.class.equals(retType)) {
                    throw new InvalidAccessValueException("\"" + methodString + "\" must return a result of type " + 
                        Access.class.getName());
                }   
                this.accessMethod = meth;
                return;
            } catch (ClassNotFoundException | SecurityException | NoSuchMethodException ignored) {
            }
            throw new InvalidAccessValueException("\"" + methodString + "\" is not a valid public method reference");
        }
    }

    @Override
    public void validate(String namespace, boolean allowAuth, boolean allowPrivate, ConfigAdapter configAdapter)
            throws InvalidAccessValueException {
        boolean isInternalNamespace = configAdapter.isInternalNamespace(namespace);
        boolean isPrivilegedNamespace = configAdapter.isPrivilegedNamespace(namespace);
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
        if (access != null && methodString != null) {
            throw new InvalidAccessValueException("Access attribute may not specify \"" + access.name() + "\" when a static method is also specified");
        }
        if (!isInternalNamespace && methodString != null) {
            throw new InvalidAccessValueException("Access attribute may not use a static method");
        }
    }

    @Override
    public void serialize(Json json) throws IOException {
        String accessCode = getAccessCode();
        if (accessCode != null) {
            json.writeMapEntry(accessKey, accessCode);
        }
    }

    @Override
    public String getAccessCode() {
        if(this.isGlobal()) {
            // "G" - GLOBAL
            return "G";
        }
        if(this.isPrivileged()){
            // "PP" - PRIVILEGED
            return "PP";
        }
        if(this.isPrivate()){
            // "p" - PRIVATE
            return "p";
        }
        if(this.isPublic()||this.isInternal()){
            // "P" - PUBLIC, "I" - INTERNAL, "" - DEFAULT DEPENDING ON NAMESPACE
            Access defaultAccess=this.isInternalNamespace?Access.INTERNAL:Access.PUBLIC;
            Access currentAccess=getAccess();
            if(currentAccess!=defaultAccess){
                return currentAccess.name().substring(0, 1);
            }
        }

        return null;
    }


    protected void defaultAccess(boolean internalNamespace) {
        // Default access if necessary
        if (access == null && methodString == null) {
            access = internalNamespace ? Access.INTERNAL : Access.PUBLIC;
        }
    }

    protected Access getAccess() {
        if (methodString != null && accessMethod == null) {
            try {
                validateReferences();
            } catch (InvalidAccessValueException iave) {
                throw new AuraRuntimeException("unable to handle access name", iave);
            }
        }
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
        return access != null || methodString != null;
    }

    @Override
    public String toString() {
        return accessString;
    }

    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject();
    }
}
