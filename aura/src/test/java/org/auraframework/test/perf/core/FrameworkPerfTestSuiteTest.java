package org.auraframework.test.perf.core;

import java.util.Enumeration;
import java.util.Set;

import junit.framework.Test;
import junit.framework.TestSuite;

import org.auraframework.test.TestInventory;
import org.auraframework.test.TestInventory.Type;
import org.auraframework.test.annotation.PerfTestSuite;
import org.auraframework.test.annotation.UnAdaptableTest;
import org.auraframework.util.ServiceLocator;

@UnAdaptableTest
@PerfTestSuite
public class FrameworkPerfTestSuiteTest extends TestSuite {
	public static TestSuite suite() throws Exception {
		TestSuite suite = new TestSuite();
		if (System.getProperty("skipFrameworkPerfTests") != null) {
			System.out.println("Skipping Framework Perf Tests");
			return suite;
		}
		System.out.println("Bootstrapping Framework Perf Tests");
		Set<TestInventory> inventories = ServiceLocator.get().getAll(TestInventory.class);
		
		// Get all the performance tests that extend from the framework class
		for (TestInventory inventory : inventories) {
            TestSuite child = inventory.getTestSuite(Type.PERFCMP);
            if (child != null ) {
                for (Enumeration<?> tests = child.tests(); tests.hasMoreElements();) {
                	Test next = (Test)tests.nextElement();
                	if (FrameworkPerfAbstractTestCase.class.isAssignableFrom(next.getClass())) {
                		System.out.println("Adding Framework TestCase:" + next.toString());
                		suite.addTest(next);
                	}
                }
            }
        }
        suite.setName("Framework Perf tests");
        return suite;
    }
}
