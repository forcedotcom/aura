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

({
    /*
     * NOTE @dval: We do manual templating for performance reasons.
     * Carousel has to be really lean and performant since is a key piece of our component tree.
     * Aura doesn't need to know about inside of this component neither create all the component tree for them
     * So until we are sure that aura is fast enough we will do all the life cyle manually.
     */
    KEYS: {
        left: 37,
        right: 39
    },
    TAP: {
        touchstart   : 'touchstart',
        pointerdown  : 'pointerdown',
        MSPointerDown: 'MSPointerDown',
        click        : 'click'
    },
    /* ====================================================
     * PRIVATE METHODS
     * ==================================================== 
     */
    _createNavTemplate: function (content) {
        return '<ul class="nav-container" role="presentation">' + content + '</ul>';
    },
    _createItem: function (data, isDot) {
        var indicator = isDot ? '<div class="dot-indicator"><span class="assistiveText">' + data.title + '</span></div>' : 
            '<span class="label">' + data.title + '</span></a></li>';
        
        return [
            '<li class="item" role="presentation" data-index="', data.index, '">',
                '<a role="tab" class="tab', (data.selected ? ' selected': ''), '" ',
                    'aria-selected="', data.selected, '" ',
                    'tabindex="', (data.selected ? 0 : -1), '"',
                '>',
                    indicator,
                '</a>',
            '</li>'
        ].join('');
    },
    attachHandlers: function (cmp, root) {
        var self = this,
            handler = function (e) {
                self._handleEvent(cmp, e);
            };
            
        if ($A.util.supportsTouchEvents() && !$A.get('$Browser.isAndroid')) {
            root.addEventListener('touchstart', handler, false);
            root.addEventListener('pointerdown', handler, false);
            root.addEventListener('MSPointerDown', handler, false);
        } else {
            root.addEventListener('click', handler, false);
            root.addEventListener('keyup', function(e){
                self._handleKeyEvent(cmp, e);
            }, false);
        }
    },
    _getPageNumber: function (e) {
        var root = e.currentTarget,
            target = e.target;
        while (root !== target && target.className.indexOf('item') === -1) {
            target = target.parentNode;
        }
        return $A.util.getDataAttribute(target,'index');
    },
    _handleEvent: function (cmp, e) {
        var page = this._getPageNumber(e);
        this.goToPage(cmp, page);
    },
    _handleKeyEvent: function(cmp, e) {
        var keyCode = e.keyCode;
        if(keyCode === this.KEYS.left || keyCode === this.KEYS.right) {
            var pageNumber = parseInt(this._getPageNumber(e), 10);
            if(keyCode === this.KEYS.left && pageNumber > 0) {
                pageNumber--;
            }
            if(keyCode === this.KEYS.right) {
                var pages          = cmp.get('v.pageModels') || cmp.get('v.pageComponents'),
                    numberOfPages  = pages && pages.length || 0;

                if(pageNumber < numberOfPages - 1) {
                    pageNumber++;
                }
            }

            this.goToPage(cmp, pageNumber);

            if(e.preventDefault) {
                e.preventDefault();
            }
        }
    },
        /*
     * ==========================================
     *  PUBLIC METHODS
     * ==========================================
    */
    changeActivePage: function (cmp, evt) {
        var pageIndex   = parseInt(evt.pageIndex, 10),
            initialRender = evt.initialRender,
            container   = cmp.getElement(),
            pages       = container.getElementsByClassName('tab'),
            activePage  = cmp._activePage,
            selClass    = 'selected',
            currentPage = pages[activePage],
            newPage     = pages[pageIndex];

        if (newPage) {
            $A.util.removeClass(currentPage, selClass);
            currentPage.setAttribute('tabindex', "-1");
            currentPage.setAttribute('aria-selected',false);
            $A.util.addClass(newPage, selClass);
            newPage.setAttribute('aria-selected',true);
            newPage.setAttribute('tabindex', "0");
            if ($A.get('$Browser.isDesktop') && !initialRender) {
                newPage.focus(); // this causes a perf issue (extra paints) on android
            }
            cmp._activePage = pageIndex;
        }

    }, 
    goToPage: function (cmp, pageNumber) {
        var payload = {
            pageIndex : pageNumber
        };
        cmp.getEvent('pagerClicked').setParams(payload).fire();
    },
    setAriaAttributes: function(component, event) {
        var pageIndex   = parseInt(event.pageIndex, 10),
            pageId      = event.pageId || '',
            container   = component.getElement(),
            pages       = container.getElementsByClassName('tab'),
            page        = pages[pageIndex];

        page.setAttribute('aria-controls', pageId);
    },
    setIndicatorSize: function (cmp, indicatorDOM) {
        var pageModels     = cmp.get('v.pageModels'),
            pageComponents = cmp.get('v.pageComponents'),
            pages          = pageModels || pageComponents,
            numberOfPages  = pages && pages.length || 0,
            indicatorSize  = 100 / numberOfPages,
            stateSize      = 100 * numberOfPages, // Each page is max-width 100px if justifyContent='leftGrowRight', which is currently for Tablet+, set in CSS
            indicator      = indicatorDOM.getElementsByClassName('indicator-bar')[0],
            indicatorState = indicatorDOM.getElementsByClassName('indicator-state')[0],
            justifyContent = cmp.get('v.justifyContent'),
            items          = indicatorDOM.getElementsByClassName('item');
        
        // For Phone
        if (justifyContent === 'stretch') {
            if (indicator) {
                indicator.style.width = indicatorSize + '%';
            }
            if (indicatorState) {
                indicatorState.style.width = '100%';
            }
        } else if (justifyContent === 'leftGrowRight'){ // For Tablet+
            if (indicator) {
                indicator.style.width = '100px'; // Match the individual tab item width, which is set in css
            }
            
            if (indicatorState) {
                indicatorState.style.width = stateSize + 'px';
            }
            
            for (var i=0; i< items.length; i++) {
                items[i].style.maxWidth = '100px';
            }
        }
    },
    /*
     * @createDOM get's called on the render method 
    */
    createDOM: function (cmp) {
        var container      = document.createElement('div'),
            pageModels     = cmp.get('v.pageModels'),
            pageComponents = cmp.get('v.pageComponents'),
            numberOfPages  = pageModels.length || pageComponents.length,
            isPageModels   = !!pageModels.length,
            tmpl           = '', 
            page, label, i, root, selected, activePage;
        
        for (i = 0; i < numberOfPages; i++) {
            page     = isPageModels ? pageModels[i] : pageComponents[i];
            label    = page.label;
            if($A.util.isComponent(page)){
                if(page.isInstanceOf("ui:carouselPageIndicatorItem")){
                    label=page.get('v.label');
                }
            }
            if(!label){
                label=('Page ' + i);
            }
            selected = page.isSelected;
            
            tmpl     += this._createItem({
                selected     : selected || false,
                title        : label,
                index        : i
            }, cmp.get("v.isDotIndicator"));
            
            if (selected) {
                activePage = i;
            }
        }
        
        cmp._activePage = activePage || 0;
        container.innerHTML = this._createNavTemplate(tmpl);
        root = container.firstChild; //remove the useless div as root
        return root;
        
    }
})// eslint-disable-line semi