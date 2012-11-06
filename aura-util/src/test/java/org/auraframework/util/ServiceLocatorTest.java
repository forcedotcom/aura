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
package org.auraframework.util;

import java.util.Iterator;
import java.util.Set;

import org.auraframework.test.UnitTestCase;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.util.ServiceLocator.ServiceLocatorException;
import org.auraframework.util.sampleServices.AbstractService;
import org.auraframework.util.sampleServices.AbstractServiceImpl;
import org.auraframework.util.sampleServices.CyclicServicePartA;
import org.auraframework.util.sampleServices.DoubleExposureService;
import org.auraframework.util.sampleServices.DoubleExposureServiceImpl;
import org.auraframework.util.sampleServices.ExceptionInServiceImpl;
import org.auraframework.util.sampleServices.InheritanceChildImpl;
import org.auraframework.util.sampleServices.InheritanceChildService;
import org.auraframework.util.sampleServices.InheritanceParentImpl;
import org.auraframework.util.sampleServices.InheritanceParentService;
import org.auraframework.util.sampleServices.MultipleImplNoPrimaryService;
import org.auraframework.util.sampleServices.MultipleImplNoPrimaryServiceImpl1;
import org.auraframework.util.sampleServices.MultipleImplNoPrimaryServiceImpl2;
import org.auraframework.util.sampleServices.MultipleWith1PrimaryService;
import org.auraframework.util.sampleServices.MultipleWith1PrimaryServiceImpl1;
import org.auraframework.util.sampleServices.MultipleWith1PrimaryServiceImpl2;
import org.auraframework.util.sampleServices.MultipleWith2PrimaryService;
import org.auraframework.util.sampleServices.MultipleWith2PrimaryServiceImpl1;
import org.auraframework.util.sampleServices.MultipleWith2PrimaryServiceImpl2;
import org.auraframework.util.sampleServices.NamedService;
import org.auraframework.util.sampleServices.NamedServiceImpl1;
import org.auraframework.util.sampleServices.NamedServiceImpl2;
import org.auraframework.util.sampleServices.SelfImplementingChildService;
import org.auraframework.util.sampleServices.SelfImplementingService;
import org.auraframework.util.sampleServices.SimpleService;
import org.auraframework.util.sampleServices.SingleImplService;
import org.auraframework.util.sampleServices.SingleImplServiceImplementation;
import org.auraframework.util.sampleServices.UnimplementedService;

/**
 * Unit tests for {@link ServiceLocator}.
 */
@UnAdaptableTest
public class ServiceLocatorTest extends UnitTestCase {

    ServiceLocator s = ServiceLocator.get();
    /**
     * Verify that service instances are cached.
     */
    public void testServicesAreCached(){
        SingleImplService serviceImpl1 = s.get(SingleImplService.class);
        SingleImplService serviceImpl2 = s.get(SingleImplService.class);
        assertTrue("Service instance should be cached and reused.", serviceImpl1==serviceImpl2);
    }
    /**
     * Test that ServiceLocator can provide an implementation of Specified Interface.
     * If there are multiple implementations, then the implementation marked with @PrimaryImpl is used.
     * If there are multiple implementations but none marked as @PrimaryImpl, this would cause an exception.
     */
    public void testGet(){
        //1 An Interface with single implementation
        verifyServiceLocated(SingleImplService.class, SingleImplServiceImplementation.class);

        //2 An interface with multiple implementation and one of them marked as primary
        verifyServiceLocated(MultipleWith1PrimaryService.class, MultipleWith1PrimaryServiceImpl2.class);

        //3 An interface with multiple implementation and none marked as primary
        try{
            verifyServiceLocated(MultipleImplNoPrimaryService.class, MultipleImplNoPrimaryServiceImpl1.class);
            fail("Should not have allowed registration of more than one implementation");
        }catch(ServiceLocatorException e){
            //expected
        }

        //4 An interface with multiple implementation and more than one primary
        try{
            verifyServiceLocated(MultipleWith2PrimaryService.class, MultipleWith2PrimaryServiceImpl2.class);
            fail("Should not have aloud registration of more than one primary");
        }catch(ServiceLocatorException e){
            //expected
        }

        //5 An interface with single implementation but exposed twice
            //What if one of them is @PrimaryImpl
        try{
            verifyServiceLocated(DoubleExposureService.class,DoubleExposureServiceImpl.class);
            fail("Should not have aloud registration more than once");
        }catch(ServiceLocatorException e){
            //expected
        }

        //6 An interface with no implementations
        assertNull(s.get(UnimplementedService.class));

        //7 An abstract class with implementation
        verifyServiceLocated(AbstractService.class, AbstractServiceImpl.class);

        //8 A concrete Service class exposing itself
        //9 A concrete Service class exposing itself and also has children who are exposed to ServiceLocator.
        verifyServiceLocated(SelfImplementingService.class, SelfImplementingService.class);

        //10 Inheritance and service location
          //a. A parent Interface has a child interface, A class implementing the child interface, ServiceLocator trying to find implementations of Parent Interface
          //b. A parent Interface has a child interface and a class implementing it, the child interface also has a class implementing it. What does the ServiceLocator
            //fetch when asked for Implementation of parent interface and child interface
        try{
            verifyServiceLocated(InheritanceParentService.class, InheritanceChildImpl.class);
            fail("Should not have aloud registration of more than one implementor");
        }catch(ServiceLocatorException e){
            //expected
        }
        verifyServiceLocated(InheritanceChildService.class, InheritanceChildImpl.class);

        //11 Other boundary cases, like non static method, without @Impl annotation, public access qualifier, non-empty argument in configuration
        assertNull(s.get(SimpleService.class));
        try{
            s.get(ExceptionInServiceImpl.class);
            fail("Service registration method has an exception which should have been caught.");
        }catch(RuntimeException expected){
          assertNotNull(expected);
        }
        try{
            s.get(CyclicServicePartA.class);
            fail("Cyclic service reference wasn't handled.");
        }catch(RuntimeException expected){
            assertNotNull(expected);
        }
    }


    /**
     * Test that ServiceLocator can provide all implementations of Specified Interface.
     */
    public void testGetAll(){

        //1 An Interface with single implementation
        verifyAllServicesLocated(SingleImplService.class,new Class<?>[]{SingleImplServiceImplementation.class});

        //2 An interface with multiple implementation and one of them marked as primary
        verifyAllServicesLocated(MultipleWith1PrimaryService.class,new Class<?>[]{MultipleWith1PrimaryServiceImpl1.class, MultipleWith1PrimaryServiceImpl2.class});

        //3 An interface with multiple implementation and none marked as primary
        verifyAllServicesLocated(MultipleImplNoPrimaryService.class, new Class<?>[]{MultipleImplNoPrimaryServiceImpl1.class,MultipleImplNoPrimaryServiceImpl2.class});

        //4 An interface with multiple implementation and more than one primary
        verifyAllServicesLocated(MultipleWith2PrimaryService.class, new Class<?>[]{MultipleWith2PrimaryServiceImpl1.class, MultipleWith2PrimaryServiceImpl2.class});

        //5 An interface with single implementation but exposed twice
        verifyAllServicesLocated(DoubleExposureService.class,new Class<?>[]{DoubleExposureServiceImpl.class});

        //6 An interface with no implementations
        assertNotNull(s.getAll(UnimplementedService.class));
        assertEquals(0,s.getAll(UnimplementedService.class).size());

        //7 An abstract class with implementation
        verifyAllServicesLocated(AbstractService.class, new Class<?>[]{AbstractServiceImpl.class});

        //8 A concrete Service class exposing itself
        //9 A concrete Service class exposing itself and also has children who are exposed to ServiceLocator.
        verifyAllServicesLocated(SelfImplementingService.class, new Class<?>[]{SelfImplementingService.class, SelfImplementingChildService.class});

        //10 Inheritance and service location
          //a. A parent Interface has a child interface, A class implementing the child interface, ServiceLocator trying to find implementations of Parent Interface
          //b. A parent Interface has a child interface and a class implementing it, the child interface also has a class implementing it. What does the ServiceLocator
            //fetch when asked for Implementation of parent interface and child interface
        verifyAllServicesLocated(InheritanceParentService.class, new Class<?>[]{InheritanceChildImpl.class, InheritanceParentImpl.class});
        verifyAllServicesLocated(InheritanceChildService.class, new Class<?>[]{InheritanceChildImpl.class});

        //11 Other boundary cases, like non static method, without @Impl annotation, public access qualifier, non-empty argument in configuration
        assertEquals(0,s.getAll(SimpleService.class).size());
        try{
            s.getAll(ExceptionInServiceImpl.class);
            fail("Service registration method has an exception which should have been caught.");
        }catch(RuntimeException expected){
          assertNotNull(expected);
        }

        //12 Named services are also counter towards getAll()
        verifyAllServicesLocated(NamedService.class, new Class<?>[]{NamedServiceImpl1.class, NamedServiceImpl2.class});
    }
    /**
     * Test that ServiceLocator can provide all implementations of Specified Interface and name.
     */
    public void testGetWithName(){
        //1. A service interface having 2 implementation and one of them registered with a name, while the other has no name but marked as Primary
        NamedService ns = s.get(NamedService.class, "IGOTTANAME");
        assertNotNull(ns);
        assertTrue("Expected: NamedServiceImpl2 for service interface: NamedService but got: "+ns.getClass().getSimpleName()+".",
                ns instanceof NamedServiceImpl2);

        //2. Negative case:Make sure names are case sensitive
        assertNull(s.get(NamedService.class, "igoTTaName"));

        //3. Asking for a service interface which has not been registered with given name
         //a. In this case the service registration has only @Impl
        assertNull("There should have been no service registered with this name.",
                s.get(SingleImplService.class, "FooBarBeach"));
         //b. In this case the service registration has @Impl and @PrimaryImpl
        assertNull("There should have been no service registered with this name.",
                s.get(MultipleWith1PrimaryService.class, "FooBarBeach"));
        //4. Null for service name
        //NPE in google collection
        try{
            s.get(NamedService.class, null);
            fail("Should not be able to accept null for service implementation name.");
        }catch(RuntimeException expected){
        }
        //5. Valid name but not invalid service interface
            //There is no service registered to implement SimpleService with name "IGOTTANAME"
            //There's one service with that name but that implements NamedService
        assertNull(s.get(SimpleService.class, "IGOTTANAME"));
    }

    private<X,Y> void verifyServiceLocated(Class<X> serviceInterface, Class<Y> serviceProvider){
        X sis = s.get(serviceInterface);
        assertNotNull("Failed to locate the provider for service interface:"+serviceInterface.getSimpleName(), sis);
        assertTrue("Expected: "+serviceProvider.getSimpleName()+" for service interface: "+serviceInterface.getSimpleName()+", but got: "+sis.getClass().getSimpleName()+".",
                serviceProvider.isInstance(sis));
        assertEquals(serviceProvider.getSimpleName(),sis.getClass().getSimpleName());
    }

    private<X> void verifyAllServicesLocated(Class<X> serviceInterface, Class<?>[] serviceProviders){
        Set<X> sis = s.getAll(serviceInterface);
        assertNotNull("Failed to locate the provider for service interface:"+serviceInterface.getName(), sis);
        assertEquals("Number of service implementation expected("+serviceProviders.length+") and actual("+sis.size()+") differ.",
                serviceProviders.length, sis.size());
        for(int i=0; i<serviceProviders.length;i++){
            Iterator<X> it = sis.iterator();
            boolean flag = false;
            while(it.hasNext()){
                X item = it.next();
                if(serviceProviders[i].isInstance(item) && serviceProviders[i].getSimpleName().equals(item.getClass().getSimpleName())){
                    flag = true;
                    break;
                }
            }
            assertTrue("Failed to locate the provider "+serviceProviders[i].getSimpleName()+" for this service:"+serviceInterface.getSimpleName(), flag);
        }
    }

}
