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

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

public class CapturingResponseWrapper extends HttpServletResponseWrapper {
    private ByteArrayOutputStream buffer;
    private ServletOutputStream outputStream;
    private PrintWriter writer;
    private String redirectUrl;

    public CapturingResponseWrapper(HttpServletResponse res) {
        super(res);
    }

    public String getCapturedResponseString() throws IOException {
        flushBuffer();
        getWriter().flush();
        getOutputStream().flush();
        return buffer.toString();
    }

    public String getRedirectUrl() {
        return this.redirectUrl;
    }
    
    @Override
    public ServletOutputStream getOutputStream() {
        if (outputStream == null) {
            buffer = new ByteArrayOutputStream();
            outputStream = new ServletOutputStream() {
                @Override
                public void write(int b) throws IOException {
                    buffer.write(b);
                }
            };
        }
        return outputStream;
    }

    @Override
    public PrintWriter getWriter() {
        if (writer == null) {
            writer = new PrintWriter(getOutputStream());
        }
        return writer;
    }
    
    @Override
    public void sendRedirect(String location) throws IOException{
        this.redirectUrl = location;
        super.sendRedirect(location);
    }
}