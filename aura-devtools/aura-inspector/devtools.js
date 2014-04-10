function page_getProperties() {
  try {
    var cmp = window.$A && $0 ? window.$A.services.component.getRenderingComponentForElement($0) : {};
    if(cmp){
      return window.$A.devToolService.output(cmp);
    }
  } catch (e) {return {"stack" : e.stack};}
}

chrome.devtools.panels.elements.createSidebarPane("Aura", function(sidebar) {
  function updateElementProperties() {
    sidebar.setExpression("(" + page_getProperties.toString() + ")()");
  }
  updateElementProperties();
  chrome.devtools.panels.elements.onSelectionChanged.addListener(updateElementProperties);
});

chrome.devtools.panels.create("Aura",
                              "icon24.png",
                              "devtoolsPanel.html",
                              function(panel) {
                                panel.onShown.addListener(function(win){
                                  win.refresh();
                                });
                              });
