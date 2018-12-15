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
package org.auraframework.http;

import static org.hamcrest.Matchers.arrayContaining;
import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;

import org.junit.Test;

public class PolicyBuilderFrameAncestorsTest {

    @SuppressWarnings("unchecked")
    @Test
    public void testFrameAncestorsAreUnique() {
        String csp = new CSP.PolicyBuilder()
            .frame_ancestor(CSP.SELF, CSP.SELF)
            .build();

        for (String directive : csp.split(";")) {
            String[] parts = directive.split(" ");
            if (parts.length >= 1) {
                if (CSP.Directive.FRAME_ANCESTOR.toString().equals(parts[0])) {
                    assertThat("frame-ancestor is incorrect", parts,
                        arrayContaining(
                            equalTo(CSP.Directive.FRAME_ANCESTOR.toString()),
                            equalTo(CSP.SELF)
                        )
                    );
                    return;
                }
            }
        }
        fail("frame-ancestors directive not present");
    }

    @SuppressWarnings("unchecked")
    @Test
    public void testMultipleFrameAncestors() {
        String csp = new CSP.PolicyBuilder()
            .frame_ancestor(CSP.SELF, "https://www.example.com", "https://www.also.com")
            .build();

        for (String directive : csp.split(";")) {
            String[] parts = directive.split(" ");
            if (parts.length >= 1) {
                if (CSP.Directive.FRAME_ANCESTOR.toString().equals(parts[0])) {
                    // verify order is maintained
                    assertThat("frame-ancestor is incorrect", parts,
                        arrayContaining(
                            equalTo(CSP.Directive.FRAME_ANCESTOR.toString()),
                            equalTo(CSP.SELF),
                            equalTo("https://www.example.com"),
                            equalTo("https://www.also.com")
                        )
                    );
                    return;
                }
            }
        }
        fail("frame-ancestors directive not present");
    }
}
