({
    onInit: function(cmp) {
        var listByReference = ['level1a', 'level1b', ['level2a', ['level3a'], 'level2b'], 'level1c'];
        cmp.set("v.listByReference", listByReference);

        var mapByReference = {
                layer1: "initial1",
                oneDeeper: {
                    layer2: "initial2",
                    evenOneDeeper: {
                        layer3: "initial3"
                    }
                }
            };
        cmp.set("v.mapByReference", mapByReference);

        var objectWithList = {
                intEntry: 777,
                stringEntry: "A Large Barge",
                listEntry: ['first','second','third']
        };
        cmp.set("v.objectWithList", objectWithList);
    },

    changeIntOuter: function(cmp) {
        var temp = cmp.get("v.intByReference");
        temp = 9999;
        cmp.set("v.intByReference", temp);
    },

    changeIntFacet: function(cmp) {
        var temp = cmp.find("innerCmp").get("v.intAttribute");
        temp = 5565;
        cmp.find("innerCmp").set("v.intAttribute", temp);
    },

    changeListOuter: function(cmp) {
        var list = cmp.get("v.listByReference");
        list[2][2] = "changedOuter2b";
        cmp.set("v.listByReference", list);
    },

    changeListFacet: function(cmp) {
        var list = cmp.find("innerCmp").get("v.listAttribute");
        list[2][2] = "changedFacet2b";
        cmp.find("innerCmp").set("v.listAttribute", list);
    },

    appendListOuter: function(cmp) {
        var list = cmp.get("v.listByReference");
        list.push("addedOuter1d");
        cmp.set("v.listByReference", list);
    },

    appendListFacet: function(cmp) {
        var list = cmp.find("innerCmp").get("v.listAttribute");
        list.push("addedFacet1d");
        cmp.find("innerCmp").set("v.listAttribute", list);
    },

    removeItemListOuter: function(cmp) {
        var list = cmp.get("v.listByReference");
        list.splice(list.length - 1, 1);
        cmp.set("v.listByReference", list);
    },

    removeItemListFacet: function(cmp) {
        var list = cmp.find("innerCmp").get("v.listAttribute");
        list.splice(list.length - 1, 1);
        cmp.find("innerCmp").set("v.listAttribute", list);
    },
    
    changeMapOuter: function(cmp) {
        var map = cmp.get("v.mapByReference");
        map.oneDeeper.evenOneDeeper.layer3 = "changedOuter3";
        cmp.set("v.mapByReference", map);
    },

    changeMapFacet: function(cmp) {
        var map = cmp.find("innerCmp").get("v.mapAttribute");
        map.oneDeeper.evenOneDeeper.layer3 = "changedFacet3";
        cmp.find("innerCmp").set("v.mapAttribute", map);
    },

    appendMapOuter: function(cmp) {
        var map = cmp.get("v.mapByReference");
        map.oneDeeper.evenOneDeeper['layer3b'] = "addedOuter3";
        map.oneDeeper['newEntry'] = { newLayer: "addedOuter4" };
        cmp.set("v.mapByReference", map);
    },
    
    appendMapFacet: function(cmp) {
        var map = cmp.find("innerCmp").get("v.mapAttribute");
        map.oneDeeper.evenOneDeeper['layer3b'] = "addedFacet3";
        map.oneDeeper['newEntry'] = { newLayer: "addedFacet4" };
        cmp.find("innerCmp").set("v.mapAttribute", map);
    },
    
    removeMapOuter: function(cmp) {
        var map = cmp.get("v.mapByReference");
        delete map.oneDeeper.evenOneDeeper['layer3'];
        cmp.set("v.mapByReference", map);
    },
    
    removeMapFacet: function(cmp) {
        var map = cmp.find("innerCmp").get("v.mapAttribute");
        delete map.oneDeeper.evenOneDeeper['layer3b'];
        delete map.oneDeeper['newEntry'];
        cmp.find("innerCmp").set("v.mapAttribute", map);
    }
})


