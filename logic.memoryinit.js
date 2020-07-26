//////////////////////////////////////////////////////////////////////////////
// This file initializes the structure we need in the memory to run the bot.
// It should be present in a loop of rooms, but all the functions will be
// skipped if the memory for the target room was already initialized.
//////////////////////////////////////////////////////////////////////////////

var logicMemoryInit = {

    /**
     * This is the entry point for the memory initialization logic
     *
     * @param {Room} targetRoom - The room to initialize the memory for.
     */
    run: function(targetRoom)
    {
        this.init_sources(targetRoom);
        this.init_next_update_timestamps(targetRoom);
    },

    /**
     * Find the sources of a room, and store in memory the place where the bot intends to create a
     * container and put the static harvester in.
     *
     * Right now, this functions looks for the first available plain. If that's not available, looks
     * for the first available swamp.
     *
     * @param {Room} targetRoom - The room to initialize the memory for.
     */
    init_sources: function(targetRoom)
    {
        // Only run if it hasn't been initialized yet
        if (targetRoom.memory.sources)
            return;

        // Room sources data initialization
        targetRoom.memory.sources = Array();
        const sources = targetRoom.find(FIND_SOURCES);
        for(let i = 0, l = sources.length; i < l; ++i)
        {
            targetRoom.memory.sources[i] = {};
            targetRoom.memory.sources[i].harvester = 'staticHarvester'; // dummy value
            targetRoom.memory.sources[i].haulers = 0;
            targetRoom.memory.sources[i].id = sources[i].id;

            const look = targetRoom.lookForAtArea(LOOK_TERRAIN,
                                                sources[i].pos.y - 1,
                                                sources[i].pos.x - 1,
                                                sources[i].pos.y + 1,
                                                sources[i].pos.x + 1,
                                                true);
            let freeSlots = _.filter(look, function(obj)
            {
                return (obj["terrain"] !== "wall") &&
                       (obj["terrain"] !== "swamp");
            });

            if (!freeSlots.length) // Accept swamp, if no terrain is free
            {
                freeSlots = _.filter(look, function(obj) {
                    return (obj["terrain"] !== "wall");
                });
            }

            // Still learning this: TODO: sort this and try clockwise order or find another strategy
            // console.log(global.ex(freeSlots));
            targetRoom.memory.sources[i].x = freeSlots[0]["x"];
            targetRoom.memory.sources[i].y = freeSlots[0]["y"];
        }

    },

    /**
     * This initializes the "Next Update" memory to save CPU power in some functions.
     * Reminder: This initializes the variable per room, so it should be only used
     * with functions that are ran in a per-room basis.
     *
     * @param {Room} targetRoom
     */
    init_next_update_timestamps: function(targetRoom)
    {
        if (targetRoom.memory.nextUpdate)
            return;

        targetRoom.memory.nextUpdate = {};
        targetRoom.memory.nextUpdate.extensions = 0;
        targetRoom.memory.nextUpdate.spawnQueue = 0;
    },

    /**
     *
     * @param targetRoom {Room}
     */
    init_scouting: function(targetRoom)
    {
        if (targetRoom.memory.scouting !== undefined)
            return;

        // This initialization should be handled elsewhere, to be easier to maintain. Keeping it here for now.
        targetRoom.memory.scouting = {}
        targetRoom.memory.scouting.scoutId = null;
    }
};

module.exports = logicMemoryInit;