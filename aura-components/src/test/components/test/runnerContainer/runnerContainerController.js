({
    init: function (cmp,event,helper) {
        var query=top.location.search.split('?')[1];
        
        var filter=query&&query.split("search=")[1];
        filter=filter&&filter.split('&')[0];

        if(filter){
            cmp.set("v.keyword",filter);
        }
    },
    render:function(cmp,event,helper){
        var filterInput=cmp.find("filterInput");
        $A.util.setFocus(filterInput);
    }
})