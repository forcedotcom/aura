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
package org.auraframework.impl.system;

import java.io.File;
import java.net.URL;
import java.util.*;
import java.util.concurrent.TimeUnit;

import junit.framework.TestSuite;

import org.auraframework.Aura;
import org.auraframework.def.ComponentDef;
import org.auraframework.def.DefDescriptor;
import org.auraframework.impl.AuraImpl;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.system.*;
import org.auraframework.system.AuraContext.Access;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.util.perfomance.PTestGoogleChart.ChartPoint;
import org.auraframework.util.perfomance.PerformanceTestUtil;

import com.google.common.base.Stopwatch;

/**
 * To run the test:
 * Find CachingDefRegistryImplPerformanceTest.java in eclipse. Right click and Debug As -> JUnit Test.
 * A more organized way of running it is from Eclipse:
 * Run -> Debug Configuration - > JUnit -> Right click -> New
 * Give a name to your JUnit target, select project as aura-impl, Test class CachingDefRegistryImplPerformanceTest
 * Arguments: -Daura.home=<git base directory>
 * Debug!!
 *
 *
 *
 * @since 0.0.178
 */
@UnAdaptableTest
public class CachingDefRegistryImplPerformanceTest extends TestSuite {

    public static TestSuite suite(){
        TestSuite suite = new TestSuite(SimpleComponent.class,EquallySizedBigComponent.class,LinearlyGrowingComponent.class);
        return suite;
    }
    /**
     * Test suite which has components with simple markup.
     */
    public static class SimpleComponent extends CachingDefRegistryImplPerformanceTestCases {
        public SimpleComponent(String name){
            super(name);
        }
        @Override
        public String computeNewMarkup() {
            return markup;
        }
        /**
         * Test case to measure time spent to access the same non existing def (should take constant time(miniscual))
         * Once a descriptor is checked for existence, the information should be cached and subsequent requests should take a very small time.
         * after the first request.
         * @throws Exception
         */
        public void testExistsCache_FetchSameNonExistingFileBasedComponent() throws Exception{
            cmpName = cmpName + System.currentTimeMillis();
            DefDescriptor<ComponentDef> dd = definitionService.getDefDescriptor("aura:nonExisting"+System.currentTimeMillis(),
                    ComponentDef.class);
            for (int i = 0; i < CachingDefRegistryImpl.CACHE_SIZE_MAX * sizeFactor; i++) {
                markup = computeNewMarkup();
                DefDescriptor<ComponentDef> dummyCmps = auraTestingUtil.addSource(cmpName + "_" + i, markup,
                        ComponentDef.class);
                //Getting def is a good way to fill up the CachingDefRegistryImpl.existsCache
                dummyCmps.getDef();
                sw.start();
                dd.exists();
                sw.stop();
                if(i%samplingRate == 0){
                    //Total number of components
                    metrics.add(new ChartPoint(""+(i+1), sw.elapsedTime(TimeUnit.MICROSECONDS)));
                }
                sw.reset();
            }
            ptestUtil.handleResults(getName(), metrics);
        }
        /**
         * Test case to measure time spent to access a new non existing def.
         * @throws Exception
         */
        public void testExistsCache_FetchNewNonExistingFileBasedComponent() throws Exception{
            cmpName = cmpName + System.currentTimeMillis();
            for (int i = 0; i < CachingDefRegistryImpl.CACHE_SIZE_MAX * sizeFactor; i++) {
                DefDescriptor<ComponentDef> dd = definitionService.getDefDescriptor("aura:nonExisting"+System.nanoTime(),
                        ComponentDef.class);
                markup = computeNewMarkup();
                DefDescriptor<ComponentDef> dummyCmps = auraTestingUtil.addSource(cmpName + "_" + i, markup,
                        ComponentDef.class);
                //Getting def is a good way to fill up the CachingDefRegistryImpl.existsCache
                dummyCmps.getDef();
                sw.start();
                dd.exists();
                sw.stop();
                if(i%samplingRate == 0){
                    //Total number of components
                    metrics.add(new ChartPoint(""+(i+1), sw.elapsedTime(TimeUnit.MICROSECONDS)));
                }
                sw.reset();
            }
            ptestUtil.handleResults(getName(), metrics);
        }
    }

    /**
     * Test suite which has components with 25 facets.
     */
    public static class EquallySizedBigComponent extends CachingDefRegistryImplPerformanceTestCases {
        int facetCount = 25;
        public EquallySizedBigComponent(String name){
            super(name);
        }
        @Override
        public void setUp() throws Exception {
            super.setUp();
            markup = "<aura:component> %s </aura:component>";
            for (int i = 0; i < 25; i++) {
                DefDescriptor<ComponentDef> facetCmps = auraTestingUtil.addSource(markup, ComponentDef.class);
                markup = String.format(markup, "<" + facetCmps.getNamespace() + ":" + facetCmps.getName() + "/> %s");
            }
        }
        @Override
        public String computeNewMarkup() {
            return markup;
        }
    }
    /**
     * Test suite which has components whose facet size grows linearly.
     */
    public static class LinearlyGrowingComponent extends CachingDefRegistryImplPerformanceTestCases {
        int index = 0 ;
        public LinearlyGrowingComponent(String name){
            super(name);
        }
        @Override
        public void setUp() throws Exception {
            super.setUp();
            markup = "<aura:component> %s </aura:component>";
            index = 0;
            sizeFactor = 0.5;
        }
        @Override
        public String computeNewMarkup() {
            if(index!=0){
                markup = String.format(markup, "<string:" +cmpName+"_"+index+ "/> %s");
            }
            index++;
            return markup;
        }
    }

    /**
     * Test cases to fill up the caching def registry for components and access definitions.
     * Test case 1 : Access a new def each time
     * Test case 2 : Fetch the same component def as the cache fills up. Typically depicts a frequently used component scenario.
     * Test case 3 : Randomly choose a definition to fetch.
     */
    private static abstract class CachingDefRegistryImplPerformanceTestCases extends AuraImplTestCase {
        protected List<ChartPoint> metrics;
        protected String markup = "<aura:component> </aura:component>";
        //By how many folds do you want to fill up the cache.
        protected double sizeFactor = 3;
        protected final int samplingRate = 50;
        protected String cmpName = getName();
        protected Stopwatch sw = new Stopwatch();
        PerformanceTestUtil ptestUtil;

        public CachingDefRegistryImplPerformanceTestCases(String name){
            // The behavior of caching Def registry changes based on Context.
            // So it is necessary to let each test case set its own context
            super(name, false);
            URL resultsURL = getClass().getResource("/results/"+this.getClass().getSimpleName());
            File resultsDir = null;
            if (resultsURL != null) {
                if ("file".equals(resultsURL.getProtocol())) {
                    String devPath = resultsURL.getPath().replaceFirst("/target/test-classes/", "/test/");
                    resultsDir = new File(devPath);
                    assert(resultsDir.exists());
                }
            }else{
                resultsURL = getClass().getResource("/results/");
                String devPath = resultsURL.getPath().replaceFirst("/target/test-classes/", "/test/");
                resultsDir = new File(devPath+this.getClass().getSimpleName());
                if (!resultsDir.exists())
                    resultsDir.mkdir();
            }
            ptestUtil = new PerformanceTestUtil(this, resultsDir);
        }

        @Override
        public void setUp() throws Exception {
            super.setUp();
            // Establish a PROD context
            Aura.getContextService().startContext(Mode.PROD, null, Format.JSON, Access.AUTHENTICATED, laxSecurityApp);
            // create an cmp to initialize everything
            DefDescriptor<ComponentDef> dummyCmps = auraTestingUtil.addSource(cmpName + "_initial", markup,
                    ComponentDef.class);
            dummyCmps.getDef();
            metrics = new ArrayList<ChartPoint>();
        }

        @Override
        public void tearDown() throws Exception {
            AuraContext c = AuraImpl.getContextAdapter().getCurrentContext();
            MasterDefRegistryImpl mdr = (MasterDefRegistryImpl) c.getDefRegistry();
            DefRegistry<?>[] regs = mdr.getAllRegistries();
            for (DefRegistry<?> r : regs) {
                r.clear();
            }
            super.tearDown();
        }

        /**
         * This test case compares the time required to fetch new defs as the total number of defs in the registry
         * increases 3 folds.
         *
         * @throws Exception
         */
        public void testCache_FetchNewComponentEachTime() throws Exception {
            cmpName = cmpName + System.currentTimeMillis();
            for (int i = 0; i < CachingDefRegistryImpl.CACHE_SIZE_MAX * sizeFactor; i++) {
                markup = computeNewMarkup();
                DefDescriptor<ComponentDef> dummyCmps = auraTestingUtil.addSource(cmpName + "_" + i, markup,
                        ComponentDef.class);
                sw.start();
                dummyCmps.getDef();
                sw.stop();
                if(i%samplingRate == 0){
                    //Total number of components
                    metrics.add(new ChartPoint(""+(i+1), sw.elapsedTime(TimeUnit.MICROSECONDS)));
                }
                sw.reset();
            }
            ptestUtil.handleResults(getName(), metrics);
        }

        /**
         * This test case compares the time required to fetch the same def as the total number of defs in the registry
         * increases 3 folds.
         *
         * @throws Exception
         */
        public void testCache_FetchSameComponentEachTime() throws Exception {
            cmpName = cmpName + System.currentTimeMillis();
            DefDescriptor<ComponentDef> dd = definitionService.getDefDescriptor("string:" + cmpName + "_0",
                    ComponentDef.class);

            for (int i = 0; i < CachingDefRegistryImpl.CACHE_SIZE_MAX* sizeFactor; i++) {
                markup = computeNewMarkup();
                DefDescriptor<ComponentDef> dummyCmps = auraTestingUtil.addSource(cmpName + "_" + i, markup,
                        ComponentDef.class);
                dummyCmps.getDef();

                // Have to stop and start context because a given def is cached in MasterDefRegistry per request
                // (context of the request)
                Aura.getContextService().endContext();
                Aura.getContextService().startContext(Mode.PROD, null, Format.JSON, Access.AUTHENTICATED,
                        laxSecurityApp);

                sw.start();
                dd.getDef();
                sw.stop();
                if(i%samplingRate == 0){
                    //Total number of components
                    metrics.add(new ChartPoint(""+(i+1), sw.elapsedTime(TimeUnit.MICROSECONDS)));
                }
                sw.reset();
            }
            ptestUtil.handleResults(getName(), metrics);
        }

        /**
         * This test case compares the time required to fetch a random def as the total number of defs in the registry
         * increase 3 folds.
         */
        public void testCache_FetchRandomComponentEachTime() throws Exception {
            cmpName = cmpName + System.currentTimeMillis();
            Random r = new Random();
            for (int i = 0; i < CachingDefRegistryImpl.CACHE_SIZE_MAX * sizeFactor; i++) {
                markup = computeNewMarkup();
                DefDescriptor<ComponentDef> cmp = auraTestingUtil.addSource(cmpName + "_" + i, markup,
                        ComponentDef.class);
                cmp.getDef();

                // Have to stop and start context because a given def is cached in MasterDefRegistry per request
                // (context of the request)
                Aura.getContextService().endContext();
                Aura.getContextService().startContext(Mode.PROD, null, Format.JSON, Access.AUTHENTICATED,
                        laxSecurityApp);
                String cmpTobeFetched = "string:" + cmpName + "_" + r.nextInt(i + 1);
                DefDescriptor<ComponentDef> dd = definitionService.getDefDescriptor(cmpTobeFetched, ComponentDef.class);
                sw.start();
                dd.getDef();
                sw.stop();
                if(i%samplingRate == 0){
                    //Total number of components
                    metrics.add(new ChartPoint(""+(i+1), sw.elapsedTime(TimeUnit.MICROSECONDS)));
                }
                sw.reset();
            }
            ptestUtil.handleResults(getName(), metrics);
        }

        /**
         * Method to control the new defs going into cache
         */
        public abstract String computeNewMarkup();
    }
}
