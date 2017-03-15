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
import org.junit.Test;

/**
 * Unit tests for ComponentController$AuraClientException
 */
public class AuraClientExceptionUnitTest extends UnitTestCase {

    @Test
    public void testCreateAuraClientExceptionWithQualifiedName() {
        String descriptor = "markup://foo:bar";

        AuraClientException ace = new AuraClientException(descriptor, null, null, null, null, null, null);

        String expectedNamespace = "foo";
        String expectedComponent = "bar";
        assertEquals(expectedNamespace, ace.getFailedComponentNamespace());
        assertEquals(expectedComponent, ace.getFailedComponent());
    }

    @Test
    public void testCreateAuraClientExceptionWithInvalidComponentQualifiedName() {
        String descriptor = "InvalidComponent markup://c:DTE_ImageCarousel {10:149;a}";

        AuraClientException ace = new AuraClientException(descriptor, null, null, null, null, null, null);

        String expectedNamespace = "c";
        String expectedComponent = "DTE_ImageCarousel";
        assertEquals(expectedNamespace, ace.getFailedComponentNamespace());
        assertEquals(expectedComponent, ace.getFailedComponent());
    }

    @Test
    public void testCreateAuraClientExceptionWithActionName() {
        String descriptor = "foo$bar$controller$doSomething";

        AuraClientException ace = new AuraClientException(descriptor, null, null, null, null, null, null);

        String expectedNamespace = "foo";
        String expectedComponent = "bar";
        String expectedMethod = "doSomething";
        assertEquals(expectedNamespace, ace.getFailedComponentNamespace());
        assertEquals(expectedComponent, ace.getFailedComponent());
        assertEquals(expectedMethod, ace.getFailedComponentMethod());
    }

    @Test
    public void testCreateAuraClientExceptionWithStacktrace() {
        String stacktrace =
                "at VA (https://customers.sage.com/s/sfsites/auraFW/javascript/9vevg4v6I80p1u_pT1V5VQ/aura_prod.js:266:132)\n" +
                "at b.P.get (https://customers.sage.com/s/sfsites/auraFW/javascript/9vevg4v6I80p1u_pT1V5VQ/aura_prod.js:263:381)\n" +
                "at value [as get] (https://customers.sage.com/s/sfsites/auraFW/javascript/9vevg4v6I80p1u_pT1V5VQ/aura_prod.js:548:194)\n" +
                "at Object.next (components/c/UICarousel.js:57:36)";

        AuraClientException ace = new AuraClientException(null, null, null, stacktrace, null, null, null);

        String expectedNamespace = "c";
        String expectedComponent = "UICarousel";
        assertEquals(expectedNamespace, ace.getFailedComponentNamespace());
        assertEquals(expectedComponent, ace.getFailedComponent());
    }

    @Test
    public void testGetStackTraceIdGenReturnsStackFramesWithOnlyFileNameInPath() {
        String jsstack = "Object.<anonymous>@https://sidewalk.lightning.force.com/l/%7B%22mode%22%3A%22PROD%22%2C%22app%22%3A%22one%3Aone%22%2C%22fwuid%22%3A%22vR3RI4HaFe6ZgUzebBGZ9A%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2Fone%3Aone%22%3A%22iwsxloMETwvQdzPlAVTY8w%22%7D%2C%22requestedLocales%22%3A%5B%22en_US%22%2C%22en%22%5D%2C%22ls%22%3A%22NN%22%7D/app.js:6687:431\n"+
            "Object.<anonymous>@https://sidewalk.lightning.force.com/auraFW/javascript/vR3RI4HaFe6ZgUzebBGZ9A/aura_prod.js:620:188\n"+
            "G.Ib@https://sidewalk.lightning.force.com/auraFW/javascript/vR3RI4HaFe6ZgUzebBGZ9A/aura_prod.js:309:332\n"+
            "BD.A.lk@https://sidewalk.lightning.force.com/auraFW/javascript/vR3RI4HaFe6ZgUzebBGZ9A/aura_prod.js:678:295\n"+
            "Object.qz.ci@https://sidewalk.lightning.force.com/auraFW/javascript/vR3RI4HaFe6ZgUzebBGZ9A/aura_prod.js:177:255\n"+
            "G.Ib@https://sidewalk.lightning.force.com/auraFW/javascript/vR3RI4HaFe6ZgUzebBGZ9A/aura_prod.js:176:130\n"+
            "T.Wg@https://sidewalk.lightning.force.com/auraFW/javascript/vR3RI4HaFe6ZgUzebBGZ9A/aura_prod.js:387:444\n"+
            "Object.onXHRReceived@https://sidewalk.lightning.force.com/l/%7B%22mode%22%3A%22PROD%22%2C%22app%22%3A%22one%3Aone%22%2C%22fwuid%22%3A%22vR3RI4HaFe6ZgUzebBGZ9A%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2Fone%3Aone%22%3A%22iwsxloMETwvQdzPlAVTY8w%22%7D%2C%22requestedLocales%22%3A%5B%22en_US%22%2C%22en%22%5D%2C%22ls%22%3A%22NN%22%7D/app.js:4813:503\n"+
            "Object.<anonymous>@https://sidewalk.lightning.force.com/auraFW/javascript/vR3RI4HaFe6ZgUzebBGZ9A/aura_prod.js:620:188\n"+
            "Object.qz.ci@https://sidewalk.lightning.force.com/auraFW/javascript/vR3RI4HaFe6ZgUzebBGZ9A/aura_prod.js:177:255";
        String expected = "Object.<anonymous>@app.js\n"+
                "Object.<anonymous>@aura_prod.js\n"+
                "G.Ib@aura_prod.js\n"+
                "BD.A.lk@aura_prod.js\n"+
                "Object.qz.ci@aura_prod.js\n"+
                "G.Ib@aura_prod.js\n"+
                "T.Wg@aura_prod.js\n"+
                "Object.onXHRReceived@app.js\n"+
                "Object.<anonymous>@aura_prod.js\n"+
                "Object.qz.ci@aura_prod.js\n";
        String actual = new AuraClientException(null, null, null, jsstack, null, null, null).getStackTraceIdGen();
        assertEquals(expected, actual);
    }

    @Test
    public void testGetStackTraceIdGenReturnsStackFramesWithNoUrlParametersInFileNameInPath() {
        String jsstack = "{anonymous}()@https://magicsoftware.force.com/auraFW/javascript/O278tBTztXSDREYIOX5gfg/aura_prod.js:677:429\n"+
                "execute()\n"+
                "_getStorage()\n"+
                "_receiveFrom$RecordGvp()\n"+
                "merge()@https://magicsoftware.force.com/l/%7B%22mode%22%3A%22PROD%22%2C%22app%22%3A%22one%3Aone%22%2C%22fwuid%22%3A%22O278tBTztXSDREYIOX5gfg%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2Fone%3Aone%22%3A%22HANfxsxKZvEiX3tgFZ9lSQ%22%7D%2C%22requestedLocales%22%3A%5B%22en_US%22%5D%2C%22pathPrefix%22%3A%22%22%2C%22ls%22%3A%22YN%22%7D/inline.js?jwt=555a5edc6951cc76ac4f36da8ac351d462b7e0fa8d47109404478bc2bd488c49:142:66\n"+
                "onXHRReceived()";
        String expected = "{anonymous}()@aura_prod.js\n"+
                "execute()\n"+
                "_getStorage()\n"+
                "_receiveFrom$RecordGvp()\n"+
                "merge()@inline.js\n"+
                "onXHRReceived()\n";
        String actual = new AuraClientException(null, null, null, jsstack, null, null, null).getStackTraceIdGen();
        assertEquals(expected, actual);
    }

    @Test
    public void testGetStackTraceIdGenReturnsTheSameWithDifferentDomainStacktraces() {
        // Domain placeholder: {DOMAIN}
        String jsStackTemplate = "at Object.<anonymous> ({DOMAIN}/l/%7B%22mode%22%3A%22PROD%22%2C%22app%22%3A%22one%3Aone%22%2C%22fwuid%22%3A%22vR3RI4HaFe6ZgUzebBGZ9A%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2Fone%3Aone%22%3A%22iwsxloMETwvQdzPlAVTY8w%22%7D%2C%22requestedLocales%22%3A%5B%22en_US%22%2C%22en%22%5D%2C%22ls%22%3A%22NN%22%7D/app.js:6687:431)\n" +
                "at Object.<anonymous> ({DOMAIN}/auraFW/javascript/vR3RI4HaFe6ZgUzebBGZ9A/aura_prod.js:620:188)\n" +
                "at G.Ib ({DOMAIN}/auraFW/javascript/vR3RI4HaFe6ZgUzebBGZ9A/aura_prod.js:309:332)\n" +
                "at BD.A.lk ({DOMAIN}/auraFW/javascript/vR3RI4HaFe6ZgUzebBGZ9A/aura_prod.js:678:295)\n" +
                "at Object.qz.ci ({DOMAIN}/auraFW/javascript/vR3RI4HaFe6ZgUzebBGZ9A/aura_prod.js:177:255)\n" +
                "at G.Ib ({DOMAIN}/auraFW/javascript/vR3RI4HaFe6ZgUzebBGZ9A/aura_prod.js:176:130)\n" +
                "at T.Wg ({DOMAIN}/auraFW/javascript/vR3RI4HaFe6ZgUzebBGZ9A/aura_prod.js:387:444)\n" +
                "at Object.onXHRReceived ({DOMAIN}/l/%7B%22mode%22%3A%22PROD%22%2C%22app%22%3A%22one%3Aone%22%2C%22fwuid%22%3A%22vR3RI4HaFe6ZgUzebBGZ9A%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2Fone%3Aone%22%3A%22iwsxloMETwvQdzPlAVTY8w%22%7D%2C%22requestedLocales%22%3A%5B%22en_US%22%2C%22en%22%5D%2C%22ls%22%3A%22NN%22%7D/app.js:4813:503)\n" +
                "at Object.<anonymous> ({DOMAIN}/auraFW/javascript/vR3RI4HaFe6ZgUzebBGZ9A/aura_prod.js:620:188)\n" +
                "at Object.qz.ci ({DOMAIN}/auraFW/javascript/vR3RI4HaFe6ZgUzebBGZ9A/aura_prod.js:177:255)";

        String jsstack1 = jsStackTemplate.replace("{DOMAIN}", "https://sidewalk.lightning.force.com");
        String jsstack2 = jsStackTemplate.replace("{DOMAIN}", "https://rgp.lightning.force.com");

        String actual1 = new AuraClientException(null, null, null, jsstack1, null, null, null).getStackTraceIdGen();
        String actual2 = new AuraClientException(null, null, null, jsstack2, null, null, null).getStackTraceIdGen();
        assertEquals(actual1, actual2);
    }

    @Test
    public void testGetStackTraceIdGenReturnsTheSameWithDifferentFrameworkUidStacktraces() {

        // Framework UID placeholder: {FW_UID}
        String jsStackTemplate = "at Object.<anonymous> (https://sidewalk.lightning.force.com/l/%7B%22mode%22%3A%22PROD%22%2C%22app%22%3A%22one%3Aone%22%2C%22fwuid%22%3A%22{FW_UID}%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2Fone%3Aone%22%3A%22iwsxloMETwvQdzPlAVTY8w%22%7D%2C%22requestedLocales%22%3A%5B%22en_US%22%2C%22en%22%5D%2C%22ls%22%3A%22NN%22%7D/app.js:6687:431)\n" +
                "at Object.<anonymous> (https://sidewalk.lightning.force.com/auraFW/javascript/{FW_UID}/aura_prod.js:620:188)\n" +
                "at G.Ib (https://sidewalk.lightning.force.com/auraFW/javascript/{FW_UID}/aura_prod.js:309:332)\n" +
                "at BD.A.lk (https://sidewalk.lightning.force.com/auraFW/javascript/{FW_UID}/aura_prod.js:678:295)\n" +
                "at Object.qz.ci (https://sidewalk.lightning.force.com/auraFW/javascript/{FW_UID}/aura_prod.js:177:255)\n" +
                "at G.Ib (https://sidewalk.lightning.force.com/auraFW/javascript/{FW_UID}/aura_prod.js:176:130)\n" +
                "at T.Wg (https://sidewalk.lightning.force.com/auraFW/javascript/{FW_UID}/aura_prod.js:387:444)\n" +
                "at Object.onXHRReceived (https://sidewalk.lightning.force.com/l/%7B%22mode%22%3A%22PROD%22%2C%22app%22%3A%22one%3Aone%22%2C%22fwuid%22%3A%22{FW_UID}%22%2C%22loaded%22%3A%7B%22APPLICATION%40markup%3A%2F%2Fone%3Aone%22%3A%22iwsxloMETwvQdzPlAVTY8w%22%7D%2C%22requestedLocales%22%3A%5B%22en_US%22%2C%22en%22%5D%2C%22ls%22%3A%22NN%22%7D/app.js:4813:503)\n" +
                "at Object.<anonymous> (https://sidewalk.lightning.force.com/auraFW/javascript/{FW_UID}/aura_prod.js:620:188)\n" +
                "at Object.qz.ci (https://sidewalk.lightning.force.com/auraFW/javascript/{FW_UID}/aura_prod.js:177:255)";

        String jsstack1 = jsStackTemplate.replace("{FW_UID}", "vR3RI4HaFe6ZgUzebBGZ9A");
        String jsstack2 = jsStackTemplate.replace("{FW_UID}", "jW_bQSND_PAm5SMZfQEyeA");

        String actual1 = new AuraClientException(null, null, null, jsstack1, null, null, null).getStackTraceIdGen();
        String actual2 = new AuraClientException(null, null, null, jsstack2, null, null, null).getStackTraceIdGen();
        assertEquals(actual1, actual2);
    }
}
