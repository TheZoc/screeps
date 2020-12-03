//////////////////////////////////////////////////////////////////////////////
// This file is responsible for processing the spawn queue created by
// logic.spawnqueue.js.
// Depending on the role spawned, post-spawn logic will be added as needed.
//////////////////////////////////////////////////////////////////////////////

const constants = require("util.constants");

let logicSpawn = {

    run: function(room)
    {
        if (Memory.rooms[room.name].spawnQueue === undefined || Memory.rooms[room.name].spawnQueue.length === 0)
            return;

        // Use the spawn queue we store in memory.
        this.spawnQueue = new FlatQueue(Memory.rooms[room.name].spawnQueue);

        const roomSpawns = _.filter(Game.spawns, (spawn) => spawn.room.name === room.name);
        for (const spawn of roomSpawns)
        {
            if (spawn.spawning !== null)
                continue;

            const spawnData = this.spawnQueue.peek();

            // Check if the queue is empty
            if (spawnData === undefined)
                return;

            const creepSpawn = util.creepSpawn(spawn, spawnData);
            if (creepSpawn === OK)
            {
                this.spawnQueue.pop();
                this.post_spawn_initialization(room, spawnData);
            }
        }
    },

    post_spawn_initialization(room, spawnData)
    {
        switch(spawnData.memory.role)
        {
            case constants.ROLE_STATIC_HARVESTER:
                room.memory.sources[spawnData.memory.source].harvester = spawnData.name;
                break;

            case constants.ROLE_TRANSPORTER:
                ++room.memory.sources[spawnData.memory.source].haulers;
                break;
        }
    }
}


module.exports = logicSpawn;
