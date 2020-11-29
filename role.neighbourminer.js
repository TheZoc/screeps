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

// Game.spawns['Spawn1'].spawnCreep([MOVE,MOVE,WORK,WORK,CARRY,CARRY,CARRY,CARRY], 'neighbourminer', {memory: {role: 'R', harvestRoom: 'W8N4', deliveryRoom: 'W7N4'}});
// Game.spawns['Spawn1'].spawnCreep([MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY], 'neighbourminer', {memory: {role: 'R', harvestRoom: 'W8N4', deliveryRoom: 'W7N4'}});


// Game.spawns['Spawn1'].spawnCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY], 'neighbourminer', {memory: {role: 'R', harvestRoom: 'W9S53', deliveryRoom: 'W9S54'}});

// Harvest a neighbor room resource and put it in the main link

var roleNeighbourMiner = {

    run: function(creep)
    {
        if (creep.memory.working === undefined || creep.memory.working === true)
        {
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) < creep.store.getCapacity(RESOURCE_ENERGY))
            {
                let targetSource = null;
                if (creep.memory.targetSourceId !== undefined)
                {
                    targetSource = Game.getObjectById(creep.memory.targetSourceId);
                }
                else
                {
                    // Check if we already visited this room and initialized it's memory (Check logic.memoryinit.js)
                    if(Memory.rooms[creep.memory.harvestRoom])
                    {
                        this.pick_harvest_target(creep);
                        targetSource = Game.getObjectById(creep.memory.targetSourceId);
                    }
                }

                // targetSource can still be null, if we don't have visibility of the room.
                if (targetSource !== null ||
                        (creep.memory.targetSourceId !== null &&
                         creep.memory.targetSourceId !== undefined))
                {
                    const harvestPos = new RoomPosition(Memory.rooms[creep.memory.harvestRoom].sources[creep.memory.sourceIndex].x,
                                                       Memory.rooms[creep.memory.harvestRoom].sources[creep.memory.sourceIndex].y,
                                                       creep.memory.harvestRoom);

                    const inPosition = (targetSource !== null) ? creep.pos.inRangeTo(targetSource, 1)
                                                               : creep.pos.inRangeTo(harvestPos, 1);

                    if (!inPosition)
                    {
                        if (!creep.fatigue)
                        {
                            if (targetSource !== null)
                            {
                                creep.moveTo(targetSource.pos, {visualizePathStyle: {stroke: '#FF00FF'}});
                            }
                            else
                            {
                                creep.moveTo(harvestPos, {visualizePathStyle: {stroke: '#FF00FF'}});
                            }
                        }
                    }
                    else
                    {
                        const result = creep.harvest(targetSource);
                        if (result === ERR_NOT_ENOUGH_RESOURCES)
                        {
                            // If the source is empty and the creep is at least 20% full, build roads or return while waiting.
                            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getCapacity(RESOURCE_ENERGY) * 0.20)
                            {
                                creep.memory.working = false;
                                return;
                            }
                        }
                    }
                }
                else
                {
                    // If we're here and don't have a target source and no visibility, move to the target room.
                    if (creep.room.name !== creep.memory.harvestRoom) // This will make the creep freak out and wobble between rooms. Still, it's enough to view the room objects.
                    {
                        const exitDir = creep.room.findExitTo(creep.memory.harvestRoom);
                        const exit = creep.pos.findClosestByRange(exitDir);
                        creep.moveTo(exit);
                    }
                    else if (creep.room.name === creep.memory.harvestRoom)
                    {
                        this.pick_harvest_target(creep);
                    }
                    else
                    {
                        creep.say(">PANIC!<");
                    }
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
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) >= 20 && creep.room.name !== creep.memory.deliveryRoom)
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

            let targetLink = null;
            if (creep.memory.targetLinkId !== undefined)
            {
                targetLink = Game.getObjectById(creep.memory.targetLinkId);

                // If there is a storage in the place of the link, attempt to find a link, just in case the base has evolved since last time.
                if (targetLink.structureType === STRUCTURE_STORAGE)
                {
                    targetLink = null;
                }
            }

            if (targetLink === null)
            {
                let bestPath = null;
                let bestPathCost = 999999;

                const sourcePos = new RoomPosition(Memory.rooms[creep.memory.harvestRoom].sources[creep.memory.sourceIndex].x,
                                                   Memory.rooms[creep.memory.harvestRoom].sources[creep.memory.sourceIndex].y,
                                                   creep.memory.harvestRoom);

                // Find our target link, if this is the first
                // Assume we always have vision of the delivery room
                const links = (Game.rooms[creep.memory.deliveryRoom].find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_LINK }}));
                if(links.length > 0)
                {
                    let nearestLink = null;
                    for(let i = 0, l = links.length; i < l; ++i)
                    {
                        const result = this.find_distance(sourcePos, links[i].pos);
                        if (result.cost < bestPathCost)
                        {
                            bestPathCost = result.cost;
                            bestPath = result;
                            nearestLink = links[i];
                        }
                    }
                    // debug
                    //console.log("bestPath:\n" + ex(bestPath));

                    targetLink = nearestLink;
                    creep.memory.targetLinkId = nearestLink.id;
                }

                if (Game.rooms[creep.memory.deliveryRoom].storage !== undefined)
                {
                    // The storage acts both as a fail-safe and as a valid target if it's closer than the link.
                    const result = this.find_distance(sourcePos, Game.rooms[creep.memory.deliveryRoom].storage.pos);
                    if (result.cost < bestPathCost)
                    {
                        targetLink = Game.rooms.storage;
                        creep.memory.targetLinkId = Game.rooms[creep.memory.deliveryRoom].storage.id;
                    }
                }
            }

            if (!creep.pos.inRangeTo(targetLink.pos, 1))
            {
                if (!creep.fatigue)
                {
                    creep.moveTo(targetLink.pos, {visualizePathStyle: {stroke: '#FF00FF'}});
                }
            }
            else
            {
                const transferResult = creep.transfer(targetLink, RESOURCE_ENERGY);
                if (transferResult === OK || transferResult === ERR_NOT_ENOUGH_RESOURCES)
                {
                    creep.memory.working = true;
                }
            }
        }
    },


    pick_harvest_target: function(creep)
    {
        const roomMemory = Memory.rooms[creep.memory.harvestRoom];
        if(roomMemory === undefined)
            return;

        // If we're here, try to find an unused source, and assign ourselves to it.
        const roomSources = roomMemory.sources;
        for (let i = 0; i < roomSources.length; ++i)
        {
            let miner = Game.getObjectById(roomSources[i].harvester);

            // NOTE: This will allow a single creep per source. Change this if needed in future.
            if (miner !== null)
                continue;

            Memory.rooms[creep.memory.harvestRoom].sources[i].harvester = creep.id;
            creep.memory.targetSourceId = roomSources[i].id;
            creep.memory.sourceIndex = i;
            return;
        }

        // HACKY HACK: If we're still here, we still don't have a source. Just get a random one, but don't set this creep as the main harvester.
        const target_index = Game.time % roomSources.length;
        creep.memory.targetSourceId = roomSources[target_index].id;
        creep.memory.sourceIndex = target_index;
    },


    // TODO: Cache CostMatrix result.
    /**
     *
     * @param {RoomPosition} origin - The start position.
     * @param {object} destination - A goal or an array of goals. If more than one goal is supplied then the cheapest path found out of all the goals will be returned. A goal is either a RoomPosition or an object as defined below.
     Important: Please note that if your goal is not walkable (for instance, a source) then you should set range to at least 1 or else you will waste many CPU cycles searching for a target that you can't walk on.

     pos
     RoomPosition
     The target.
     range
     number
     Range to pos before goal is considered reached. The default is 0.
     * @return {{path:Array<RoomPosition>,opts:number,cost:number,incomplete:boolean}} An object containing: path - An array of RoomPosition objects; ops - Total number of operations performed before this path was calculated; cost - The total cost of the path as derived from plainCost, swampCost and any given CostMatrix instances; incomplete - If the pathfinder fails to find a complete path, this will be true. Note that path will still be populated with a partial path which represents the closest path it could find given the search parameters.
     */
    find_distance: function(origin, destination)
    {
        return PathFinder.search(
            origin,
            { pos: destination, range:1 },
            {
                // We need to set the defaults costs higher so that we
                // can set the road cost lower in `roomCallback`
                plainCost: 2,
                swampCost: 10,

                roomCallback: function(roomName)
                {

                    let room = Game.rooms[roomName];
                    // In this example `room` will always exist, but since
                    // PathFinder supports searches which span multiple rooms
                    // you should be careful!
                    if (!room) return;
                    let costs = new PathFinder.CostMatrix;

                    room.find(FIND_STRUCTURES).forEach(function(struct)
                    {
                        if (struct.structureType === STRUCTURE_ROAD)
                        {
                            // Favor roads over plain tiles
                            costs.set(struct.pos.x, struct.pos.y, 1);
                        }
                        else if (struct.structureType !== STRUCTURE_CONTAINER &&
                            (struct.structureType !== STRUCTURE_RAMPART || !struct.my))
                        {
                            // Can't walk through non-walkable buildings
                            costs.set(struct.pos.x, struct.pos.y, 0xff);
                        }
                    });

                    return costs;
                },
            }
        );
    }
}

module.exports = roleNeighbourMiner;