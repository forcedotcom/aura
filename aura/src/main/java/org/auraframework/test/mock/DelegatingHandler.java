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
import java.lang.reflect.Proxy;

public class DelegatingHandler implements InvocationHandler {
    private final Object delegate;

    public DelegatingHandler(Object delegate) {
        this.delegate = delegate;
    }

    @Override
    public Object invoke(Object object, Method method, Object[] args) throws Throwable {
        return method.invoke(delegate, args);
    }
    
    /**
    * If you try to execute a method, and it is NOT part of THIS stub, then I want to call the "original" controller method. 
    * 
    * testA mocks
    *  getFirst
    *  getLast
    * 
    * testB mocks
    *  getFirst
    * 
    * when testB calls getLast, it was sometimes ending up calling the mock of getLast from testA.
    * 
    * This change fixes that, and makes testing with multiple stubs of actions a more trustworthy means of testing.
     * @param <D>
    */
    @SuppressWarnings("unchecked")
    public static <D> D getSourceDelegate(D value) {
        if (Proxy.isProxyClass(value.getClass())) {
            Object handler = Proxy.getInvocationHandler(value);
            if (handler instanceof DelegatingHandler) {
                return (D) getSourceDelegate(((DelegatingHandler) handler).delegate);
            }
        }
        return value;
    }
}
