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
package org.auraframework.adapter;

import java.util.Collection;

/**
 * This class describes a security policy for a particular application, by either
 * its descriptor or its URL.
 * 
 * Concrete implementations of this class likely want to extend
 * {@link org.auraframework.impl.adapter.DefaultContentSecurityProvider}.
 *
 * @since 194
 */
public interface ContentSecurityPolicy {

    /**
     * Converts this object into a Content-Security-Policy header string.  This is a
     * part of the interface primarily to allow the computed string to be memoized by
     * the instance (or not, if it will never be reused).
     */
    String getCspHeaderValue();
 
    /**
     * Gets the sources allowed to frame this application.  It may be {@code null}
     * to allow any framing at all; it may be empty to disallow any framing from any
     * site; it may contain {@code null} to allow same-origin framing, and/or it may
     * enumerate allowed framing URLs.
     *
     * @return {@code null}, empty collection, or a collection perhaps containing
     *     {@code null} to indicate same-origin, as described above.
     *
     * @see {@link #getFrameSources()} for the inverse sources for child frames.
     */
    Collection<String> getFrameAncestors();

    /**
     * Gets the sources allowed to be framed by this application.  It may be {@code null}
     * to allow any framing at all; it may be empty to disallow any framing from any
     * site; it may contain {@code null} to allow same-origin framing, and/or it may
     * enumerate allowed framing URLs.
     *
     * @return {@code null}, empty collection, or a collection perhaps containing
     *     {@code null} to indicate same-origin, as described above.
     *
     * @see {@link #getFrameAncestors()} for the inverse sources for parenting frames.
     */
    Collection<String> getFrameSources();

    /**
     * Gets the sources allowed to supply script for this application.  It may be
     * {@code null} to allow script loading from anywhere, or may be empty to disallow
     * loading script all all; more commonly, it may contain {@code null} to allow same-origin
     * framing, and/or it may enumerate allowed framing hosts or URLs.
     *
     * @return {@code null}, empty collection, or a collection perhaps containing
     *     {@code null} to indicate same-origin, as described above.
     */
    Collection<String> getScriptSources();

    /**
     * Gets sources allowed to supply style..
     *
     * @return {@code null}, empty collection, or a collection perhaps containing
     *     {@code null} to indicate same-origin, as described above.
     */
    Collection<String> getStyleSources();

    /**
     * Gets sources allowed to supply external fonts..
     *
     * @return {@code null}, empty collection, or a collection perhaps containing
     *     {@code null} to indicate same-origin, as described above.
     */
    Collection<String> getFontSources();

    /**
     * Gets addresses allowed for connections from this page.
     *
     * @return {@code null}, empty collection, or a collection perhaps containing
     *     {@code null} to indicate same-origin, as described above.
     */
    Collection<String> getConnectSources();

    /**
     * Gets source addresses for "other stuff," corresponding to CSP default-src.
     *
     * @return {@code null}, empty collection, or a collection perhaps containing
     *     {@code null} to indicate same-origin, as described above.
     */
    Collection<String> getDefaultSources();

    /**
     * Image sources, as the other methods.
     * 
     * @return {@code null}, empty collection, or a collection perhaps containing
     *     {@code null} to indicate same-origin, as described above.
     */
    Collection<String> getImageSources();

    /**
     * Object sources, as the other methods.
     *
     * @return {@code null}, empty collection, or a collection perhaps containing
     *     {@code null} to indicate same-origin, as described above. 
     */
    Collection<String> getObjectSources();

    /**
     * Media sources, as the others.
     *
     * @return {@code null}, empty collection, or a collection perhaps containing
     *     {@code null} to indicate same-origin, as described above.
     */
    Collection<String> getMediaSources();

    /** Gets the URL for reporting. */
    String getReportUrl();
}
