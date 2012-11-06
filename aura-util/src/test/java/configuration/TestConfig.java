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
package configuration;

import org.auraframework.util.ServiceLoaderImpl.Impl;
import org.auraframework.util.ServiceLoaderImpl.AuraConfiguration;
import org.auraframework.util.ServiceLoaderImpl.PrimaryImpl;
import org.auraframework.util.sampleServices.*;

/**
 * @since 0.0.246
 */
@AuraConfiguration
public class TestConfig {

    @Impl
    public static SingleImplService singleImplService(){
        return new SingleImplServiceImplementation();
    }
    @Impl
    public static MultipleImplNoPrimaryService multipleImplService2(){
        return new MultipleImplNoPrimaryServiceImpl2();
    }
    @Impl
    public static MultipleImplNoPrimaryService multipleImplService1(){
        return new MultipleImplNoPrimaryServiceImpl1();
    }

    @Impl
    public static MultipleWith1PrimaryService impl1(){
        return new MultipleWith1PrimaryServiceImpl1();
    }
    @Impl
    @PrimaryImpl
    public static MultipleWith1PrimaryService impl2(){
        return new MultipleWith1PrimaryServiceImpl2();
    }

    @Impl
    @PrimaryImpl
    public static MultipleWith2PrimaryService impl3(){
        return new MultipleWith2PrimaryServiceImpl2();
    }
    @Impl
    @PrimaryImpl
    public static MultipleWith2PrimaryService impl4(){
        return new MultipleWith2PrimaryServiceImpl1();
    }

    @Impl
    @PrimaryImpl
    public static DoubleExposureService impl5(){
        return DoubleExposureServiceImpl.getInstance();
    }

    @Impl
    @PrimaryImpl
    public static DoubleExposureService impl6(){
        return DoubleExposureServiceImpl.getInstance();
    }

    @Impl
    public static AbstractService impl7(){
        return new AbstractServiceImpl();
    }

    @Impl
    @PrimaryImpl
    public static SelfImplementingService impl8(){
        return new SelfImplementingService();
    }

    @Impl
    public static SelfImplementingService impl9(){
        return new SelfImplementingChildService();
    }

    @Impl
    @PrimaryImpl
    public static InheritanceChildService impl10(){
        return new InheritanceChildImpl();
    }

    @Impl
    @PrimaryImpl
    public static InheritanceParentService impl11(){
        return new InheritanceParentImpl();
    }

    @Impl
    @PrimaryImpl
    public static LocalPrimaryService impl19(){
        return new LocalPrimaryServiceImpl();
    }
    /**
     * Negative test cases
     */
    //Missing @Impl annotation
    public static SimpleService impl12(){
        return new SimpleServiceImpl();
    }
    // Non static method
    @Impl
    public SimpleService impl13(){
        return new SimpleServiceImpl();
    }
    //Non public access specified
    @Impl
    protected static SimpleService impl14(){
        return new SimpleServiceImpl();
    }
    //Function accepting argument
    @Impl
    protected static SimpleService impl15(String s){
        return new SimpleServiceImpl();
    }
    //Exception in method
    @Impl
    public static ExceptionInServiceImpl impl16()throws Exception{
        throw new Exception();
    }
    //With missing @Impl annotation
    @PrimaryImpl
    public static SimpleService impl16a(){
        return new SimpleServiceImpl();
    }

    @Impl
    public static CyclicServicePartA impl20() throws Exception{
        return new CyclicServicePartAImpl();
    }
    @Impl
    public static CyclicServicePartB impl21() throws Exception{
        return new CyclicServicePartBImpl();
    }
    /**
     * End of negative test cases
     */

    /**
     * Named registration.
     */
    @PrimaryImpl
    @Impl
    public static NamedService impl17(){
        return new NamedServiceImpl1();
    }
    @Impl(name="IGOTTANAME")
    public static NamedService impl18(){
        return new NamedServiceImpl2();
    }
}

