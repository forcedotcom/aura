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
package org.auraframework.def;


public enum HtmlTag {
    a,
    abbr,
    acronym,
    address,
    applet(false),
    area,
    article,
    aside,
    audio,
    b,
    base(false),
    basefont(false),
    bdi,
    bdo,
    big,
    blockquote,
    body,
    br,
    button,
    caption,
    canvas,
    center,
    cite,
    code,
    col,
    colgroup,
    command,
    datalist,
    dd,
    del,
    details,
    dfn,
    dir,
    div,
    dl,
    dt,
    em,
    embed(false),
    fieldset,
    figure,
    figcaption,
    font(false),
    footer,
    form,
    frame(false),
    frameset(false),
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    head,
    header,
    hgroup,
    hr,
    html,
    i,
    iframe,
    img,
    input,
    ins,
    isindex(false),
    keygen,
    kbd,
    label,
    legend,
    li,
    link,
    map,
    mark,
    menu,
    meta,
    meter,
    noframes(false),
    noscript(false),
    object(false),
    nav,
    ol,
    optgroup,
    option,
    output,
    p,
    param(false),
    pre,
    progress,
    q,
    rp,
    rt,
    ruby,
    s,
    samp,
    script,
    section,
    select,
    small,
    source,
    span,
    strike,
    strong,
    style,
    sub,
    summary,
    sup,
    table,
    tbody,
    td,
    textarea,
    tfoot,
    th,
    thead,
    time,
    title,
    tr,
    track,
    tt,
    u,
    ul,
    var,
    video,
    wbr;

    private final boolean allowed;

    private HtmlTag(boolean allowed){
        this.allowed = allowed;
    }

    private HtmlTag(){
        this(true);
    }

    public static final boolean allowed(String tag){
        try{
            HtmlTag ret = valueOf(tag.toLowerCase());
            return ret.isAllowed();
        }catch(Throwable e){
            return false;
        }
    }

    public boolean isAllowed(){
        return allowed;
    }
}
