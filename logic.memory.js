//////////////////////////////////////////////////////////////////////////////
// Originally intended to me a memory manager, currently this only cleans up
// the memory from dead creeps.
//////////////////////////////////////////////////////////////////////////////

const constants = require("util.constants");

let logicMemory = {
    cleanup: function()
    {
        // Memory cleanup and role maintenance
        for(var name in Memory.creeps)
        {
            if(!Game.creeps[name])
            {
                // Decrease hauler count
                if (Memory.creeps[name].role === 'hauler' || Memory.creeps[name].role === constants.ROLE_TRANSPORTER)
                {
                    let creepSourceNum = Memory.creeps[name].source || 0;
                    let creepRoomName  = Memory.creeps[name].room;

                    if (Memory.rooms[creepRoomName] !== undefined && Memory.rooms[creepRoomName].sources !== undefined)
                    {
                        --Memory.rooms[creepRoomName].sources[creepSourceNum].haulers;

                        if (Memory.rooms[creepRoomName].sources[creepSourceNum].haulers < 0)
                            Memory.rooms[creepRoomName].sources[creepSourceNum].haulers = 0
                    }
                }

                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    }


    // Todo: Delete variable `this.room.memory.staticHarvesting` when room reaches level 2
};

module.exports = logicMemory;