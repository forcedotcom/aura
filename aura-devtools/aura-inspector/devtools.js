// chrome.devtools.panels.elements.createSidebarPane("Aura", function(sidebar) {
//     function page_getProperties() {
//       try {
//         var cmp = window.$A && $0 ? window.$A.services.component.getRenderingComponentForElement($0) : {};
//         if(cmp){
//           return window.$A.devToolService.output(cmp);
//         }
//       } catch (e) {return {"stack" : e.stack};}
//     }

//   function updateElementProperties() {
//     sidebar.setExpression("(" + page_getProperties.toString() + ")()");
//   }
//   updateElementProperties();
//   chrome.devtools.panels.elements.onSelectionChanged.addListener(updateElementProperties);
// });

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

