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
package org.auraframework.test;

import org.auraframework.test.util.AuraPrivateAccessor;
import org.auraframework.util.ServiceLoader;
import org.auraframework.util.ServiceLocator;
import org.mockito.Mockito;

public class ServiceLocatorMocker {

	    /**
	     * Creates a Mockito mock of {@link ServiceLoader} and registers it with {@link ServiceLocator}, scoped to the 
	     * current thread.  This method is <i>not</i> idempotent, meaning that each call to <code>mockProviderFactory</code>
	     * will create a new mock object and overwrite any existing, registered mock.  There can only be at most one mocked 
	     * <code>ServiceLoader</code> for a given thread.
	     * <p>
	     * After calling this method, calls to {@link ServiceLocator#get()} <i>within the same thread</i> will return the 
	     * mocked <code>ServiceLoader</code> returned from this method call.
	     * 
	     * @return the mocked <code>ServiceLoader</code>
	     */
	    public static ServiceLoader mockServiceLocator() {
	        try {
	            ThreadLocal<ServiceLoader> alternateServiceLocator = AuraPrivateAccessor.get(ServiceLocator.class, 
	                    "alternateServiceLocator");
	            ServiceLoader mockedProviderFactory = Mockito.mock(ServiceLoader.class);
	            alternateServiceLocator.set(mockedProviderFactory);
	            return mockedProviderFactory;
	        } catch (Exception exception) {
	            throw new RuntimeException("Exception mocking ServiceLocator", exception);
	        }
	    }
	    
	    /**
	     * Resets {@link ServiceLocator}, clearing out - <i>for the current thread only</i> - the registered mock, if there
	     * <i>is</i> one registered.  If there <i>isn't</i> one registered, it's a no-op (and therefore, this method is
	     * idempotent).
	     * 
	     * @return the mock that was registered.  This could conceivably be helpful if, for example, you still want to do
	     *         some validation on the mock.
	     */
	    public static ServiceLoader unmockServiceLocator() {
	        try {
	            ThreadLocal<ServiceLoader> currentMock = AuraPrivateAccessor.get(ServiceLocator.class, 
	                    "alternateServiceLocator");
	            ServiceLoader mock = currentMock.get();
	            currentMock.set(null);
	            return mock;
	        } catch (Exception exception) {
	            throw new RuntimeException("Exception unmocking ServiceLocator", exception);
	        }
	    }
	    
	    /**
	     * Returns the mock {@link ServiceLoader} that's registered with {@link ServiceLocator} under the currently
	     * executing thread, or <code>null</code> if there isn't a mock currently registered.
	     */
	    public static ServiceLoader getMockedServiceLocator() {
	        try {
	            ThreadLocal<ServiceLoader> currentMock = AuraPrivateAccessor.get(ServiceLocator.class, 
	                    "alternateServiceLocator");
	            return currentMock.get();
	        } catch (Exception exception) {
	            throw new RuntimeException("Exception getting mocked ServiceLocator", exception);
	        }
	    }
	    
	    /**
	     * Returns <code>true</code> iff there is a mock {@link ServiceLoader} registered with {@link ServiceLocator}
	     * under the currently executing thread.
	     */
	    public static boolean isServiceLocatorMocked() {
	        return getMockedServiceLocator() != null;
	    }
	}

	
	

