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

function (w) {
    'use strict';
    w || (w = window);
    
    // NAMESPACES
    var SCROLLER = w.__S || (w.__S = {}),
        HELPERS  = SCROLLER.helpers,
        PLUGINS  = SCROLLER.plugins || (SCROLLER.plugins = {}),
        SUPPORT  = SCROLLER.support;
    
    function VoiceOver() {}
    
    VoiceOver.prototype = {
        init: function () {
            this.on('_initialize', this._initializeVoiceOver);
        },
        _initializeVoiceOver : function() {
            var config = this.opts.voiceOverConfig;
            if (config.enable) {
                this._createVoiceOverMarkup(config);
                this.on('scrollEnd', this._toggleButtons);
            }
        },
        _createVoiceOverMarkup: function (config) {
            var self          = this,
            	prevBtn, nextBtn, ptrBtn,
                btnCls = 'scrollButton voiceOver ',
                target         = this.wrapper;
            
            if (this.scrollVertical) {
                prevBtn = this._createButton(config.labelUp, 'top upButton', function(e){self._pageUp();});
                nextBtn = this._createButton(config.labelDown, 'bottom downButton', function(e){self._pageDown();});
                if (this.opts.pullToRefresh) {
                    this._ptrBtn  = this._createButton(this.opts.pullToRefreshConfig.labelPull, 'top ptrButton', function(e){self.triggerPTR();});
                }
            } else {
                prevBtn = this._createButton(config.labelLeft, 'leftButton', function(e){self._pageLeft();});
                nextBtn = this._createButton(config.labelRight, 'rightButton', function(e){self._pageRight();});
            }

            this._enableVoiceOver = config.enable;
            this._prevBtn = prevBtn;
            this._nextBtn = nextBtn;
            this._toggleButtons();
            this._ptrBtn && target.insertBefore(this._ptrBtn, target.firstChild);
            target.insertBefore(this._prevBtn, target.firstChild);
            target.appendChild(this._nextBtn);
            this._voInited = true;
        },
        _createButton: function(label, cls, clickListener) {
            var btnCls = 'scrollButton voiceOver ';
            var btn = w.document.createElement('button');
            btn.appendChild(HELPERS.createLabel("", label));
            btn.addEventListener('click', clickListener);
            btn.className = btnCls + cls;
            return btn;
        },
        _toggleButtons: function() {
            if (!this._enableVoiceOver) {
                this._hideAllButtons();
                return;
            }
            if (this.scrollVertical) {
                this._toggleVerticalButtons();
            } else {
                this._toggleHorizontalButtons();
            }
        },
        _toggleVerticalButtons: function() {
            if (this.y === 0) {
                //show pull to refresh button when on top
                this._toggleBtn(this._prevBtn, false);
                this._toggleBtn(this._ptrBtn, true);
            } else {
                this._toggleBtn(this._prevBtn, true);
                this._toggleBtn(this._ptrBtn, false);
            }
            //hide page down button when at the bottom
            this._toggleBtn(this._nextBtn, this.y !== this.maxScrollY);
        },
        _toggleHorizontalButtons: function() {
            this._toggleBtn(this._prevBtn, this.x !== 0);
            this._toggleBtn(this._nextBtn, this.x !== this.maxScrollX);
        },
        _hideAllButtons: function() {
            this._toggleBtn(this._prevBtn, false);
            this._toggleBtn(this._nextBtn, false);
            this._toggleBtn(this._ptrBtn, false);
        },
        _toggleBtn: function(btn, display) {
            btn && (btn.style.display = display === true ? 'block' : 'none');
        },
        _pageUp: function() {
            var posY, pageHeight = this.wrapperHeight, curX=this.x, curY = this.y;
            if (curY === 0) {
                //already at the top
                return;
            }
            posY = curY + pageHeight;
            //need to pass in 1 as the time to work around the issue where "scrollEnd" event is not fired if time is 0
            this.scrollTo(curX, posY > 0 ? 0 : posY, 1);
        },
        _pageDown: function() {
            var posY, pageHeight = this.wrapperHeight, curX=this.x, curY = this.y, maxY = this.maxScrollY;
            if (curY === maxY) {
                //already at the bottom
                return;
            }
            posY = curY - pageHeight;
            this.scrollTo(curX, posY < maxY ? maxY : posY, 1);
        },
        _pageLeft: function() {
        	var posX, pageSize = this.wrapperWidth, curX=this.x, curY = this.y;
            if (curX === 0) {
                //already at the leftmost
                return;
            }
            posX = curX + pageSize;
            this.scrollTo(posX > 0 ? 0 : posX, curY, 1);
        },
        _pageRight: function() {
        	 var posX, pageSize = this.wrapperWidth, curX=this.x, curY = this.y, maxX = this.maxScrollX;
             if (curX === maxX) {
                 //already at the right most
                 return;
             }
             posX = curX - pageSize;
             this.scrollTo(posX < maxX ? maxX : posX, curY, 1);
        },
        /*
         * ==================================
         * PUBLIC API
         * ==================================
         */
        enableVoiceOver: function(enable) {
            if (!this._voInited) {
                this._initializeVoiceOver();
            } else {
                this._enableVoiceOver = enable;
                this._toggleButtons();
            }
        }
    };

    PLUGINS.VoiceOver = VoiceOver;

}