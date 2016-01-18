chrome.devtools.inspectedWindow.eval("window.location.href", function(url){

    // So we don't include Aura when inspecting an Inspector
    if(!url.startsWith("chrome-")) {
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

