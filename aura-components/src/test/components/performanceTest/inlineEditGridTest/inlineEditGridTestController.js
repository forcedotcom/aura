({

    setup: function(cmp, event, helper) {
        var done = event.getParam('arguments').done;
        var finishSetup = done.async();
        cmp.numRows = cmp.get("v.numRows");

        helper.initGrid(cmp);

        // wait for the table to populate before ending setup
        (function waitFor() {
            if (document.getElementsByTagName("tbody")[0].children.length !== cmp.numRows) {
                setTimeout(waitFor, 4);
            } else {
                finishSetup();
            }
        })();

    },

    run: function(cmp, event, helper) {
        var testEdit = cmp.get("v.testEdit");
        var done = event.getParam('arguments').done;

        // test the performance of opening each inputText panel
        if (cmp.get("v.testPanels") === true) {
            var finishRun = done.async();

            // keep track of the rows and columns
            var i = 0;
            var j = 0;

            (function waitFor(document, click) {

                while (i < cmp.numRows) {
                    if (click) {
                        // show the input panel
                        helper.triggerEditOnCell(cmp, i, j);
                    }
                    // check to see if an input field is the active element, if not wait until it is
                    if (document.activeElement.tagName !== "INPUT") {
                        setTimeout(waitFor, 4, document, false);
                        return;
                    } else {
                        // if testing editing cell value
                        if(testEdit){
                            // change the cell value to 'X'
                            cmp.find("grid")._panelBody.get("v.inputComponent")[0].set("v.value", "X");
                            // trigger an 'Enter' keyboard event to save cell contents
                            cmp.find("grid")._panelBody.get("v.inputComponent")[0].getEvent("keydown").setParams({
                                keyCode: 13,
                                domEvent: {
                                    type: "keydown",
                                    preventDefault: function() {}
                                }
                            }).fire();
                        }

                        click = true;
                        // reset the active element
                        document.activeElement.blur();
                        if (j < 2) {
                            j = j + 1;
                        } else {
                            j = 0;
                            i = i + 1;
                        }

                        if (i == cmp.numRows) {
                            finishRun();
                        }
                    }
                }
            })(document, true);
        }
        // test the performance of just rendering the panel
        else {
            done.immediate();
        }
    },

    postProcessing: function(cmp, event, helper) {

    }
})