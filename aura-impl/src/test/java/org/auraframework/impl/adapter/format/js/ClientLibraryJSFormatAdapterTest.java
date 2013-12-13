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
package org.auraframework.impl.adapter.format.js;

import java.io.IOException;
import java.util.Collection;

import org.auraframework.clientlibrary.Combinable;
import org.auraframework.impl.AuraImplTestCase;
import org.mockito.Matchers;

import com.google.common.collect.Lists;

import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;

public class ClientLibraryJSFormatAdapterTest extends AuraImplTestCase {
    
    public ClientLibraryJSFormatAdapterTest(String name){
        super(name, false);
    }
    
    public void testCombinedOutput() throws Exception{
        ClientLibraryJSFormatAdapter jsFormatAdapter = new ClientLibraryJSFormatAdapter();
        jsFormatAdapter = spy(jsFormatAdapter);
        String contents1 = "function a(){var x = 'hello'; alert(x);/*Comments*/} ";
        String contents2 = "function a(){var x = 'whatwhat!'; alert(x);} ";
        FakeCombinable c1 = new FakeCombinable(contents1);
        FakeCombinable c2 = new FakeCombinable(contents2);
        StringBuffer out = new StringBuffer();
        
        jsFormatAdapter.writeCollection(Lists.newArrayList(c1, c2), out);
        assertEquals(contents1 + contents2 , out.toString());
        verify(jsFormatAdapter).writeCollection(Matchers.<Collection<Combinable>>any(), eq(out));
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
