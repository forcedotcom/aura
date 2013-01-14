/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.test.util;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.Arrays;

/**
 * Utility for getting at the private members and methods of a class for
 * testing.
 * 
 * 
 * @since 0.0.294
 */
public class AuraPrivateAccessor {

    // not constructed.
    private AuraPrivateAccessor() {
        super();
    }

    /**
     * Gets the value of the given field on the given object.
     * <p>
     * If you need the value of a static member, then you can pass in the class
     * of object you are trying to get at. ie:
     * <code>get(SomeClassName.class, "someFieldName")</code>.
     * 
     * @param object the object you want to get the value from
     * @param fieldName the name of the field you're looking up.
     * 
     * @return the value of the field. If the field is a primitive type, it will
     *         be returned as an object. Ie, <code>int</code>s are returned as
     *         <code>Integer</code>s.
     */
    public static <T> T get(Object object, String fieldName) throws Exception {
        if (object == null) {
            throw new IllegalArgumentException("object cannot be null");
        }
        if (fieldName == null) {
            throw new IllegalArgumentException("field name cannot be null");
        }

        Field field = getField(object, fieldName);
        return AuraPrivateAccessor.<T> get(object, field);
    }

    /**
     * Utility to get a field from a field name.
     */
    private static Field getField(Object object, String fieldName) throws NoSuchFieldException {
        Field field = null;
        if (object instanceof Class) {
            field = ((Class<?>) object).getDeclaredField(fieldName);
        } else {
            // recursively find the declaring class for this field
            Class<?> clazz = object.getClass();
            while (field == null) {
                try {
                    field = clazz.getDeclaredField(fieldName);
                } catch (NoSuchFieldException x) {
                    if (clazz.equals(Object.class)) {
                        throw x;
                    } else {
                        clazz = clazz.getSuperclass();
                    }
                }
            }
        }

        return field;
    }

    /**
     * Gets the value of the given field on the given object.
     * 
     * @param object the object you want to get the value from
     * @param field the field you're looking up.
     * 
     * @return the value of the field. If the field is a primitive type, it will
     *         be returned as an object. Ie, <code>int</code>s are returned as
     *         <code>Integer</code>s.
     */
    @SuppressWarnings("unchecked")
    public static <T> T get(Object object, Field field) throws Exception {
        if (object == null) {
            throw new IllegalArgumentException("object cannot be null");
        }
        if (field == null) {
            throw new IllegalArgumentException("field cannot be null");
        }

        boolean changedAccess = false;
        try {
            if (!field.isAccessible()) {
                field.setAccessible(true);
                changedAccess = true;
            }
            return (T) field.get(object);
        } finally {
            if (changedAccess) {
                field.setAccessible(false);
            }
        }
    }

    /**
     * Sets the value of the given field on the given object.
     * 
     * @param object the object you want to get the value from
     * @param fieldName the name of the field you're looking up.
     * @param value the value to set the field to.
     */
    @SuppressWarnings("unchecked")
    public static <T> T set(Object object, String fieldName, Object value) throws Exception {
        if (object == null) {
            throw new IllegalArgumentException("object cannot be null");
        }
        if (fieldName == null) {
            throw new IllegalArgumentException("field name cannot be null");
        }

        Field field = getField(object, fieldName);
        return (T) set(object, field, value);
    }

    /**
     * Sets the value of the given field on the given object.
     * 
     * @param object the object you want to get the value from
     * @param field the field you want to set the value of
     * @param value the value to set the field to.
     */
    @SuppressWarnings("unchecked")
    public static <T> T set(Object object, Field field, Object value) throws Exception {
        if (object == null) {
            throw new IllegalArgumentException("object cannot be null");
        }
        if (field == null) {
            throw new IllegalArgumentException("field cannot be null");
        }

        boolean changedAccess = false;
        try {
            if (!field.isAccessible()) {
                field.setAccessible(true);
                changedAccess = true;
            }
            T oldValue = (T) field.get(object);
            field.set(object, value);
            return oldValue;
        } finally {
            if (changedAccess) {
                field.setAccessible(false);
            }
        }
    }

    /**
     * Invokes the given method on the object if there is only one method with
     * that name and that number of arguments. If there is more than one method
     * with that name and number of arguments, you need to call invoke with
     * Class[].
     * 
     * @param object the object to invoke the method on
     * @param methodName the name of the method to invoke.
     * @param args the values of the arguments that the method takes.
     * 
     * @return the result of the invoked method
     */
    public static <T> T invoke(Object object, String methodName, Object... args) throws Exception {
        if (methodName == null) {
            throw new IllegalArgumentException("method name cannot be null");
        }

        Class<?> clazz;
        if (object instanceof Class) {
            clazz = (Class<?>) object;
        } else {
            clazz = object.getClass();
        }

        Method theMethod = null;
        while (clazz != null) {
            for (Method method : clazz.getDeclaredMethods()) {
                if (method.getName().equals(methodName) && method.getParameterTypes().length == args.length) {
                    if (theMethod == null) {
                        theMethod = method;
                    } else if (!Arrays.equals(method.getParameterTypes(), theMethod.getParameterTypes())) {
                        throw new IllegalArgumentException("more than one method named " + methodName + " on " + object);
                    }
                }
            }
            clazz = clazz.getSuperclass();
        }

        if (theMethod == null) {
            throw new NoSuchMethodException("no method named " + methodName + " on " + object);
        }

        return AuraPrivateAccessor.<T> invoke(object, theMethod, args);
    }

    /**
     * Invokes the given method on the object.
     * 
     * @param object the object to invoke the method on
     * @param methodName the name of the method to invoke.
     * @param paramTypes the types of arguments that method takes.
     * @param args the values of the arguments that the method takes.
     * 
     * @return the result of the invoked method
     */
    public static <T> T invoke(Object object, String methodName, Class<?>[] paramTypes, Object[] args) throws Exception {
        if (methodName == null) {
            throw new IllegalArgumentException("method name cannot be null");
        }

        Method method = null;
        if (object instanceof Class) {
            method = ((Class<?>) object).getDeclaredMethod(methodName, paramTypes);
        } else {
            // recursively find the declaring class
            Class<?> clazz = object.getClass();
            while (method == null) {
                try {
                    method = clazz.getDeclaredMethod(methodName, paramTypes);
                } catch (NoSuchMethodException x) {
                    if (clazz.equals(Object.class)) {
                        throw x;
                    } else {
                        clazz = clazz.getSuperclass();
                    }
                }
            }
        }

        return AuraPrivateAccessor.<T> invoke(object, method, args);
    }

    /**
     * Invokes the given method with no arguments on the object.
     * 
     * @param object the object to invoke the method on
     * @param methodName the name of the method to invoke.
     * 
     * @return the result of the invoked method
     */
    public static <T> T invoke(Object object, String methodName) throws Exception {
        return AuraPrivateAccessor.<T> invoke(object, methodName, new Class[0], new Object[0]);
    }

    /**
     * Invokes the given method on the object.
     * 
     * @param object the object to invoke the method on
     * @param method the method to invoke.
     * @param args the values of the arguments that the method takes.
     * 
     * @return the result of the invoked method
     */
    @SuppressWarnings("unchecked")
    public static <T> T invoke(Object object, Method method, Object[] args) throws Exception {
        if (method == null) {
            throw new IllegalArgumentException("method cannot be null");
        }
        if (!Modifier.isStatic(method.getModifiers()) && object == null) {
            throw new IllegalArgumentException("object cannot be null if method is not static, method: " + method);
        }

        boolean changedAccess = false;
        try {
            if (!method.isAccessible()) {
                method.setAccessible(true);
                changedAccess = true;
            }

            Object result = null;
            try {
                result = method.invoke(object, args);
            } catch (InvocationTargetException x) {
                handleInvocationTargetException(x);
            }
            return (T) result;
        } finally {
            if (changedAccess) {
                method.setAccessible(false);
            }
        }
    }

    /**
     * Allows you to construct the given class.
     */
    public static <T> T construct(Class<T> _class, Class<?>[] paramTypes, Object[] args) throws Exception {
        if (_class == null) {
            throw new IllegalArgumentException("class cannot be null");
        }

        Constructor<T> ctor = _class.getDeclaredConstructor(paramTypes);
        return construct(ctor, args);
    }

    /**
     * Allows you to construct the given class.
     */
    public static <T> T construct(Constructor<T> ctor, Object[] args) throws Exception {
        if (ctor == null) {
            throw new IllegalArgumentException("constructor cannot be null");
        }

        boolean changedAccess = false;
        if (!ctor.isAccessible()) {
            ctor.setAccessible(true);
            changedAccess = true;
        }

        T result = null;
        try {
            result = ctor.newInstance(args);
        } catch (InvocationTargetException x) {
            handleInvocationTargetException(x);
        } finally {
            if (changedAccess) {
                ctor.setAccessible(false);
            }
        }

        return result;
    }

    private static void handleInvocationTargetException(InvocationTargetException e) throws InvocationTargetException {
        // if the creation of the Object threw its own exception, we want to try
        // to map it properly
        Throwable t = e.getTargetException();
        if (t instanceof Error) {
            throw (Error) t;
        } else if (t instanceof RuntimeException) {
            throw (RuntimeException) t;
        } else {
            throw e;
        }
    }
}
