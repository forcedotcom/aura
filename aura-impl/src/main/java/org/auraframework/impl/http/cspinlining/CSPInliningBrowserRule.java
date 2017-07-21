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
package org.auraframework.impl.http.cspinlining;

import org.auraframework.annotations.Annotations.ServiceComponent;
import org.auraframework.http.cspinlining.CSPInliningCriteria;
import org.auraframework.http.cspinlining.CSPInliningRule;
import org.auraframework.impl.util.BrowserInfo;
import org.auraframework.impl.util.UserAgent;
import org.springframework.core.annotation.Order;

import static org.auraframework.service.CSPInliningService.InlineScriptMode.UNSUPPORTED;

/**
 * Browser support matrix for browsers that do not support CSP2 headers
 */
@ServiceComponent
@Order(1)
public class CSPInliningBrowserRule implements CSPInliningRule {


    @Override
    public boolean isRelevant(CSPInliningCriteria criteria) {
        return criteria.getMode() != UNSUPPORTED;
    }

    @Override
    public void process(CSPInliningCriteria criteria) {
        String userAgent = criteria.getContext().getClient().getUserAgent();
        BrowserInfo bi = new BrowserInfo(userAgent);

        boolean isSupported = false;

        isSupported |= bi.isBrowser(UserAgent.CHROME, 40, true); //covers mobile and desktop
        isSupported |= bi.isBrowser(UserAgent.EDGE, 15, true);
        isSupported |= bi.isBrowser(UserAgent.FIREFOX, 31, true);
        isSupported |= bi.isBrowser(UserAgent.SAFARI, 10, true); //covers mobile and desktop
        isSupported |= bi.isBrowser(UserAgent.OPERA, 23, true);

        if (!isSupported){
            criteria.setMode(UNSUPPORTED);
        }
    }
}
