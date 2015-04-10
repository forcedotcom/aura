({
    STATE: {
        ENQUEUE: 'enqueued',
        RUNNING: 'running',
        FAILED : 'failed'
    },
    POLL_TIME : 3000,
    _parseTestName: function (name) {
        //return name.match(/\:?(\w+)\(/)[1];
        return name.match(/([^_]+\:?\w+)\(/)[1];
    },
    _parseTestNameSpace: function (ns) {
        return ns;
    },
    _parseStatus: function (status) {
        return status;
    },
    createRow: function (t) {
        return [
            '<li class="list-test-item" data-testid="' + t.name + '"' + (t.isInteg ? ' data-integ="true"' : ' ') + (t.jsConsole ? ' data-jsc="true"' : ' ') +'">',
                '<div class="parts">',
                    '<div class="checkbox">',
                    '<input type="checkbox" data-testid="' + t.name + '"/></div>',
                    '<div class="test">',
                        '<p class="name">' + this._parseTestName(t.name) + '</p>',
                        '<p class="ns">'+ this._parseTestNameSpace(t.name) + '</p>',
                    '</div>',
                    '<div class="status">',
                        '<span class="icon status-icon" data-state-text="'+ this._parseStatus(t.status) + '"></span>',
                        '<span class="icon results"></span>',
                    '</div>',
                    '<div class="jsConsole">',
                        '<a href="' + t.jsConsole + '" target="_blank">','<span class="icon icon-meter"></span></a>',
                    '</div>',
                '</div>',
                '<div class="exception"></div>',
            '</li>'
        ].join('');
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

        var list = document.createElement("ul");
            list.className = "list";

        var items = [];
        var length = testArray.length;
        for(var c=0;c<length;c++){
            items.push(this.createRow(testArray[c]));
        }

        while(items.length) {
            list.innerHTML = items.splice(0, testsPerBlock).join('');
            container.appendChild(list);

            list = document.createElement("ul");
            list.className = "list list-hidden";
        }

        var spacer = document.createElement("div");
        spacer.className="spacer";
        spacer.style.height = 5000 * container.childNodes.length + "px";
        container.appendChild(spacer);

        parent.appendChild(container);
    },

    attachEvents: function (cmp, dom) {
        var self        = this,
            inputSearch = dom.getElementsByClassName('search')[0],
            selectAll   = dom.getElementsByClassName('select')[0],
            runButton   = dom.getElementsByClassName('run')[0],
            integButton = dom.getElementsByClassName('integ')[0],
            failButton  = dom.getElementsByClassName('failed')[0],
            testContainer = dom.getElementsByClassName("test-container")[0];

        integButton.addEventListener('click', function (e) {
            self.toggleIntegrationTests(integButton, dom, e);
        });

        failButton.addEventListener('click', function (e) {
            self.toggleFailTests(cmp, failButton, dom, e);
        });

        inputSearch.addEventListener('input', function (e) {
            self.filterTests(dom, e.target.value);
        });

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
    },

    showAllSections: function() {
        var lists = document.getElementsByClassName("list-hidden");
        for(var c=0,length=lists.length;c<length;c++) {
            lists[0].classList.remove("list-hidden");
        }
    },

    toggleIntegrationTests: function (button, dom, e) {
        var children   = dom.querySelectorAll('li[data-integ]'),
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

    },
    filterTests: function (dom, query) {
        var children  = dom.getElementsByClassName("list-test-item"),
            matches   = [],
            regexp, li, name, i;

        for (i = 0; i < children.length; i++) {
            $A.util.setDataAttribute(children[i], 'visible', "visible");
        }
$A.log("filterTests with query:"+query,query);
        if (query) {
            regexp = new RegExp(query,'i');
            $A.log("try to find in list-test-item,length:"+children.length,children);
            for (i = 0; i < children.length; i++) {
                li = children[i];
                if (li.getElementsByTagName("input")[0].checked) {
                    continue;
                }
                name = li.getElementsByClassName('ns')[0].textContent;
                if (!regexp.test(name)) {
                    $A.util.setDataAttribute(li, 'visible', "hidden");
                } else {
                	$A.log("found one:"+name);
                }
                
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