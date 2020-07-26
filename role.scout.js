// Game.spawns['Spawn1'].spawnCreep([MOVE], 'scout', {memory: {role: 'scout'}});

const roleScout = {
    /**
     *
     * @param {Creep} creep
     */
    run: function(creep)
    {
        if (creep.room.name !== creep.memory.currentRoom)
        {
            // We changed rooms. Run the room cache function
            this.update_room_cache(creep.room);




        }

        if (creep.room.name === creep.memory.nextRoom)
        {
            this.update_room_cache(creep.room);

            // Force update the room memory cache

            // Find next room to visit

            // Retreat if it's a room with hostiles.

            // If there's no hostiles, queue up the neighbors
        }

        const targetFlag = Game.flags.scout;
        if (targetFlag !== undefined)
        {
            if (creep.pos !== Game.flags.pos && !creep.fatigue)
            {
                creep.moveTo(targetFlag);
            }
        }
    },

    /**
     *
     * @param {Room} room
     */
    update_room_cache: function(room)
    {
        if (room.memory.status === undefined)
            room.memory.status = {}

        const hostileCreeps             = room.find(FIND_HOSTILE_CREEPS);
        const hostileStructures         = room.find(FIND_HOSTILE_STRUCTURES);
        const hostileSpawns             = room.find(FIND_HOSTILE_SPAWNS);
        const hostileConstructionSites  = room.find(FIND_HOSTILE_CONSTRUCTION_SITES);
        const hostilePowerCreeps        = room.find(FIND_HOSTILE_STRUCTURES);
        const roomControllerLevel       = room.controller.level;
        const roomControllerOwner       = room.controller.owner;
        const roomMinerals              = room.find(FIND_MINERALS);


        // Find hostiles, and if there are hostiles:
            // Check if it's a player
            // Check if there is a spawn
            // record the room controller level

        // Check if the room is claimed and record it

        // Record the number of sources in the room (potentially already done)
        // Record the mineral type in the room

        // Calculate the distance of the sources to our nearest spawn (or to all our spawns?)

        // Fot the future: Think of a score system, to rank the room

    }
}

module.exports = roleScout;