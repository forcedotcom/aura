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

function lib() { //eslint-disable-line no-unused-vars

    /*
     * This pre-generated regex has been moved over from UrlUtil.java in core. It searches for:
     *  - A scheme followed by anything that looks vaguely url-like (up to 2K in length)
     *  - Anything that looks like a valid hostname followed by a legal TLD suffix.
     *      (RFC 2181 limits each fragment to 64 octets and the whole name to 255 octets)
     *  - Anything that looks like a valid email address (64 characters before the @@ sign and  255 characters afterward)
     * The regex has been slightly modified to work in javascript.Major changes include:
     *  - unicode properties in regular expressions are not supported in javascript, so \p{L} has been removed.
     *  - the <UNC> match has been removed. See W-3679997
     *
     * For more details on how this regex is constructed, refer to UrlUtil.java in core.
     */
    var linksMatchingRegex =
        "((?:(?:https?|ftp)://(?:[\\w\\-\\|=%~#/+*@\\.,;:\\?!']|&(?!quot;|amp;|lt;|gt;|#39;)){0,2047}(?:[\\w=/+#-]|\\([^\\s()]*\\)))|(?:\\b(?:[a-z0-9]" +
        "(?:[-a-z0-9]{0,62}[a-z0-9])?\\.)+(?:AC|AD|AE|AERO|AF|AG|AI|AL|AM|AN|AO|AQ|AR|ARPA|AS|ASIA|AT|AU|AW|AX|AZ|BA|BB|" +
        "BD|BE|BF|BG|BH|BI|BIZ|BJ|BM|BN|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CAT|CC|CD|CF|CG|CH|CI|CK|CL|CM|CN|CO|COM|COOP|CR|CU|" +
        "CV|CX|CY|CZ|DE|DJ|DK|DM|DO|DZ|EC|EDU|EE|EG|ER|ES|ET|EU|FI|FJ|FK|FM|FO|FR|GA|GB|GD|GE|GF|GG|GH|GI|GL|GM|GN|GOV|" +
        "GP|GQ|GR|GS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|ID|IE|IL|IM|IN|INFO|INT|IO|IQ|IR|IS|IT|JE|JM|JO|JOBS|JP|KE|KG|KH|KI|" +
        "KM|KN|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|MG|MH|MIL|MK|ML|MM|MN|MO|MOBI|MP|MQ|MR|MS|MT|" +
        "MU|MUSEUM|MV|MW|MX|MY|MZ|NA|NAME|NC|NE|NET|NF|NG|NI|NL|NO|NP|NR|NU|NZ|OM|ORG|PA|PE|PF|PG|PH|PK|PL|PM|PN|PR|PRO|" +
        "PS|PT|PW|PY|QA|RE|RO|RS|RU|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|SK|SL|SM|SN|SO|SR|ST|SU|SV|SY|SZ|TC|TD|TEL|TF|TG|TH|TJ|" +
        "TK|TL|TM|TN|TO|TP|TR|TRAVEL|TT|TV|TW|TZ|UA|UG|UK|US|UY|UZ|VA|VC|VE|VG|VI|VN|VU|WF|WS|XN--0ZWM56D|XN--11B5BS3A9AJ6G|" +
        "XN--80AKHBYKNJ4F|XN--9T4B11YI5A|XN--DEBA0AD|XN--FIQS8S|XN--FIQZ9S|XN--G6W251D|XN--HGBK6AJ7F53BBA|XN--HLCJ6AYA9ESC7A|" +
        "XN--J6W193G|XN--JXALPDLP|XN--KGBECHTV|XN--KPRW13D|XN--KPRY57D|XN--MGBAAM7A8H|XN--MGBERP4A5D4AR|XN--P1AI|XN--WGBH1C|" +
        "XN--ZCKZAH|YE|YT|ZA|ZM|ZW)(?!@(?:[a-z0-9](?:[-a-z0-9]{0,62}[a-z0-9])?\\.)+(?:AC|AD|AE|AERO|AF|AG|AI|AL|AM|AN|AO|" +
        "AQ|AR|ARPA|AS|ASIA|AT|AU|AW|AX|AZ|BA|BB|BD|BE|BF|BG|BH|BI|BIZ|BJ|BM|BN|BO|BR|BS|BT|BV|BW|BY|BZ|CA|CAT|CC|CD|CF|" +
        "CG|CH|CI|CK|CL|CM|CN|CO|COM|COOP|CR|CU|CV|CX|CY|CZ|DE|DJ|DK|DM|DO|DZ|EC|EDU|EE|EG|ER|ES|ET|EU|FI|FJ|FK|FM|FO|FR|" +
        "GA|GB|GD|GE|GF|GG|GH|GI|GL|GM|GN|GOV|GP|GQ|GR|GS|GT|GU|GW|GY|HK|HM|HN|HR|HT|HU|ID|IE|IL|IM|IN|INFO|INT|IO|IQ|IR|" +
        "IS|IT|JE|JM|JO|JOBS|JP|KE|KG|KH|KI|KM|KN|KP|KR|KW|KY|KZ|LA|LB|LC|LI|LK|LR|LS|LT|LU|LV|LY|MA|MC|MD|ME|MG|MH|MIL|" +
        "MK|ML|MM|MN|MO|MOBI|MP|MQ|MR|MS|MT|MU|MUSEUM|MV|MW|MX|MY|MZ|NA|NAME|NC|NE|NET|NF|NG|NI|NL|NO|NP|NR|NU|NZ|OM|ORG|" +
        "PA|PE|PF|PG|PH|PK|PL|PM|PN|PR|PRO|PS|PT|PW|PY|QA|RE|RO|RS|RU|RW|SA|SB|SC|SD|SE|SG|SH|SI|SJ|SK|SL|SM|SN|SO|SR|ST|" +
        "SU|SV|SY|SZ|TC|TD|TEL|TF|TG|TH|TJ|TK|TL|TM|TN|TO|TP|TR|TRAVEL|TT|TV|TW|TZ|UA|UG|UK|US|UY|UZ|VA|VC|VE|VG|VI|VN|" +
        "VU|WF|WS|XN--0ZWM56D|XN--11B5BS3A9AJ6G|XN--80AKHBYKNJ4F|XN--9T4B11YI5A|XN--DEBA0AD|XN--FIQS8S|XN--FIQZ9S|XN--G6W251D|" +
        "XN--HGBK6AJ7F53BBA|XN--HLCJ6AYA9ESC7A|XN--J6W193G|XN--JXALPDLP|XN--KGBECHTV|XN--KPRW13D|XN--KPRY57D|XN--MGBAAM7A8H|" +
        "XN--MGBERP4A5D4AR|XN--P1AI|XN--WGBH1C|XN--ZCKZAH|YE|YT|ZA|ZM|ZW))(?:/[\\w\\-=?/.&;:%~,+@#*]{0,2048}(?:[\\w=/+#-]|" +
        "\\([^\\s()]*\\)))?(?:$|(?=\\.$)|(?=\\.\\s)|(?=[^\\w\\.]))))|([\\w-\\.\\+_]{1,64}@(?:[\\w-]){1,255}(?:\\.[\\w-]{1,255}){1,10})";

    var whitelistedTagsMatchingRegex =
        "(<a[\\s]+[^>]+[^\/]>[\\s\\S]*?<\/a>|<a[\\s]+[^>]+\/>|" +
        "<i?frame[\\s]+[^>]+[^\/]>[\\s\\S]*?<\/i?frame>|<i?frame[\\s]+[^>]+\/>|" +
        "<area[\\s]+[^>]+[^\/]>[\\s\\S]*?<\/area>|<area[\\s]+[^>]+\/>|" +
        "<link[\\s]+[^>]+[^\/]>[\\s\\S]*?<\/link>|<link[\\s]+[^>]+\/>|" +
        "<img[\\s]+[^>]+[^\/]>[\\s\\S]*?<\/img>|<img[\\s]+[^>]+>|" +
        "<form[\\s]+[^>]+[^\/]>[\\s\\S]*?<\/form>|<form[\\s]+[^>]+\/>|" +
        "<body[\\s]+[^>]+[^\/]>[\\s\\S]*?<\/body>|<body[\\s]+[^>]+\/>|" +
        "<head[\\s]+[^>]+[^\/]>[\\s\\S]*?<\/head>|<head[\\s]+[^>]+\/>|" +
        "<input[\\s]+[^>]+[^\/]>[\\s\\S]*?<\/input>|<input[\\s]+[^>]+\/>|" +
        "<button[\\s]+[^>]+[^\/]>[\\s\\S]*?<\/button>|<button[\\s]+[^>]+\/>|" +
        "<blockquote[\\s]+[^>]+[^\/]>[\\s\\S]*?<\/blockquote>|<blockquote[\\s]+[^>]+\/>|" +
        "<q[\\s]+[^>]+[^\/]>[\\s\\S]*?<\/q>|<q[\\s]+[^>]+\/>|" +
        "<del[\\s]+[^>]+[^\/]>[\\s\\S]*?<\/del>|<del[\\s]+[^>]+\/>|" +
        "<ins[\\s]+[^>]+[^\/]>[\\s\\S]*?<\/ins>|<ins[\\s]+[^>]+\/>)";

    var escapeCharacterMatchingRegex = "([<>\"\']|&(?!quot;|amp;|lt;|gt;|#39;))";

    var createHttpLink = function(match) {
        var href = match;
        // lastIndexOf starting from index 0 checks if the match begins with the string.
        // It has performance advantages over indexOf when the match doesn't begin with the string because it only checks index 0.
        if (match.lastIndexOf("http", 0) !== 0 && match.lastIndexOf("ftp", 0) !== 0) {
            href = "http://" + href;
        }
        return "<a href=\"" + href + "\" target=\"_blank\">" + match + "</a>";
    };
    var createEmailLink = function(match) {
        return "<a href=\"mailto:" + match + "\">" + match + "</a>";
    };
    var escapeCharacter = function(match) {
        switch (match) {
            case '<':
                return "&lt;";
            case '>':
                return "&gt;";
            case '&':
                return "&amp;";
            case '\"':
                return "&quot;";
            case '\'':
                return "&#39;";
            default:
                return match;
        }
    };

    return {

        linkifyText: function(text) {
            if ($A.util.isEmpty(text)) {
                return text;
            } else if (typeof text !== "string") {
                text = text.toString();
            }

            var regex = new RegExp(whitelistedTagsMatchingRegex + "|" + linksMatchingRegex, "gi");
            return text.replace(regex, function(match, tagMatch, hrefMatch, emailMatch) {
                if (tagMatch) {
                    // if a tag with href was found, don't linkify it.
                    return tagMatch;
                } else if (hrefMatch) {
                    // got href
                    return createHttpLink(hrefMatch);
                } else if (emailMatch) {
                    // got an email address
                    return createEmailLink(emailMatch);
                }
            });
        },

        escapeAndLinkifyText: function(text) {
            if ($A.util.isEmpty(text)) {
                return text;
            } else if (typeof text !== "string") {
                text = text.toString();
            }

            var regex = new RegExp(linksMatchingRegex + "|" + escapeCharacterMatchingRegex, "gi");
            return text.replace(regex, function(match, hrefMatch, emailMatch, escapeMatch) {
                if (hrefMatch) {
                    // got href
                    return createHttpLink(hrefMatch);
                } else if (emailMatch) {
                    // got an email address
                    return createEmailLink(emailMatch);
                } else if (escapeMatch) {
                    // got an escape character match
                    return escapeCharacter(escapeMatch);
                }
            });
        }
    };
}