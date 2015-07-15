({
    STATE: {
        ENQUEUE: 'enqueued',
        RUNNING: 'running',
        FAILED : 'failed'
    },
    POLL_TIME : 3000,
    _parseTestName: function (name) {
        //return name.match(/\:?(\w+)\(/)[1];
        return name.match(/([^_$]+\:?\w+)\(/)[1];
    },
    _parseTestNameSpace: function (ns) {
        return ns;
    },
    _parseStatus: function (status) {
        return status;
    },
    createRow: function (t) {
    	//changes from array join to string concat for performance reason
        return '<li class="list-test-item" data-testid="' + t.name + '" test-type="' + t.type + '"' + (t.jsConsole ? ' data-jsc="true"' : ' ') +'">' +
                '<div class="parts">' +
                	'<div class="test-type"></div>' +
                    '<div class="checkbox">'+
                    '<input type="checkbox" class="chk-test" data-testid="' + t.name + '" /></div>' +
                    '<div class="test">' +
                        '<p class="name">' + this._parseTestName(t.name) + '</p>' +
                        '<p class="ns">'+ this._parseTestNameSpace(t.name) + '</p>' +
                    '</div>' +
                    '<div class="status">' +
                        '<span class="icon status-icon" data-state-text="'+ this._parseStatus(t.status) + '"></span>' +
                        '<span class="icon results"></span>' +
                    '</div>' +
                    '<div class="jsConsole">' +
                        '<a href="' + t.jsConsole + '" target="_blank"><span class="icon icon-meter"></span></a>' + 
                    '</div>' +
                '</div>' +
                '<div class="exception"></div>' +
            '</li>';
    },
    buildDOM: function (testArray) {
        var placeholder = document.createElement('div'),
            tmp = '<div class="test-container"><ul class="list">', i;

        for (i = 0; i < testArray.length; i++) {
            tmp += this.createRow(testArray[i]);
        }

        tmp += '</ul></div>';
        placeholder.innerHTML = tmp;
        return placeholder.firstChild;
    },
    renderTests: function(testArray, parent){
        var testsPerBlock = 100;
        var container = document.createElement("div");
            container.className = "test-container";
        
            
        var selectedList = document.createElement("ul");
        selectedList.className = "list selected-list";
        container.appendChild(selectedList);
            
        var curTestsPerBlock = testsPerBlock;
        var list;
        
        var length = testArray.length;
        for(var c=0;c<length;c++){
        	if (list === undefined){
    			//first ul
    			list = document.createElement("ul");
                list.className = "list";
                container.appendChild(list);
    		}
        	else if(curTestsPerBlock === 0){
        		//subsequent ul
        		curTestsPerBlock = testsPerBlock;
    			list = document.createElement("ul");
                list.className = "list list-hidden";
                container.appendChild(list);
        	}
        	
        	//insert to the dom
        	list.insertAdjacentHTML(
    			'beforeend',
    			this.createRow(testArray[c])
			);
        	
        	//decrease count
        	curTestsPerBlock--;
        }

        var spacer = document.createElement("div");
        spacer.className="spacer";
        spacer.style.height = 5000 * container.childNodes.length + "px";
        container.appendChild(spacer);

        parent.appendChild(container);
    },

    attachEvents: function (cmp, dom) {
        var self        = this,
        	inputOperator = dom.getElementsByClassName("search-ops")[0],
        	inputCaseSensitive = dom.querySelector('.search-case-sensitive input'),
        	labelCountSelected = dom.querySelector('#count_selected'),
            inputSearch = dom.getElementsByClassName('search')[0],
            selectAll   = dom.getElementsByClassName('toggle_select_all')[0],
            scrollToTop   = dom.getElementsByClassName('scroll_to_top')[0],
            runButton   = dom.getElementsByClassName('run')[0],
            failButton  = dom.getElementsByClassName('toggle_failed')[0],
            testContainer = dom.getElementsByClassName("test-container")[0],
            selectedList = testContainer.querySelector('.selected-list'),
            toggleTestType = dom.querySelector('.toggle_test_type');
        
        var timeoutDebounce, totalDebounceTime = 1500;

        failButton.addEventListener('click', function (e) {
            self.toggleFailTests(cmp, failButton, dom, e);
        });

        
        var handlerSearchInputChange = function () {
        	if(timeoutDebounce){
    			clearTimeout(timeoutDebounce);
    		}
    		
    		//doing a little stuff here
        	testContainer.style.opacity = '0.2';
        	
    		//little debounce
			timeoutDebounce = setTimeout(function(){
			    var test_unit = toggleTestType != null && toggleTestType.querySelector('input.test_unit');
			    var test_integ = toggleTestType != null && toggleTestType.querySelector('input.test_integ');
			    var test_jstest = toggleTestType != null && toggleTestType.querySelector('input.test_jstest');
			    var test_webdriver = toggleTestType != null && toggleTestType.querySelector('input.test_webdriver');
        		self.filterTests(
    				dom,
    				inputSearch.value,
    				inputOperator.value,
    				inputCaseSensitive.checked,
    				test_unit && test_unit.checked,
    				test_integ && test_integ.checked,
    				test_jstest && test_jstest.checked,
    				test_webdriver && test_webdriver.checked
				);
        		testContainer.style.opacity = '';
        	}, totalDebounceTime);
        };
        inputSearch.addEventListener('input', handlerSearchInputChange);
        inputOperator.addEventListener('input', handlerSearchInputChange);
        inputCaseSensitive.addEventListener('change', handlerSearchInputChange);
        if (toggleTestType != null) {
            var testTypeInputs = toggleTestType.querySelectorAll('input');
            for (var i = 0; i < testTypeInputs.length; i++){
                testTypeInputs[i].addEventListener('change', handlerSearchInputChange);
            }
        }    
        
        selectAll.addEventListener('click', function (e) {
            self.toggleSelection(selectAll, dom, e);
        });

        runButton.addEventListener('click', function (e) {
            self.runTests(cmp, dom, e);
        });
        

        testContainer.addEventListener("scroll", function TestContainer_OnScroll(e) {
            var spacer = testContainer.getElementsByClassName("spacer")[0];
            var hiddenLists = testContainer.getElementsByClassName("list-hidden");

            // Are we more than half way down the list?
            while(testContainer.scrollTop > spacer.offsetTop  / 2) {
                var hidden = hiddenLists[0];
                if(!hidden) {
                    spacer.parentNode.removeChild(spacer);
                    testContainer.removeEventListener("scroll", TestContainer_OnScroll);
                    return;
                }
                $A.util.removeClass(hidden, "list-hidden");
                spacer.style.height = (5000 * hiddenLists.length) + "px";
            }
        });
        
        scrollToTop.addEventListener('click', function(){
        	testContainer.scrollTop = 0;
        });
        
        //delegate for checkbox state
        testContainer.addEventListener('click', function(e){        	
        	if (e.target.nodeName === "INPUT" && e.target.classList.contains('chk-test')){
        		//get the closest li
    			var targettedRow = e.target;
            	while(targettedRow && targettedRow.nodeName !== "LI"){
            		targettedRow = targettedRow.parentNode;
            	}
        		
        		if (e.target.checked === true){
        			//move to top
        			selectedList.insertAdjacentElement("AfterBegin", targettedRow);
            	}
        		else{
        			if (targettedRow.parentElement.classList.contains('selected-list')){
        				//move the stuff back to the end of the list
        				selectedList.insertAdjacentElement("BeforeEnd", targettedRow);
        			}
        		}
        		targettedRow.classList.toggle("hl-row");
        		
        		//update the selected test count
        		var countSelected = testContainer.querySelectorAll('.chk-test:checked').length;
        		self._updateSelectedTestCount(dom, countSelected);
        	}
        });
        
        
        //filter on page load if needed
        //handle initial attribute if any query string
        var keyword = cmp.get('v.keyword');
        if (keyword !== undefined && keyword.length > 0){
        	handlerSearchInputChange();
        }
    },
    
    showAllSections: function() {
        var lists = document.getElementsByClassName("list-hidden");
        for(var c=0,length=lists.length;c<length;c++) {
            lists[0].classList.remove("list-hidden");
        }
    },

    toggleIntegrationTests: function (button, dom, e) {
        var children   = dom.querySelectorAll('li[test-type="integration"]'),
            selected   = $A.util.getDataAttribute(button, 'selected') !== "true",
            visibility = selected ? 'hidden': 'visible',
            i;

            // we dont do it with CSS because we need to update the state of the li elements
            for (i = 0; i < children.length; i++) {
                $A.util.setDataAttribute(children[i], 'visible', visibility);
            }
            button.firstChild.checked = selected;
            $A.util.setDataAttribute(button, 'selected', selected);
            this.showAllSections();
    },
    toggleFailTests: function (cmp, button, dom, e) {
        var children   = dom.querySelectorAll('li:not([data-state="failed"])'),
            selected   = $A.util.getDataAttribute(button, 'selected') !== "true",
            visibility = selected ? 'hidden': 'visible',
            i;
            if (!cmp._finishRun) {
                return alert('You need to run tests first!');
            }

            // we dont do it with CSS because we need to update the state of the li elements
            for (i = 0; i < children.length; i++) {
                $A.util.setDataAttribute(children[i], 'visible', visibility);
            }
            $A.util.setDataAttribute(button, 'selected', selected);
            button.firstChild.checked = false;
            this.showAllSections();
    },
    toggleSelection: function (button, dom, e) {
        var filtered   = dom.querySelectorAll('li:not([data-visible="hidden"]) input[type="checkbox"]'),
            needsCheck = false, 
            input, i;

        if ($A.util.getDataAttribute(button, 'selected') !== "true") {
            $A.util.setDataAttribute(button, 'selected', true);
            button.firstChild.checked = true;
            button.lastChild.textContent = 'Unselect all';
            needsCheck = true;
        } else {
            $A.util.setDataAttribute(button, 'selected', false);
            button.lastChild.textContent = 'Select all';
            button.firstChild.checked = false;
        }

        for (i = 0; i < filtered.length; i++) {
            input = filtered[i];
            input.checked = needsCheck;
        }
        
    	this._updateSelectedTestCount(dom, needsCheck ? filtered.length : 0);
    },
    _updateSelectedTestCount: function(dom, count){
    	dom.querySelector('#count_selected').innerHTML = count > 0 ? ' (' + count + ' selected)' : ' !'
    },
    calcOrOperators: function(regexp, name){
    	for (var j = 0; j < regexp.length; j++){
        	if (regexp[j].test(name) === true) {
        		//at least one match
        		return true;
        	}
        }
    	
    	return false;
    },
    calcAndOperators: function(regexp, name){
    	for (var j = 0; j < regexp.length; j++){
        	if (regexp[j].test(name) === false) {
        		//at least one not matched, return
        		return false;
        	}
        }
    	
    	return true;//all matched
    },
    filterTests: function (dom, query, logicOps, isCaseSensitive, test_unit, test_integ, test_jstest, test_webdriver) {   	
        var children  = dom.getElementsByClassName("list-test-item"),
        	calcOperator = logicOps === 'AND' ? this.calcAndOperators : this.calcOrOperators,
			hasAtLeastOneVisible = false,
            matches   = [],
            regexp = [], li, name, i, queries;
        
        
        query = query || '';
        query = query.trim()

    	if (query.length === 0 && test_unit && test_integ && test_jstest && test_webdriver) {
    		//when it is empty, just show it
        	for (i = 0; i < children.length; i++) {
                $A.util.setDataAttribute(children[i], 'visible', 'visible');
            }
    	}
    	else {
        	//allow use of , to match multiple item
    		if (query.length > 0){
    			queries = query.split(',');
            	
            	for (var i = 0 ; i < queries.length; i++){
            		var query_str = queries[i].trim();
            		if (query_str.length > 0){
            			regexp.push(
        					new RegExp(query_str, isCaseSensitive ? '' : 'i')
    					);
            		}
            	}
    		}
        	
            for (i = 0; i < children.length; i++) {
            	var isVisible = false;
            	
                li = children[i];
                if (li.getElementsByTagName("input")[0].checked) {
                	//if checked, always visible
                    isVisible = true;
                }
                else{
                	name = li.getElementsByClassName('ns')[0].textContent;
                	
                	if (test_unit === true && $A.util.getElementAttributeValue(li, 'test-type') === 'unit'){
                        isVisible = true;
                    }
                	else if (test_integ === true && $A.util.getElementAttributeValue(li, 'test-type') === 'integration'){
                		isVisible = true;
                	}
                    else if (test_jstest === true && $A.util.getElementAttributeValue(li, 'test-type') === 'jstest'){
                        isVisible = true;
                    }                	
                    else if (test_webdriver === true && $A.util.getElementAttributeValue(li, 'test-type') === 'webdriver'){
                        isVisible = true;
                    }
                	
                    //calling the regex match
                	if (isVisible === true && queries !== undefined){
                		//only need regex again if isvisible true
                		isVisible = calcOperator(regexp, name);
                	}
                }
                
                hasAtLeastOneVisible = hasAtLeastOneVisible || isVisible;
                                
                $A.util.setDataAttribute(children[i], 'visible', isVisible === true ? 'visible' : 'hidden');
            }
            
            if(hasAtLeastOneVisible === false){
            	alert('There is no test matching your filter');
            }
        }
        
        this.showAllSections();
    },
    _getLiFromInput: function (input) {
        return input.parentElement.parentElement.parentElement;
    },
    runTests: function (cmp, dom, e) {
        var self       = this,
            testCb     = dom.querySelectorAll('input[type="checkbox"]:checked'),
            testRunner = cmp.get("c.runTestSet"),
            pollTime   = this.POLL_TIME,
            tests      = [],
            row,li, i, id;
        
        if (cmp._runningTests) {
               var r = confirm("Tests are still pending execution. Are you sure you want to submit a new request?");
               if (r == true) {
                      this.updateStatus("Submiting a new request");
               } else {
                      this.updateStatus("Continue working on pending execution.");
                      return;
               }
        }
        console.log(testCb);
        for (i = 0; i < testCb.length; i++) {
            row      = testCb[i];
            id       = $A.util.getDataAttribute(row, 'testid');
            if(id){
                   tests.push(id);
                li = this._getLiFromInput(row);
                   $A.util.setDataAttribute(li, 'state', this.STATE.ENQUEUE);
            }
        }

        if (tests.length) {
            testRunner.setParams({testSet: tests});
            testRunner.setCallback(this, function(action) {
                   if (action.getState() === "SUCCESS") {
                       setTimeout(function () {
                              //we don't have first pollAction yet, pass undefined 
                           self.pollTestResults(cmp, dom, undefined, action);
                       }, pollTime);
                   } else if (action.getState() == "INCOMPLETE" || action.getState() == "ERROR") {
                          alert("testRunner Action un-successful (return state = "+action.getState()+"), please check the server");
                          finishTestRun(cmp, null, null, false);
                   } else {
                          console.log("we have abort the testRunner action#"+action.getId(),action);
                   }
            });
            this.updateStatus('Enqueueing '+ tests.length +' tests...');
            $A.run(function () {
                cmp._runningTests = true;
                $A.enqueueAction(testRunner);
            });
        } else {
            this.updateStatus('No tests to run...');
            alert('You must select at least one test');
        }
        
    },
    updateStatus: function (status) {
        //TODO: Send an event instead
        i = document.body.querySelector('.status-bar');
        i.textContent = status;
    },
    updateTests: function (result, dom) {
        var testsMap     = result.testsWithPropsMap,
            enqueueState = this.STATE.ENQUEUE,
            runningState = this.STATE.RUNNING,
            selectorEnq  = 'li[data-state="' + enqueueState + '"]',
            selectorRun  = 'li[data-state="' + runningState + '"]',
            enqueueTest  = Array.prototype.slice.call(dom.querySelectorAll(selectorEnq)),
            runningTest  = Array.prototype.slice.call(dom.querySelectorAll(selectorRun)),
            queuedTest   = enqueueTest.concat(runningTest),
            test, update, id, i, updateState;

        for (i = 0; i < queuedTest.length; i++) {
            test   = queuedTest[i];
            id     = $A.util.getDataAttribute(test, 'testid');
            update = testsMap[id];
            updateState = update.status.toLowerCase();
            $A.util.setDataAttribute(test, 'state', updateState);
            console.log(update);
            if (updateState === this.STATE.FAILED) {
                test.querySelector('.exception').innerHTML = update.exception
                                                                .replace(/&/g, '&amp;')
                                                                .replace(/</g, '&lt;')
                                                                .replace(/>/g, '&gt;')
                                                                .replace(/\n/g, '<br>')
                                                                .replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
            }
        }
        this.updateStatus('Tests Running | Last update: ' + (new Date()).toLocaleString());
    },
    finishTestRun: function (cmp, actionResult, dom, success) {
        if(success) {
               this.updateTests(actionResult, dom);
               this.updateStatus('Ready to run more tests!');
        }
        cmp._runningTests = false;
        cmp._finishRun = true;
    },
    pollTestResults: function (cmp, containerDOM, previousPollActionForThisTestRunnerAction, testRunnerActionCurrent) {
        var self       = this,
            pollAction = cmp.get("c.pollForTestRunStatus"),
            pollTime   = this.POLL_TIME,
            dom        = containerDOM || cmp.getElement();
        
        pollAction.setAbortable(true);
        pollAction.setCallback(this, function (action) {
            if (action.getState() === "SUCCESS") {
                var actionResult = action.getReturnValue();
                self.updateTests(actionResult, dom);
                if (actionResult.testsRunning) {
                    setTimeout(function() {
                        self.pollTestResults(cmp, dom, action, testRunnerActionCurrent);
                                   }, pollTime);
                            } else {
                                          self.finishTestRun(cmp, actionResult, dom, true);
                            }
            } else if (action.getState() == "INCOMPLETE" || action.getState() == "ERROR"){
                   alert("poll Action un-successful (return state = "+action.getState()+"), please check the server");
                   self.finishTestRun(cmp, null, null, false);//we still better to clear cmp._XXX up
            } else {
                   console.log("we have abort the pollAction:"+action.getId()); 
            }
        });
        
        //we only set abortableID to pollActions after the first one for each testRunner Action.
        //so when new testRunner Action success, the pollActions belong to revious testRunner Action will get aborted.
        if( previousPollActionForThisTestRunnerAction != undefined ) {
            pollAction.setParentAction(previousPollActionForThisTestRunnerAction); 
           }

        $A.run(function () {
               $A.enqueueAction(pollAction);
        });
    }
})