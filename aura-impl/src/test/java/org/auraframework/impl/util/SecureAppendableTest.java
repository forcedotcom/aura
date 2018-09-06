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

package org.auraframework.impl.util;


import org.junit.Test;
import static org.junit.Assert.assertEquals;

public class SecureAppendableTest {


    @Test
    public void testATTRIBUTEAppend(){
        SecureAppendable rc = new SecureAppendable(new StringBuilder());
        String attributeTest = "doublev\"alue";
        String attributeAfterEncode = "<a name='doublev\"alue'/>";

        rc
                .append("<a name='", EncodeDataType.RAW_CONSTANT)
                .append(attributeTest, EncodeDataType.ATTRIBUTE)
                .append("'/>", EncodeDataType.RAW_CONSTANT);
        assertEquals("Failed encoding HTML attribute values!", attributeAfterEncode, rc.toString());
    }

    @Test
    public void testHTMLAppend(){
        SecureAppendable rc = new SecureAppendable(new StringBuilder());
        String htmlTest = "<!--this! is/ a; comment: --> <bar attribute=\"doublevalue\">(*#$!@#?</bar>";
        String htmlAfterEncode = "&lt;!--this! is/ a; comment: --&gt; &lt;bar attribute=&quot;doublevalue&quot;&gt;(*#$!@#?&lt;/bar&gt;";

        rc.append(htmlTest, EncodeDataType.HTML);
        assertEquals("Failed encoding HTML Content!", rc.toString(), htmlAfterEncode);
    }

    @Test
    public void testJAVASCRIPT_URLAppend(){
        SecureAppendable rc = new SecureAppendable(new StringBuilder());
        String jsUrlTest ="javascript: var i=\"aa\"; var j = 'b';";
        String jsUrlAfterEncode ="\"javascript: var i=&quot;aa&quot;; var j = 'b';\"";
        rc.append(jsUrlTest, EncodeDataType.JAVASCRIPT_URL);
        assertEquals("Failed encoding javascript in URL! ", jsUrlAfterEncode, rc.toString());
    }

    @Test
    public void testInlineJavascriptAppend(){
        SecureAppendable rc = new SecureAppendable(new StringBuilder());

        rc.append("var x = '", EncodeDataType.RAW_CONSTANT).
                append("'; alert(\"foo\"); alert('bar')", EncodeDataType.JAVASCRIPT_URL).
                append("';", EncodeDataType.RAW_CONSTANT);
        String jsUrlAfterEncode ="var x = '&#x27;; alert(\"foo\"); alert(&#x27;bar&#x27;)';";
        assertEquals("Failed encoding javascript in URL! ", jsUrlAfterEncode, rc.toString());
    }


    @Test
    public void testURLAppend(){
        SecureAppendable rc = new SecureAppendable(new StringBuilder());
        String jsUrlTest ="https://test.com\"> <script> alert(1);</script>";
        String jsUrlAfterEncode ="\"https://test.com&quot;&gt; &lt;script&gt; alert(1);&lt;/script&gt;\"";
        rc.append(jsUrlTest, EncodeDataType.URL);
        assertEquals("Failed encoding href URL", jsUrlAfterEncode, rc.toString());
    }

    @Test
    public void testRAW_CONSTANTAppend(){


        SecureAppendable rc = new SecureAppendable(new StringBuilder());
        String jsUrlTest ="'> <foo attribute=''''\"\"\"";
        rc.append(jsUrlTest, EncodeDataType.RAW_CONSTANT);
        assertEquals("Failed appending with RAW_CONSTANT datatype applied!", jsUrlTest, rc.toString());
    }


    @Test
    public void testRAW_DYNAMICAppend(){

        SecureAppendable rc = new SecureAppendable(new StringBuilder());
        String jsUrlTest ="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@#$%^&*()_+=-`\"'?/\\|><.,:;][}{";
        rc.append(jsUrlTest, EncodeDataType.RAW_DYNAMIC);
        assertEquals("Failed appending with RAW_DYNAMIC datatype applied!", jsUrlTest, rc.toString());
    }


}
