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
package org.auraframework.impl.controller;

import org.auraframework.impl.controller.ComponentController.AuraClientException;
import org.auraframework.util.test.util.UnitTestCase;
import org.junit.Assert;
import org.junit.Test;

/**
 * Unit tests for ComponentController$AuraClientException
 */
public class AuraClientExceptionUnitTest extends UnitTestCase {

    @Test
    public void testCreateAuraClientExceptionWithQualifiedName() {
        String descriptor = "markup://foo:bar";

        AuraClientException ace = new AuraClientException(descriptor, null, null, null, null, null);

        String expectedNamespace = "foo";
        String expectedComponent = "bar";
        Assert.assertEquals(expectedNamespace, ace.getFailedComponentNamespace());
        Assert.assertEquals(expectedComponent, ace.getFailedComponent());
    }

    @Test
    public void testCreateAuraClientExceptionWithInvalidComponentQualifiedName() {
        String descriptor = "InvalidComponent markup://c:DTE_ImageCarousel {10:149;a}";

        AuraClientException ace = new AuraClientException(descriptor, null, null, null, null, null);

        String expectedNamespace = "c";
        String expectedComponent = "DTE_ImageCarousel";
        Assert.assertEquals(expectedNamespace, ace.getFailedComponentNamespace());
        Assert.assertEquals(expectedComponent, ace.getFailedComponent());
    }

    @Test
    public void testCreateAuraClientExceptionWithActionName() {
        String descriptor = "foo$bar$controller$doSomething";

        AuraClientException ace = new AuraClientException(descriptor, null, null, null, null, null);

        String expectedNamespace = "foo";
        String expectedComponent = "bar";
        String expectedMethod = "doSomething";
        Assert.assertEquals(expectedNamespace, ace.getFailedComponentNamespace());
        Assert.assertEquals(expectedComponent, ace.getFailedComponent());
        Assert.assertEquals(expectedMethod, ace.getFailedComponentMethod());
    }

    @Test
    public void testCreateAuraClientExceptionWithStacktrace() {
        String stacktrace = 
                "at VA (https://customers.sage.com/s/sfsites/auraFW/javascript/9vevg4v6I80p1u_pT1V5VQ/aura_prod.js:266:132)\n" +
                "at b.P.get (https://customers.sage.com/s/sfsites/auraFW/javascript/9vevg4v6I80p1u_pT1V5VQ/aura_prod.js:263:381)\n" +
                "at value [as get] (https://customers.sage.com/s/sfsites/auraFW/javascript/9vevg4v6I80p1u_pT1V5VQ/aura_prod.js:548:194)\n" + 
                "at Object.next (components/c/UICarousel.js:57:36)"; 

        AuraClientException ace = new AuraClientException(null, null, null, stacktrace, null, null);

        String expectedNamespace = "c";
        String expectedComponent = "UICarousel";
        Assert.assertEquals(expectedNamespace, ace.getFailedComponentNamespace());
        Assert.assertEquals(expectedComponent, ace.getFailedComponent());
    }
}
