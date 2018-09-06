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

import com.salesforce.sld.encoders.AbstractCharacterManipulator;
import com.salesforce.sld.encoders.impl.html.*;

public class SecureAppendable implements Appendable {

    private StringBuilder content;
    private final static String EMPTY = "";
    private final static String DOUBLE_QUOTE = "\"";
    public SecureAppendable(StringBuilder rc){
        content = rc;
    }

    enum QuotesType{
        DOUBLE, SINGLE, NONE;
    }


    /**
     * Appends the specified character sequence to this <tt>Appendable</tt>.
     *
     * <p> Depending on which class implements the character sequence
     * <tt>csq</tt>, the entire sequence may not be appended.
     *
     * This method is <tt>deprecated</tt> as it is not security appending.
     *
     * @param  csq
     *         The character sequence to append.
     *
     * @return  A reference to this <tt>Appendable</tt>
     *
     */
    @Deprecated
    public SecureAppendable append(CharSequence csq) {
        this.content.append(null != csq ? csq.toString(): EMPTY);
        return this;
    }

    /**
     * Appends a subsequence of the specified character sequence to this
     * <tt>Appendable</tt>.
     *
     * <p> An invocation of this method of the form <tt>out.append(csq, start,
     * end)</tt> when <tt>csq</tt> is not <tt>null</tt>, behaves in
     * exactly the same way as the invocation
     *
     * This method is <tt>deprecated</tt> as it is not security appending.
     *
     * @param  csq
     *         The character sequence from which a subsequence will be
     *         appended.  If <tt>csq</tt> is <tt>null</tt>, then characters
     *         will be appended as if <tt>csq</tt> contained the four
     *         characters <tt>"null"</tt>.
     *
     * @param  start
     *         The index of the first character in the subsequence
     *
     * @param  end
     *         The index of the character following the last character in the
     *         subsequence
     *
     * @return  A reference to this <tt>Appendable</tt>
     *
     */
    @Deprecated
    public SecureAppendable append(CharSequence csq, int start, int end)  {
        this.content.append(csq,start,end);
        return this;
    }

    /**
     * Appends the specified character to this <tt>Appendable</tt>.
     *
     * This method is <tt>deprecated</tt> as it is not security appending.
     *
     * @param  c
     *         The character to append
     *
     * @return  A reference to this <tt>Appendable</tt>
     *
     */
    @Deprecated
    public SecureAppendable append(char c)   {
        return this;
    }

    /**
     * A secure append method allows encoding based on the EncodeDataType while appending.
     * use RAW_CONSTANT data type if no encoding is needed for constant strings.
     * If you need to leave dynamic data unencoded (which we don't recommend), you can use
     * RAW_DYNAMIC.
     *
     * THIS METHOD WILL ADD ATTRIBUTE QUOTES FOR YOU, DON'T ADD THEM ON YOUR OWN
     *
     *
     * e.g.
     *      {@code
     *      rc.append("<a href=", EncodeDataType.RAW_CONSTANT)
     *        .append("https://test.com", EncodeDataType.URL)
     *        .append("/>", EncodeDataType.RAW_CONSTANT)
     *        }
     *
     *
     * @param csq CharSequence to be encoded and appended
     * @param dt encoding to apply to csq
     * @return Appendable itself
     */
    public SecureAppendable append(CharSequence csq, EncodeDataType dt) {

        String encoded = "";
        String rawInput = csq.toString();
        AbstractCharacterManipulator manipulator = this.getManipulator(dt);


        if(null != manipulator){
            encoded = manipulator.encode(rawInput);
        }else {
            encoded = rawInput;
        }

        //Enclosed encoded input in double quotes pair only when it's specified and no quote have been added yet.
        if (dt.encloseInQuotes() && quoteTypeOfPrevInput().equals(QuotesType.NONE)){
            encoded = DOUBLE_QUOTE.concat(encoded).concat(DOUBLE_QUOTE);
        }

        this.content.append(encoded);
        return this;
    }



    @Override
    public String toString(){
        return content.toString();
    }

    /**
     * check the quote type of the last character of prevInput
     *
     *
     * @return DOUBLE if the the constructing HTML ends in a ", SINGLE if it ends in an ', and NONE if it's neither of those.
     */

    private QuotesType quoteTypeOfPrevInput(){


        if (null != this.content && !this.content.toString().equals(EMPTY)){
            String rcContent = this.content.toString();
            int rcLen = rcContent.length();
            if(rcContent.charAt(rcLen - 1) == '"') return QuotesType.DOUBLE;

            if(rcContent.charAt(rcLen - 1) == '\'') return QuotesType.SINGLE;
        }
        return QuotesType.NONE;
    }

    /**
     * get manipulator type based on <tt>dt</tt> and the content of last appended input.
     *
     * If dt is one of <tt>URL, ATTRIBUTE, JAVASCRIPT_URL</tt>, the manipulator type will be
     * determined by the types of quotes last input ends with.
     *
     * @param dt
     * @return
     */

    private AbstractCharacterManipulator getManipulator(EncodeDataType dt){
        switch (dt){
            case URL:
            case ATTRIBUTE:
            case JAVASCRIPT_URL:{
                switch (quoteTypeOfPrevInput()){
                    case SINGLE:
                        return new HTMLSingleQuotedAttrManipulator();
                    default:
                        return new HTMLDoubleQuotedAttrManipulator();
                }
            }
            case HTML:
                return new HTMLContentManipulator();

            default:
                return null;
        }
    }

}

