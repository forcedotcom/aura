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
package org.auraframework.impl.adapter;

import org.auraframework.adapter.BeanAdapter;
import org.auraframework.def.JavaControllerDef;
import org.auraframework.def.JavaModelDef;

import org.auraframework.system.Location;

import org.auraframework.throwable.AuraRuntimeException;
import org.auraframework.throwable.quickfix.InvalidDefinitionException;
import org.auraframework.throwable.quickfix.QuickFixException;

/**
 * An implementation for the Bean Adapter for internal use.
 */
public class BeanAdapterImpl implements BeanAdapter {
    @Override
    public void validateModelBean(JavaModelDef def) throws QuickFixException {
        validateConstructor(def.getJavaType());
    }

    @Override
    public Object getModelBean(JavaModelDef def) {
        return buildValidatedClass(def.getJavaType());
    }

    @Override
    public void validateControllerBean(JavaControllerDef def) throws QuickFixException {
        validateConstructor(def.getJavaType());
    }

    @Override
    public Object getControllerBean(JavaControllerDef def) {
        // FIXME: need to store on context.
        return buildValidatedClass(def.getJavaType());
    }

    private static void throwConstructorError(String message, Class<?> clazz) throws QuickFixException {
        throw new InvalidDefinitionException(message,
                new Location("java://" + clazz.getCanonicalName(), 0));
    }

    /**
     * Validate that a default constructor exists and is accessible with no parameters.
     *
     * Note that this does not validate that the class can be constructed (e.g. it can throw
     * an exception during construction and fail that way).
     *
     * @param clazz the class to validate
     * @throws QuickFixException if the constructor is not present or accessible.
     */
    public static void validateConstructor(Class<?> clazz) throws QuickFixException {
        try {
            // Do the obvious check first, and if it fails, go on and do more work.
            clazz.getConstructor();
        } catch (NoSuchMethodException nsme) {
            //
            // If we found no public constructor, try to be more informative.
            //
            try {
                clazz.getDeclaredConstructor();
                // whoops, must be non public.
                throwConstructorError("Default constructor is not public.", clazz);
            } catch (NoSuchMethodException nsme2) {
                // no constructor.
                throwConstructorError("No default constructor found.", clazz);
            }
        } catch (SecurityException se) {
            // no constructor.
            throwConstructorError("Class is not accessible.", clazz);
        }
    }

    /**
     * Build an object for a class that was previously validated by {@link #validateConstructor()}.
     *
     * If the object would not pass validation, an exception will be generated.
     *
     * @param clazz the class to build
     * @throws AuraRuntimeException if the constructor cannot be invoked.
     */
    public static Object buildValidatedClass(Class<?> clazz) {
        try {
            return clazz.newInstance();
        } catch (InstantiationException ie) {
            // This should never happen...
            throw new AuraRuntimeException(ie);
        } catch (IllegalAccessException iae) {
            throw new AuraRuntimeException(iae);
        }
    }
}
