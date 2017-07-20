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

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.springframework.core.annotation.Order;

import static org.auraframework.service.CSPInliningService.InlineScriptMode.UNSUPPORTED;

/**
 * IE 11 and less do not support CSP2 headers
 */
@ServiceComponent
@Order(1)
public class CSPInliningIERule implements CSPInliningRule {
    @Override
    public boolean isRelevant(CSPInliningCriteria criteria) {
        return criteria.getMode() != UNSUPPORTED;
    }

    @Override
    public void process(CSPInliningCriteria criteria) {
        switch(criteria.getContext().getClient().getType()){
            case WEBKIT:
            case FIREFOX:
            case IE12:
            case OTHER:
                break;

            case IE6:
            case IE7:
            case IE8:
            case IE9:
            case IE10:
            case IE11:
                criteria.setMode(UNSUPPORTED);
                break;
        }
    }
}
