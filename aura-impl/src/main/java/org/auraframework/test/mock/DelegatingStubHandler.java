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
package org.auraframework.test.mock;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.util.List;

import org.auraframework.test.Resettable;

/**
 * This is a handler for invocations to a Proxy object, that will use provided Stub overrides if available, but default
 * to the provided delegate's default methods otherwise.
 */
public class DelegatingStubHandler implements InvocationHandler {
    private final Object delegate;
    private final List<Stub<?>> stubs;

    public DelegatingStubHandler(Object delegate, List<Stub<?>> stubs) {
        this.delegate = delegate;
        this.stubs = stubs;
    }

    public void reset() {
        for (Stub<?> stub : stubs) {
            stub.reset();
        }
    }

    @Override
    public Object invoke(Object object, Method method, Object[] args) throws Throwable {

        // check for Resettable.reset() call
        if (method.getName().equals("reset") && method.getDeclaringClass().equals(Resettable.class)) {
            reset();
            return null;
        }

        // check if a matching stub has been defined
        for (Stub<?> stub : stubs) {
            Invocation invocation = stub.getInvocation();
            if (invocation.matches(method, args)) {
                return stub.getNextAnswer().answer();
            }
        }

        // else, use the delegate's "default" method
        return method.invoke(delegate, args);
    }
}
