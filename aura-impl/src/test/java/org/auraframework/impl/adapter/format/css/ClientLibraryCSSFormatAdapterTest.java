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
package org.auraframework.impl.adapter.format.css;

import static org.mockito.Mockito.spy;

import java.io.IOException;

import org.auraframework.Aura;
import org.auraframework.clientlibrary.Combinable;
import org.auraframework.impl.AuraImplTestCase;
import org.auraframework.system.AuraContext.Authentication;
import org.auraframework.system.AuraContext.Format;
import org.auraframework.system.AuraContext.Mode;

import com.google.common.collect.Lists;

public class ClientLibraryCSSFormatAdapterTest extends AuraImplTestCase {
    public ClientLibraryCSSFormatAdapterTest(String name){
        super(name, false);
    }
    
    public void testValuesAreCombinedAndCompressedInNonDevAndNonTestModes() throws Exception{
        Aura.getContextService().startContext(Mode.PTEST, Format.JSON, Authentication.AUTHENTICATED);
        assertValuesAreNotCompressed();
    }
    
    public void testValuesAreNotCompressedInDevOrTestModes() throws Exception{
        Aura.getContextService().startContext(Mode.UTEST, Format.JSON, Authentication.AUTHENTICATED);
        assertValuesAreNotCompressed();
        Aura.getContextService().endContext();
        
        Aura.getContextService().startContext(Mode.DEV, Format.JSON, Authentication.AUTHENTICATED);
        assertValuesAreNotCompressed();
    }    
        
    private void assertValuesAreNotCompressed()throws Exception{
        ClientLibraryCSSFormatAdapter cssFormatAdapter = new ClientLibraryCSSFormatAdapter();
        cssFormatAdapter = spy(cssFormatAdapter);
        
        StringBuffer out = new StringBuffer();
        FakeCombinable c1 = new FakeCombinable("Contents of combinable 1.");
        FakeCombinable c2 = new FakeCombinable("Contents of combinable 2.");
        FakeCombinable c3 = new FakeCombinable("Contents of combinable 3.");
        cssFormatAdapter.writeCollection(Lists.newArrayList(c1, c2, c3), out);
        assertEquals("Contents of combinable 1."+"Contents of combinable 2."+"Contents of combinable 3.", out.toString());
    }
    
    private class FakeCombinable implements Combinable{
        String content;
        public FakeCombinable(String content){
            this.content = content;
        }
        @Override
        public boolean canCombine() {
            return true;
        }

        @Override
        public String getContents() throws IOException {
            return content;
        }
        
    }
}
