({
  
  handleAction: function (cmp, evt, hlp) {
        var name = evt.getParam('name');

        switch (name) {
            case 'disable': 
                hlp.changeRowDisabled(cmp, evt.getParam('index'), true);
                break;
            case 'enable':
            	hlp.changeRowDisabled(cmp, evt.getParam('index'), false);
            	break;
            case 'toggleClass':
            	hlp.changeRowClass(cmp, evt.getParam('index'), "error", "toggle");
        }
    }
})