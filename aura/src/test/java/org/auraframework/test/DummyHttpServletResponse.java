/*
 * Copyright (C) 2012 salesforce.com, inc.
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
package org.auraframework.test;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collection;
import java.util.Locale;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletResponse;

/**
 * A testing mock of {@link HttpServletResponse}.  The implementations here all
 * do nothing (and return null, zero, etc.), so override what you need to.
 */
public class DummyHttpServletResponse implements HttpServletResponse {

    /**
     * {@link HttpServletResponse} includes a lot of utility methods; if those are
     * used, the dummy really should implement them.  So our base class here throws
     * this {@link RuntimeException} if those are called.
     */
    public static class NotImplementedException extends RuntimeException {
        public NotImplementedException(String method) {
            super(String.format("If %s is called, it should have been overridden by a subclass",
                    method));
        }
    }

    @Override
    public String getCharacterEncoding() {
        return null;
    }

    @Override
    public String getContentType() {
        return null;
    }

    @Override
    public ServletOutputStream getOutputStream() throws IOException {
        return null;
    }

    @Override
    public PrintWriter getWriter() throws IOException {
        return null;
    }

    @Override
    public void setCharacterEncoding(String charset) {
        // no-op
    }

    @Override
    public void setContentLength(int len) {
        // no-op
    }

    @Override
    public void setContentType(String type) {
        // no-op
    }

    @Override
    public void setBufferSize(int size) {
        // no-op
    }

    @Override
    public int getBufferSize() {
        return 0;
    }

    @Override
    public void flushBuffer() throws IOException {
        // no-op
    }

    @Override
    public void resetBuffer() {
        // no-op
    }

    @Override
    public boolean isCommitted() {
        return false;
    }

    @Override
    public void reset() {
        // no-op
    }

    @Override
    public void setLocale(Locale loc) {
        // no-op
    }

    @Override
    public Locale getLocale() {
        return null;
    }

    @Override
    public void addCookie(Cookie cookie) {
        // no-op
    }

    @Override
    public boolean containsHeader(String name) {
        return false;
    }

    @Override
    public String encodeURL(String url) {
        return null;
    }

    @Override
    public String encodeRedirectURL(String url) {
        return null;
    }

    @Override
    public String encodeUrl(String url) {
        return null;
    }

    @Override
    public String encodeRedirectUrl(String url) {
        return null;
    }

    @Override
    public void sendError(int sc, String msg) throws IOException {
        throw new NotImplementedException("sendError(sc, msg)");
    }

    @Override
    public void sendError(int sc) throws IOException {
        throw new NotImplementedException("sendError(sc)");
    }

    @Override
    public void sendRedirect(String location) throws IOException {
        throw new NotImplementedException("sendRedirect(location)");
    }

    @Override
    public void setDateHeader(String name, long date) {
        // no-op
    }

    @Override
    public void addDateHeader(String name, long date) {
        // no-op
    }

    @Override
    public void setHeader(String name, String value) {
        // no-op
    }

    @Override
    public void addHeader(String name, String value) {
        // no-op
    }

    @Override
    public void setIntHeader(String name, int value) {
        // no-op
    }

    @Override
    public void addIntHeader(String name, int value) {
        // no-op
    }

    @Override
    public void setStatus(int sc) {
        // no-op
    }

    @Override
    public void setStatus(int sc, String sm) {
        // no-op
    }

    @Override
    public int getStatus() {
        return 0;
    }

    @Override
    public String getHeader(String name) {
        return null;
    }

    @Override
    public Collection<String> getHeaders(String name) {
        return null;
    }

    @Override
    public Collection<String> getHeaderNames() {
        return null;
    }
}
