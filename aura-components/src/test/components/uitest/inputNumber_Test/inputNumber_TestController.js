({
    doSomeThing : function (cmp,event, helper) {
        var eventList = cmp.get('v.eventList');

        // update last event fired
        event.type = event.getName();
        cmp.set('v.eventFired',event);

        // add the event to the event list
        eventList.push(event);
        cmp.set('v.eventList', eventList);
    },
    init : function (cmp, event, helper) {
        cmp.find('Number').addHandler('change',cmp,'c.doSomeThing');
        cmp.find('Number').addHandler('input' ,cmp,'c.doSomeThing');
        cmp.find('Number').addHandler('focus',cmp,'c.doSomeThing');
        cmp.find('Number').addHandler('blur' ,cmp,'c.doSomeThing');
        cmp.find('Number').addHandler('copy',cmp,'c.doSomeThing');
        cmp.find('Number').addHandler('paste' ,cmp,'c.doSomeThing');
        cmp.find('Number').addHandler('keypress',cmp,'c.doSomeThing');
        cmp.find('Number').addHandler('keydown' ,cmp,'c.doSomeThing');
        cmp.find('Number').addHandler('keyup' ,cmp,'c.doSomeThing');
    }
})