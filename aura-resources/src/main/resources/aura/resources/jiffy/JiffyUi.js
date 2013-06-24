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
/* This section was adapted from the Jiffy Firebug Extension by Bill Scott */
Jiffy.ui = function() {
    /*************/
    /** PRIVATE **/
    /*************/
    var container = null;
    var statsView = null;
    var rootContainer = null;
    var timeline = true;
    var totalElapsed = 0;
    var uniqueSuffix = "j";

    var dragging = false;
    var dragRel = {x: 0, y: 0};

    var ET = JiffyConstants.ELAPSED_TIME;
    var RT = JiffyConstants.REFERENCE_TIME;
    var MARK = JiffyConstants.MARK_NAME;

    function shouldDisplay() {
        // don't display if we are inside of a frame
        return window.self === window.top;
    }

    /**
     *  Translates Jiffy's measures into a JSON object with additional aggregate info
     *
     *  @return aggregated marks object
     */
    function aggregateData() {
        var marks = {};
        marks[JiffyConstants.PAGE_START_MARK] = {};
        marks[JiffyConstants.PAGE_START_MARK][ET] = 0;
        marks[JiffyConstants.PAGE_START_MARK].m = [];
        var measures = Jiffy.getMeasures();

        // each entry in measures has the name of its corresponding mark
        for(var i=0; i<measures.length; i++) {
            var measure = measures[i],
                markPrefix  = measure[MARK].substring(0,3);
            if (markPrefix != "rt." && markPrefix != "nt_" && markPrefix != "dom") {
               // either we've seen this mark before, or create a new one
               marks[measure[MARK]] = marks[measure[MARK]] || {et: 0, m: []};
               // push this measure on the mark's measure array
               marks[measure[MARK]].m.push(measure);
               // aggregate the mark's total elapsed time
               marks[measure[MARK]][ET] += measure[ET];
               if (measure[MARK] == "t_page") {
                   totalElapsed = measure[ET];
                  }
               }
        }

        return marks;
    }

    function percentLength(duration) {
        return (totalElapsed > 0) ? Math.round((duration/totalElapsed)*100) : 0;
    }

    /**
     * Produces HTML for the event graph based on the measures provided
     *
     * @param marks  The aggregated marks object returned from aggregateData()
     */
    function generateStatsTable(marks) {
        var innerHtml = ['<table width="100%" border="0" cellpadding="0" cellspacing="0" class="measures"><tbody>'];

        var startTime = Jiffy.startTime;
        var oddRow = true;

        var curMark, markEt, measures;

        for (var markName in marks) {
            //validate that it is actually a mark
            if((curMark = marks[markName]) &&
               (markEt = curMark[ET]) &&
               (measures = curMark.m)) {
                var rowType = oddRow ? "oddRow" : "evenRow";

                // left location of bar
                var left = timeline ? percentLength(measures[0][RT] - startTime) : 0;
                left = (left==100) ? 99 : left;

                // bar width
                var elapsedBarWidth = percentLength(markEt);
                if(elapsedBarWidth === 0 && markEt > 0) {
                    elapsedBarWidth = 1;
                }
                var timeStr = "";
                var barHTML = "";

                // Duration based if timeline turned on
                if(timeline) {
                    var duration = measures[measures.length-1][RT] - marks[markName].m[0][RT] + measures[measures.length-1][ET];
                    var durationBarWidth = duration/10 - markEt/10;
                    timeStr = markEt + " ms/" + duration + " ms";
                    barHTML = ['<div style="margin-left: ', left, '%; width: ', elapsedBarWidth, '%;" class="bar">', timeStr, '</div>',
                               '<div style="width: ', durationBarWidth, 'px;" class="durationBar">&nbsp;</div>'];
                // Else show mark as total elapsed time
                } else {
                    timeStr = markEt + " ms";
                    barHTML = ['<div style="margin-left: ', left, '%; width: ', elapsedBarWidth, '%;" class="bar">', timeStr, '</div>'];
                }

                innerHtml.push('<tr id="', Jiffy.ui.util.stripString(markName), '_', uniqueSuffix, '" class="markRow ', rowType, '">',
                               '<td class="toggle open mark unhover"><span class="label ', rowType, '">', markName, '</span></td>',
                               '<td>', barHTML.join(''), '</td>',
                               '</tr>');
                var et = 0;
                for(var i=0; i<measures.length; i++) {
                    var m = measures[i];
                    et += ( i===0 ? 0 : measures[i-1][ET] );
                    timeStr = m.et + " ms";
                    left = timeline ? percentLength(measures[i][RT] - startTime) : percentLength(et);
                    left = (left==100) ? 99 : left;
                    barWidth = percentLength(m[ET]);
                    barWidth = (barWidth < 1) ? 1 : barWidth;
                    var measureName = m[JiffyConstants.MEASURE_NAME];
                    measureName = (measureName.length < 150) ? measureName : measureName.substring(0, 150) + "...";
                    innerHtml.push('<tr class="evtRow ', rowType, ' showRow ', Jiffy.ui.util.stripString(markName), '_', uniqueSuffix, '">',
                                   '<td class="measure unhover"><span class="label ', rowType, '">', measureName, '</span></td>',
                                   '<td><div style="margin-left: ', left, '%; width: ', barWidth, '%;" class="bar">', timeStr, '</div></td>',
                                   '</tr>');
                }
                oddRow = !oddRow;
            }
        }
        innerHtml.push('</tbody></table>');
        return innerHtml.join('');
    }

    /************/
    /** PUBLIC **/
    /************/
    return {

        onLoad : (function() {
            // don't show the ui if we are inside of a frame
            if (!shouldDisplay()) {
                return;
            }

            var measuresLength = Jiffy.getMeasures().length;
            function renderHelper() {
                if (measuresLength != Jiffy.getMeasures().length) {
                    measuresLength = Jiffy.getMeasures().length;
                    Jiffy.ui.renderStats(rootContainer);
                }
                setTimeout(renderHelper, 1000);
            }
            return function() {
                Jiffy.ui.renderStats(rootContainer);
                renderHelper();
            };
        })(),

        // Render the Jiffy UI to this container instead of the default one.
        appendTo: function(parent) {
            rootContainer = parent;
        },

        // main method.  calls everything else as necessary and displays the graph.
        renderStats : function(parent) {
            Jiffy.ui.initContainer(parent);
            statsView.innerHTML = generateStatsTable(aggregateData());
            Jiffy.ui.addHandlers();
        },

        rowClick : function(e) {
            var markRow = Jiffy.ui.util.getEventTarget(e);
            while (markRow.nodeName != "TR") {
                markRow = markRow.parentNode;
            }
            var toggleCell = markRow.childNodes[0];

            var evtRows = Jiffy.ui.util.getElementsByClassName(markRow.id, statsView, "tr");
            Jiffy.ui.util.toggleClasses(evtRows, "showRow", "hideRow");
            Jiffy.ui.util.toggleClasses(toggleCell, "open", "closed");
        },

        rowMouseOver : function(e) {
            var label = Jiffy.ui.util.getEventTarget(e);
            if (label.nodeName == "SPAN") {
                Jiffy.ui.util.removeClass(label.parentNode, "unhover");
                Jiffy.ui.util.setClass(label, "onhover");
            }
        },

        rowMouseOut : function(e) {
            var label = Jiffy.ui.util.getEventTarget(e);
            if (label.nodeName == "SPAN") {
                Jiffy.ui.util.setClass(label.parentNode, "unhover");
                Jiffy.ui.util.removeClass(label, "onhover");
            }
        },

        addHandlers : function() {
            // add the twisty handler for marks
            var markRows = Jiffy.ui.util.getElementsByClassName("markRow", statsView, "tr");
            for(var i=0;i<markRows.length; i++) {
                Jiffy.ui.util.addEvent(markRows[i].childNodes[0], "click", Jiffy.ui.rowClick);
            }

            // add handler to show full labels if they are truncated
            var labels = Jiffy.ui.util.getElementsByClassName("label", statsView, "span");
            for(var j=0;j<labels.length; j++) {
                Jiffy.ui.util.addEvent(labels[j], "mouseover", Jiffy.ui.rowMouseOver);
                Jiffy.ui.util.addEvent(labels[j], "mouseout", Jiffy.ui.rowMouseOut);
            }
        },

        // clears graph and existing Jiffy measures
        clearStats : function() {
            statsView.innerHTML = "";
            Jiffy.clearMeasures();
        },

        changeLogLevel: function() {
            var newLevel = this.options[this.selectedIndex].value;

            if(Jiffy.currentLogLevel.name == newLevel) {
                return;
            }

            Jiffy.util.setCookie(JiffyConstants.COOKIE_NAME, newLevel);

            window.location.reload();

        },

        disableJiffy: function() {
            var expiredDate = new Date(new Date().getTime() - 1000000);

            // Delete Cookie enablement cookie and set it explicitly disabled.
            Jiffy.util.setCookie("enableJiffy", "", expiredDate);
            Jiffy.util.setCookie("disableJiffy", "1");

            window.location.reload();
        },

        // toggles placing marks respective to PageStart time on the timeline
        toggleTimeline : function() {
            if(timeline) {
                timeline = false;
            } else {
                timeline = true;
            }

            Jiffy.ui.renderStats(true);
        },

        showHide : function() {
            Jiffy.ui.util.toggleClass(statsView, "hidden");
        },

        dragStart : function(event) {
            var e = Jiffy.ui.util.getEvent(event);
            var target = Jiffy.ui.util.getEventTarget(e);
            if (target.nodeName != "INPUT") {
                dragging = true;
                dragRel.x = e.clientX - container.offsetLeft;
                dragRel.y = e.clientY - container.offsetTop;
                Jiffy.ui.util.eventSmash(e);
            }
        },

        dragMove : function(event) {
            if (dragging) {
                var e = Jiffy.ui.util.getEvent(event);
                var topY = (e.clientY - dragRel.y) > 0 ? (e.clientY - dragRel.y) : 0;
                container.style.top  = topY + "px";
                Jiffy.ui.util.eventSmash(e);
            }
        },

        dragStop : function() {
            dragging = false;
        },

        // creates chart div and appends it to given element or element id,
        // or positions absolutely on page is no id provided
        initContainer: function(parent) {
            if (container) {
                return;
            }
            container = Jiffy.ui.createContainer();

            var appendTo = document.body;
            if (parent) {
                var elseAppendTo = parent.appendChild ? parent : document.getElementById(parent);
            }

            if (elseAppendTo) {
                appendTo = elseAppendTo;
            } else {
                Jiffy.ui.util.setClass(container, "jiffyAbsolute");
                Jiffy.ui.util.addEvent(document, "mouseup", Jiffy.ui.dragStop);
                Jiffy.ui.util.addEvent(container, "mousedown", Jiffy.ui.dragStart);
                Jiffy.ui.util.addEvent(document, "mousemove", Jiffy.ui.dragMove);
            }

            appendTo.appendChild(container);

            Jiffy.ui.addStatsView();
        },

        createContainer: function() {
            var container = document.createElement("div");
            container.id = "jiffyContainer";
            container.className = "jiffyContainer";

            var buttonBar = document.createElement("div");
            buttonBar.className = "buttonBar";

            var showHideButton = document.createElement("input");
            showHideButton.type = "button";
            showHideButton.value = "Show/Hide";
            showHideButton.onclick = Jiffy.ui.showHide;

            var timelineButton = document.createElement("input");
            timelineButton.type = "button";
            timelineButton.value = "Toggle Timeline";
            timelineButton.onclick = Jiffy.ui.toggleTimeline;

            var clearButton = document.createElement("input");
            clearButton.type = "button";
            clearButton.value = "Clear";
            clearButton.onclick = Jiffy.ui.clearStats;

            var disableButton = document.createElement("input");
            disableButton.type = "button";
            disableButton.value = "Disable Jiffy";
            disableButton.onclick = Jiffy.ui.disableJiffy;

            var toggleLogLevelSelect = document.createElement("select");
                toggleLogLevelSelect.onchange = toggleLogLevelSelect.onclick = Jiffy.ui.changeLogLevel;

            var logLevelEnum = window.PerfLogLevel || {};
            var option;
            var logLevelName;
            var currentLogLevelName = Jiffy.currentLogLevel.name;
            for(var level in logLevelEnum) {
                if(logLevelEnum.hasOwnProperty(level)) {
                    logLevelName = logLevelEnum[level].name;
                    option = document.createElement("option");
                    option.value = option.innerHTML = logLevelName;
                    option.selected = logLevelName == currentLogLevelName;
                    toggleLogLevelSelect.appendChild(option);
                }
            }


            container.appendChild(buttonBar);
            buttonBar.appendChild(showHideButton);
            buttonBar.appendChild(timelineButton);
            buttonBar.appendChild(clearButton);
            buttonBar.appendChild(disableButton);
            buttonBar.appendChild(toggleLogLevelSelect);

            return container;
        },

        // add the div that contains the graph
        addStatsView: function() {
            if (statsView) {
                return;
            }

            statsView = document.createElement("div");
            statsView.className = 'statsView';
            container.appendChild(statsView);
        }
    };
}();

Jiffy.ui.util = {
    isArray : function(object) {
        return object && typeof object === "object" && 'splice' in object
                && 'join' in object;
    },

    hasClass : function(elt, name) {
        var elems = this.isArray(elt) ? elt : [ elt ];

        for ( var i = 0; i < elems.length; i++) {
            var node = elems[i];

            if (!node || node.nodeType != 1) {
                return false;
            } else {
                var re = new RegExp("(^|\\s)" + name + "($|\\s)");
                return re.exec(node.getAttribute("class"));
            }
        }
    },

    setClass : function(elt, name) {
        var elems = this.isArray(elt) ? elt : [ elt ];

        for ( var i = 0; i < elems.length; i++) {
            var node = elems[i];

            if (node && !this.hasClass(node, name)) {
                node.className += " " + name;
            }
        }
    },

    removeClass : function(elt, name) {
        var elems = this.isArray(elt) ? elt : [ elt ];

        for ( var i = 0; i < elems.length; i++) {
            var node = elems[i];
            if (node && node.className) {
                var index = node.className.indexOf(name);
                if (index >= 0) {
                    var size = name.length;
                    node.className = node.className.substr(0, index - 1)
                            + node.className.substr(index + size);
                }
            }
        }
    },

    toggleClass : function(elt, name) {
        var elems = this.isArray(elt) ? elt : [ elt ];

        for ( var i = 0; i < elems.length; i++) {
            var elem = elems[i];
            if (this.hasClass(elem, name)) {
                this.removeClass(elem, name);
            } else {
                this.setClass(elem, name);
            }
        }
    },

    toggleClasses : function(elt, class1, class2) {
        var elems = this.isArray(elt) ? elt : [ elt ];

        for ( var i = 0; i < elems.length; i++) {
            var elem = elems[i];
            if (this.hasClass(elem, class1)) {
                this.removeClass(elem, class1);
                this.setClass(elem, class2);
            } else {
                this.removeClass(elem, class2);
                this.setClass(elem, class1);
            }
        }
    },

    stripString : function(str) {
        return str.replace(/\s+|[^\w]/g, '');
    },

    eventSmash : function(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
    },

    addEvent : function() {
        if (window.addEventListener) {
            return function(obj, evType, fn, useCapture) {
                obj.addEventListener(evType, fn, useCapture);
            };
        } else if (window.attachEvent) {
            return function(obj, evType, fn, useCapture) {
                var r = obj.attachEvent("on" + evType, fn);
                return r;
            };
        }
        return function() {
            return null;
        };
    }(),

    getEvent : function(e) {
        return e || window.event;
    },

    getEventTarget : function(e) {
        return (window.event) ? e.srcElement : e.target;
    },

    getElementsByClassName : function(strClassName, oElm, strTagName) {
        if (!strTagName) {
            strTagName = "*";
        }
        if (!oElm) {
            oElm = document.body;
        }

        //document.all is *much* faster in IE than getElementsByTagName("*"), unfortunately.
        var arrElements = (strTagName == "*" && oElm == document.body && document.all) ? document.all
                : oElm.getElementsByTagName(strTagName);
        var arrReturnElements = [];
        strClassName = strClassName.replace(/\-/g, "\\-");
        var oRegExp = new RegExp("\\b" + strClassName + "\\b");
        var len = arrElements.length;
        for ( var i = 0; i < len; i++) {
            if (oRegExp.test(arrElements[i].className)) {
                arrReturnElements.push(arrElements[i]);
            }
        }
        return arrReturnElements;
    }
};
