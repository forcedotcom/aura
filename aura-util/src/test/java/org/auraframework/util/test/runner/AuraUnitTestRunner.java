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
package org.auraframework.util.test.runner;

import org.auraframework.util.test.annotation.XFailure;
import org.junit.Ignore;
import org.junit.internal.runners.model.EachTestNotifier;
import org.junit.runner.Description;
import org.junit.runner.notification.RunNotifier;
import org.junit.runners.BlockJUnit4ClassRunner;
import org.junit.runners.model.FrameworkMethod;
import org.junit.runners.model.InitializationError;
import org.junit.runners.model.Statement;

public final class AuraUnitTestRunner extends BlockJUnit4ClassRunner {

    private final String XFAILURE_SHOULD_BE_REMOVED = "Test passed when we expected it to fail! Congratulations, you can remove XFailure from the test and it will validate that it works from now on.";
    private final String XFAILURE_FAILED_FOR_ALTERNATE_REASON = "The XFailure test was expecting to either pass, or fail for a specific reason, but another error occurred. \nXFAILURE EXPECTED: %s \nACTUAL: %s";
    
	
	public AuraUnitTestRunner(Class<?> klass) throws InitializationError {
		super(klass);
	}

    @Override
    protected void runChild(final FrameworkMethod method, RunNotifier notifier) {
        Description description = describeChild(method);
        XFailure xfailure = method.getAnnotation(XFailure.class); 
        if (method.getAnnotation(Ignore.class) != null) {
            notifier.fireTestIgnored(description);
        } else if(xfailure != null) {
            runXFailTest(methodBlock(method), description, notifier, xfailure);
        } else {
        	runLeaf(methodBlock(method), description, notifier);
        }
    }
    
    private void runXFailTest(Statement statement, Description description, RunNotifier notifier, XFailure annotation) {
    	EachTestNotifier eachNotifier = new EachTestNotifier(notifier, description);
    	eachNotifier.fireTestStarted();
        try {
            statement.evaluate();
            
            // Since the test should fail, if it gets here we want to alert the developer that tests verifying this functionality 
            // are now passing and should be expected to pass in the future.
            eachNotifier.addFailure(new Error(XFAILURE_SHOULD_BE_REMOVED));
        } catch (Throwable e) {
            if(annotation.value() != null && e.getMessage() != null && annotation.value().length() > 0 && !e.getMessage().startsWith(annotation.value()))  {
                eachNotifier.addFailure(new Error(String.format(XFAILURE_FAILED_FOR_ALTERNATE_REASON, annotation.value(), e.getMessage()), e));
            }
        	// We want it to fail, it's treated as a PASS.
        } finally {
            eachNotifier.fireTestFinished();
        }
    }
   
}
