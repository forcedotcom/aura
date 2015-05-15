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
/*
 * Copyright (C) 2006 Sun Microsystems, Inc. All rights reserved.
 * Use is subject to license terms.
 *
 * Redistribution and use in source and binary forms, with or without modification, are
 * permitted provided that the following conditions are met: Redistributions of source code
 * must retain the above copyright notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of
 * conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution. Neither the name of the Sun Microsystems nor the names of
 * is contributors may be used to endorse or promote products derived from this software
 * without specific prior written permission.

 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER
 * OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

/*
 * DeTagifier.java
 * @author Mike Grogan
 *
 * @Created on March 25, 2004, 3:39 PM
 * @version 1.0
 *
 * @author Roberto Chinnici
 */

package org.auraframework.util.phobos.script.util;

import java.io.Reader;
import java.io.IOException;
import java.io.FileInputStream;
import java.io.InputStreamReader;

public class DeTagifier {

    public static final int START = 0;
    public static final int IN_CODEBLOCK = 1;
    public static final int IN_OUTPUTBLOCK = 2;
    public static final int IN_EXPRBLOCK = 3;
    public static final int INSIDE_START_TAG = 4;
    public static final int INSIDE_INITIAL_START_TAG = 5;
    public static final int INSIDE_END_TAG = 6;
    public static final int INSIDE_CODE_EXPR_BLOCK = 7;
    public static final int INSIDE_EXPR_END_TAG = 8;
    public static final int INVALID_STATE = -1;

    private String outputStart;
    private String outputEnd;
    private String exprStart;
    private String exprEnd;

    public DeTagifier(String outputStart, String outputEnd, String exprStart, String exprEnd) {
        this.outputStart = outputStart;
        this.outputEnd = outputEnd;
        this.exprStart = exprStart;
        this.exprEnd = exprEnd;
    }

    public String parse(Reader reader) throws IOException {
        CharHolder charHolder = new DeTagifier.CharHolder();
        int i = 0;
        int state = START;
        while (-1 != (i = reader.read())) {
            //ignore control-M
            if (i == (int)'\r') {
                continue;
            }

            state = processChar(state, (char)i, charHolder);
            if (state == INVALID_STATE) {
                return null;
            }
        }
        if (state == IN_OUTPUTBLOCK) {
            charHolder.put(outputEnd);
        }

        return charHolder.getString();
    }

    public int processChar(int state, char c, CharHolder charHolder)
                throws IOException {

         switch (state) {
             case START:
                 if (c == '<') {
                     return INSIDE_INITIAL_START_TAG;
                 } else {
                     charHolder.put(outputStart);
                     charHolder.put(c);
                     return IN_OUTPUTBLOCK;
                 }
             case IN_CODEBLOCK:
                 if (c == '%') {
                     return INSIDE_END_TAG;
                 } else {
                     charHolder.put(c);
                     return IN_CODEBLOCK;
                 }
             case IN_OUTPUTBLOCK:
                 if (c == '<') {
                     return INSIDE_START_TAG;
                 } else if (c == '\n') {
                     charHolder.put('\\');
                     charHolder.put('n');
                     charHolder.put(outputEnd);
                     charHolder.put(outputStart);
                     return IN_OUTPUTBLOCK;
                 } else if (c == '"') {
                     charHolder.put('\\');
                     charHolder.put(c);
                     return IN_OUTPUTBLOCK;
                 } else {
                     charHolder.put(c);
                     return IN_OUTPUTBLOCK;
                 }
             case IN_EXPRBLOCK:
                 if (c == '%') {
                     return INSIDE_EXPR_END_TAG;
                 }
                 else {
                     charHolder.put(c);
                     return IN_EXPRBLOCK;
                 }
             case INSIDE_INITIAL_START_TAG:
             case INSIDE_START_TAG:
                 if (c == '%') {
                     if (state == INSIDE_START_TAG) {
                         charHolder.put(outputEnd);
                     }
                     return INSIDE_CODE_EXPR_BLOCK;
                 } else {
                     if (state == INSIDE_INITIAL_START_TAG) {
                        charHolder.put(outputStart);
                     }
                     charHolder.put('<');
                     charHolder.put(c);
                     return IN_OUTPUTBLOCK;
                 }
             case INSIDE_END_TAG:
                 if (c == '>') {
                     charHolder.put(outputStart);
                     return IN_OUTPUTBLOCK;
                 } else {
                     charHolder.put('%');
                     charHolder.put(c);
                     return IN_CODEBLOCK;
                 }
             case INSIDE_CODE_EXPR_BLOCK:
                 if (c == '=') {
                     charHolder.put(exprStart);
                     return IN_EXPRBLOCK;
                 } else {
                     charHolder.put(c);
                     return IN_CODEBLOCK;
                 }
             case INSIDE_EXPR_END_TAG:
                 if (c == '>') {
                     charHolder.put(exprEnd);
                     charHolder.put(outputStart);
                     return IN_OUTPUTBLOCK;
                 } else {
                     charHolder.put('%');
                     charHolder.put(c);
                     return IN_EXPRBLOCK;
                 }
         }
         return INVALID_STATE;

    }

    public static void main(String[] args) throws Exception {
        if (args.length == 5) {
            Reader reader = new InputStreamReader(new FileInputStream(args[0]));
            DeTagifier dt = new DeTagifier(args[1], args[2], args[3], args[4]);
            String ret = dt.parse(reader);
            System.out.println(ret);
        }
        else {
            System.err.println("Usage: detagifier <file> <outputStart> <outputEnd> <exprStart> <exprEnd>\n");
        }
    }

    public class CharHolder {
        private char[] chars = new char[1000];
        int current = 0;
        int size = 1000;

        public void put(char c) {
            if (current == size - 1) {
                char[] newChars = new char[2 * size];
                for (int i = 0; i < size; i++) {
                    newChars[i] = chars[i];
                }
                size *= 2;
                chars = newChars;
            }

            chars[current++] = c;
        }

        public void put(String str) {
            int l = str.length();
            for (int i = 0; i < l ; i++) {
                put(str.charAt(i));
            }
        }

        public String getString() {
            return new String(chars , 0, current);
        }
    }
}
