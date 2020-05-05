var logicMemoryInit = {
    run: function(targetRoom)
    {
        this.init_sources(targetRoom);
    },

    init_sources: function(targetRoom)
    {
        // Only run if it hasn't been initialized yet
        if (targetRoom.memory.sources)
            return;

        // Room sources data initialization
        targetRoom.memory.sources = Array();
        var sources = targetRoom.find(FIND_SOURCES);
        for(var i = 0, l = sources.length; i < l; ++i)
        {
            targetRoom.memory.sources[i] = {};
            targetRoom.memory.sources[i].harvester = 'staticHarvester'; // dummy value
            targetRoom.memory.sources[i].haulers = 0;            
            targetRoom.memory.sources[i].id = sources[i].id;

            var look = targetRoom.lookForAtArea(LOOK_TERRAIN,
                                                sources[i].pos.y - 1,
                                                sources[i].pos.x - 1,
                                                sources[i].pos.y + 1,
                                                sources[i].pos.x + 1,
                                                true);
            var freeSlots = _.filter(look, function(obj)
            {
                return (obj["terrain"] != "wall") &&
                       (obj["terrain"] != "swamp");
            });

            if (!freeSlots.length) // Accept swamp, if no terrain is free
            {
                freeSlots = _.filter(look, function(obj) {
                    return (obj["terrain"] != "wall");
                });
            }

            // Still learning this: TODO: sort this and try clockwise order or find another strategy
            // console.log(global.ex(freeSlots));
            targetRoom.memory.sources[i].x = freeSlots[0]["x"];
            targetRoom.memory.sources[i].y = freeSlots[0]["y"];
        }

    },
};

module.exports = logicMemoryInit;