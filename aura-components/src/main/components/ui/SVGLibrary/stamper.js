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
function StampSVG() { //eslint-disable-line no-unused-vars

    function embed(svgElement, svgFragment, use) {
        if (svgFragment) {
            var clone = svgFragment.cloneNode(true);
            var viewBox = !svgElement.getAttribute("viewBox") && svgFragment.getAttribute("viewBox");
            if (viewBox) {
                svgElement.setAttribute("viewBox", viewBox);
            }
            while (clone.firstChild) {
                svgElement.insertBefore(clone.firstChild, use);
            }
            svgElement.removeChild(use);
        }
    }

    var fetchSVG = function (url) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.send();

            xhr.onreadystatechange = function () {
                // if the request is ready
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var htmlDocumentFragment = document.createDocumentFragment();
                        var spanElement = document.createElement('span');

                        htmlDocumentFragment.appendChild(spanElement);
                        spanElement.innerHTML = xhr.responseText;
                        resolve(spanElement.firstChild);
                    } else {
                        reject(xhr);
                    }
                }
            };
        });
    };

    var requests = {};
    var polyfill = function (svgElement) {
        var uses = Array.prototype.slice.call(svgElement.getElementsByTagName("use"));

        uses.forEach(function (use) {
            var src = use.getAttribute("href");
            var srcSplit = src.split("#");
            var url = srcSplit.shift();
            var id = srcSplit.join("#");

            if (url.length) {

                (requests[url] || (requests[url] = fetchSVG(url)))
                    .then(function (svgSpriteElement) {
                        var svgFragment = svgSpriteElement.getElementById(id);

                        embed(svgElement, svgFragment, use);
                    });
            }
        });
    };

    var svgTagName = /svg/i;
    var isValidSVG = function (svgElement) {
        return svgElement && svgTagName.test(svgElement.nodeName);
    };

    var newerIEUA = /\bTrident\/[567]\b|\bMSIE (?:9|10)\.0\b/;
    var webkitUA = /\bAppleWebKit\/(\d+)\b/;
    var olderEdgeUA = /\bEdge\/12\.(\d+)\b/;
    var isIE = function () {
        return (
            newerIEUA.test(navigator.userAgent) ||
            (navigator.userAgent.match(olderEdgeUA) || [])[1] < 10547 ||
            (navigator.userAgent.match(webkitUA) || [])[1] < 537
        );
    };

    return {
        // Enable DI to facilitate testing
        injectDependencyForTesting: {
            isIE: function (_isIE) {
                isIE = _isIE;
            },
            isValidSVG: function (_isValidSVG) {
                isValidSVG = _isValidSVG;
            },
            polyfill: function (_polyfill) {
                polyfill = _polyfill;
            },
            fetchSVG: function (_fetchSVG) {
                fetchSVG = _fetchSVG;
            }
        },
        stamp: function (svgElement) {
            if (isIE() && isValidSVG(svgElement)) {
                polyfill(svgElement);
            }
        }
    };
}
