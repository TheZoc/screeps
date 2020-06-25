//////////////////////////////////////////////////////////////////////////////
// Originally intended to me a memory manager, currently this only cleans up
// the memory from dead creeps.
//////////////////////////////////////////////////////////////////////////////

var logicMemory = {
    cleanup: function()
    {
        // Memory cleanup and role maintenance
        for(var name in Memory.creeps)
        {
            if(!Game.creeps[name])
            {
                // Decrease hauler count
                if (Memory.creeps[name].role == 'hauler')
                {
                    let creepSourceNum = Memory.creeps[name].source || 0;
                    let creepRoomName  = Memory.creeps[name].room;

                    --Memory.rooms[creepRoomName].sources[creepSourceNum].haulers;

                    if(Memory.rooms[creepRoomName].sources[creepSourceNum].haulers < 0)
                        Memory.rooms[creepRoomName].sources[creepSourceNum].haulers = 0
                }

                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }
    }
};

module.exports = logicMemory;