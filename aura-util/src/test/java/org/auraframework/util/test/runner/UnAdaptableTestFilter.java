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


import org.auraframework.util.test.annotation.UnAdaptableTest;
import org.junit.runner.Description;
import org.junit.runner.manipulation.Filter;

public class UnAdaptableTestFilter extends Filter {
    @Override
    public boolean shouldRun(Description description) {
        if(description.getAnnotation(UnAdaptableTest.class) != null){
            System.out.println("XXXXXXXXXXXXXXXXX IGNORING " + description.getDisplayName());
            return false;
        }
        
        if (description.isTest()) {
            return true;
        }

        // explicitly check if any children want to run
        for (Description each : description.getChildren()) {
            if (shouldRun(each)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public String describe() {
        return "skip UnAdaptableTest tests";
    }
}
