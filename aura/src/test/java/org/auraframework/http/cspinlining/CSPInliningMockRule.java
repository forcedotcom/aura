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

import org.auraframework.annotations.Annotations;
import org.auraframework.service.CSPInliningService.InlineScriptMode;
import org.springframework.core.annotation.Order;

@Annotations.ServiceComponent
@Order() //put this at the end of the execution chain for testing
public class CSPInliningMockRule implements CSPInliningRule {

    private boolean isRelevant = false;
    private InlineScriptMode mode;

    @Override
    public boolean isRelevant(CSPInliningCriteria criteria) {
        return isRelevant;
    }

    @Override
    public void process(CSPInliningCriteria criteria) {
        if (mode != null) {
            criteria.setMode(mode);
        }
    }

    public void setMode(InlineScriptMode mode) {
        this.mode = mode;
    }

    public void setIsRelevent(boolean isRelevent){
        this.isRelevant = isRelevent;
    }
}
