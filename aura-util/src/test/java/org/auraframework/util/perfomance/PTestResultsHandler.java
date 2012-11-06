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
package org.auraframework.util.perfomance;

import java.util.List;

import junit.framework.Test;

/**
 * This test util is based on JTroup's AbstractCadenceTest framework.
 * This class mirrors CadenceResultsHandler.
 *
 *
 *
 * @since 0.0.178
 */
public abstract class PTestResultsHandler {
    protected Test test;
    public PTestResultsHandler(Test test){
        this.test = test;
    }
    public abstract void handleResults(String testName, List<org.auraframework.util.perfomance.PTestGoogleChart.ChartPoint> dataPoints)throws Exception;
}
