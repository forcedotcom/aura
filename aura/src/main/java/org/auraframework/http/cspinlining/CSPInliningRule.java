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
package org.auraframework.http.cspinlining;

/**
 * interface defining how we control the mode csp inlining depending on the situation
 */
public interface CSPInliningRule {
    /**
     * check to see if this rule is worth evaluating. use for early aborts
     * @param criteria
     * @return true if the rule should be processed
     */
    boolean isRelevant(CSPInliningCriteria criteria);

    /**
     * process the rule against the given criteria
     * @param criteria
     */
    void process(CSPInliningCriteria criteria);
}
