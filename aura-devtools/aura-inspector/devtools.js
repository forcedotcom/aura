chrome.devtools.inspectedWindow.eval("!!window[Symbol.for('AuraDevTools')] && !!window.$A", function(isAuraPresent){

    // So we don't include Aura when inspecting an Inspector
    if(isAuraPresent) {
        chrome.devtools.panels.create("Aura",
                                      "icon24.png",
                                      "devtoolsPanel/devtoolsPanel.html",
                                      function(/*ExtensionPanel*/ panel) {

                                          // Test button, not sure what to do with this.
                                          // var button = panel.createStatusBarButton("images/icon24.png", "Test", false);
                                          // button.onClicked.addListener(function(){
                                          //     alert("Clicked");
                                          // });
                                          //
                                          // Implement Search!
                                          // panel.onSearch.addListener(function(action, queryString){
                                          //     console.log("Searching!", action, queryString);
                                          // });

                                      });
    }
});
