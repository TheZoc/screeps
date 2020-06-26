//////////////////////////////////////////////////////////////////////////////
// This is a role for the Neighbor Miner creep.
// Their purpose is to harvest resources on a neighbour room.
// This is a prototype/WIP to understand how to change rooms correctly.
//
// TODO List:
// - Check if it's possible to have a logic similar to static harvester
// - Change the check for the source placement: Use the position initialized
//   in the memory, if available.
// - Add logic to repair the roads in a sensible way, if that makes sense.
//
//////////////////////////////////////////////////////////////////////////////

// Game.spawns['Spawn1'].spawnCreep([MOVE,MOVE,WORK,WORK,CARRY,CARRY,CARRY,CARRY], 'neighbourminer', {memory: {role: 'neighbourminer', room: 'W8N4'}});
// Game.spawns['Spawn1'].spawnCreep([MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY], 'neighbourminer', {memory: {role: 'neighbourminer', room: 'W8N4'}});

// Harvest a neighbor room resource and put it in the main link

var roleNeighbourMiner = {

    run: function(creep)
    {
        // Test server
        let deposit_link_id = "4836bc44497473b";

        // Official server
//        let deposit_link_id = "4836bc44497473b";


        if (creep.memory.working === undefined || creep.memory.working === true)
        {
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) < creep.store.getCapacity(RESOURCE_ENERGY))
            {
                let targetSource = null;
                if (creep.memory.targetSource !== undefined)
                {
                    targetSource = Game.getObjectById(creep.memory.targetSource);
                }

                if (targetSource !== null)
                {
                    if (!creep.pos.inRangeTo(targetSource.pos, 1))
                    {
                        if (!creep.fatigue)
                            creep.moveTo(targetSource.pos, {visualizePathStyle: {stroke: '#FF00FF'}});
                    }
                    else
                    {
                        creep.harvest(targetSource);
                    }
                }
                else
                {
                    if (creep.room.name !== creep.memory.room) // This will make the creep freak out and wobble between rooms. Still, it's enough to view the room objects.
                    {
                        const exitDir = creep.room.findExitTo(creep.memory.room);
                        const exit = creep.pos.findClosestByRange(exitDir);
                        creep.moveTo(exit);
                    }
                    else if (creep.room.name === creep.memory.room)
                    {
                        const roomSources = Memory.rooms[creep.memory.room].sources;
                        for (let i = 0; i < roomSources.length; ++i)
                        {
                            let miner = Game.getObjectById(roomSources[i].harvester);
                            if (miner !== null)
                                continue;

                            Memory.rooms[creep.memory.room].sources[i].harvester = creep.id;
                            creep.memory.targetSource = roomSources[i].id;
                            break;
                        }
                    }
                    else
                    {
                        creep.say(">PANIC!<");
                    }
                    return;
                }
            }
            else
            {
                creep.memory.working = false;
            }
        }
        else
        {
            // Prepare the needed roads on the first runs.
            // 20 here is an odd number I just guessed. Need to check how much is used while building.
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) >= 20)
            {
                let csRoads = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: { structureType: STRUCTURE_ROAD }});
                if (csRoads.length)
                {
                    const targetRoad = creep.pos.findClosestByPath(csRoads);
                    const buildResult = creep.build(targetRoad);
                    if(buildResult === ERR_NOT_IN_RANGE)
                    {
                        creep.say('🛣️roads');
                        if (!creep.fatigue)
                            creep.moveTo(targetRoad, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                    return;
                }
            }

            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) < 20)
            {
                // We spent everything building roads. Try to harvest again.
                creep.memory.working = true;
                return;
            }


            const target = Game.getObjectById(deposit_link_id);
            if (!creep.pos.inRangeTo(target.pos, 1))
            {
                if (!creep.fatigue)
                {
                    creep.moveTo(target.pos, {visualizePathStyle: {stroke: '#FF00FF'}});
                }
            }
            else
            {
                const transferResult = creep.transfer(target, RESOURCE_ENERGY);
                if (transferResult === OK || transferResult === ERR_NOT_ENOUGH_RESOURCES)
                {
                    creep.memory.working = true;
                }
            }
        }
    }
}

module.exports = roleNeighbourMiner;