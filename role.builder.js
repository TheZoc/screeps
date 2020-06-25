//////////////////////////////////////////////////////////////////////////////
// This is a role for the Builder creep.
// Their purpose is to get available resources, in the following priority
// order: Storage > Static Harverter's container > harvest from source.
// And then build and repair structures in the room.
//////////////////////////////////////////////////////////////////////////////

var roleBuilder = {

    /**
     * This function runs the Builder behavior for the given creep.
     * It is a finite state machine with 2 possible states: Building or not.
     *
     * If the creep has just spawned, look for a resource pool to collect from
     * and will proceed in the not building state.
     *
     * Not-Building state:
     * Do some sanity checks for the resource pool to collect from, and start moving
     * on it's way. If it's a source, harvest from. If it's a container, transfer
     * (collect) from.
     * If at least 50% of it's capacity is collected from the resource pool, it will
     * transition to the Building state. Otherwise, it will look for another source
     * to fill it's container.
     *
     * Building state:
     * The creep will attempt to move to and build or repair with the following priority:
     * - Construction Sites for Extensions
     * - Construction Sites (others)
     * - Repair own structures with 90% or less Hit points
     * - Repair roads or containers with 80% or less Hit points
     * - Repair walls until they have 1% of Hit points (3 millions HP)
     *
     * The main.js file is responsible to assign the creep to the Upgrader role if there
     * isn't any building work to do.
     *
     * @param {Creep} creep - Creep to execute the role
     */
    run: function(creep)
    {
        if(creep.memory.building && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0)
        {
            creep.say('🔄 harvest');
            creep.memory.building = false;
            this.pick_resource_target(creep);
        }
        if (!creep.memory.building && creep.store.getUsedCapacity(RESOURCE_ENERGY) === creep.store.getCapacity(RESOURCE_ENERGY))
        {
            creep.say('🚧 build');
            creep.memory.building = true;
        }

        if(creep.memory.building)
        {
            // Prioritize extensions
            let csExtensions = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: { structureType: STRUCTURE_EXTENSION }});
            if (csExtensions.length)
            {
                let targetExtension = creep.pos.findClosestByPath(csExtensions);
                if(creep.build(targetExtension) === ERR_NOT_IN_RANGE)
                {
                    creep.say('🚧🏠');
                    if (!creep.fatigue)
                        creep.moveTo(targetExtension, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                return;
            }

            // If there's no extensions, go to the closest CS
            let targetCS = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
            if(targetCS)
            {
                if(creep.build(targetCS) === ERR_NOT_IN_RANGE)
                {
                    creep.say('🚧');
                    if (!creep.fatigue)
                        creep.moveTo(targetCS, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else
            {
                // No building target? Repair!
                let damagedStructure = creep.room.find(FIND_MY_STRUCTURES, {
                        filter: (structure) => structure.hits < structure.hitsMax
                });

                if (damagedStructure)
                {
                    let closestMyDamagedStructure = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                        filter: (structure) => structure.hits < structure.hitsMax * 0.9
                    });
                    if (closestMyDamagedStructure)
                    {
                        if(creep.repair(closestMyDamagedStructure) === ERR_NOT_IN_RANGE)
                        {
                            creep.say('🔧 rep M 90%');
                            if (!creep.fatigue)
                                creep.moveTo(closestMyDamagedStructure, {visualizePathStyle: {stroke: '#FF3333'}});
                        }
                    }
                    else
                    {
                        // Start with storage and containers, put them up to 80% hp whenever possible
                        let closestRepairable = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (structure) => (structure.structureType === STRUCTURE_CONTAINER ||
                                                    structure.structureType === STRUCTURE_ROAD) && structure.hits < structure.hitsMax * 0.8
                        });

                        if (closestRepairable)
                        {
                            if(creep.repair(closestRepairable) === ERR_NOT_IN_RANGE)
                            {
                                creep.say('🔧 R C/R 80%');
                                if (!creep.fatigue)
                                    creep.moveTo(closestRepairable, {visualizePathStyle: {stroke: '#FF3333'}});
                            }
                        }
                        else
                        {
                            // IMPORTANT: The 0.01 here must be the same value used in main.js
                            // Prioritize walls with less than 1% HP
                            let closestWallDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                                filter: (structure) => structure.hits < structure.hitsMax * 0.01 && structure.structureType === STRUCTURE_WALL
                            });
                            if (closestWallDamagedStructure)
                            {
                                if(creep.repair(closestWallDamagedStructure) === ERR_NOT_IN_RANGE)
                                {
                                    creep.say('🔧 R W 1%');
                                    if (!creep.fatigue)
                                        creep.moveTo(closestWallDamagedStructure, {visualizePathStyle: {stroke: '#FF3333'}});
                                }
                            }
                            else
                            {
//                                // Then put walls up to 5% HP
//                                let closestWallDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
//                                    filter: (structure) => structure.hits < structure.hitsMax * 0.05 && structure.structureType == STRUCTURE_WALL
//                                });
//                                if (closestWallDamagedStructure)
//                                {
//                                    if(creep.repair(closestWallDamagedStructure) == ERR_NOT_IN_RANGE)
//                                    {
//                                        creep.say('🔧 R W 5%');
//                                        if (!creep.fatigue)
//                                            creep.moveTo(closestWallDamagedStructure, {visualizePathStyle: {stroke: '#FF3333'}});
//                                    }
//                                }
//                                else
//                                {
//                                    // Limit walls to 15% HP
//                                    let closestWallDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
//                                        filter: (structure) => structure.hits < structure.hitsMax * 0.15 && structure.structureType == STRUCTURE_WALL
//                                    });
//                                    if (closestWallDamagedStructure)
//                                    {
//                                        if(creep.repair(closestWallDamagedStructure) == ERR_NOT_IN_RANGE)
//                                        {
//                                            creep.say('🔧 R W 15%');
//                                            if (!creep.fatigue)
//                                                creep.moveTo(closestWallDamagedStructure, {visualizePathStyle: {stroke: '#FF3333'}});
//                                        }
//                                    }
//                                }
                            }
                        }
                    }
                }
            }
        }
        else
        {
            if (creep.memory.targetSource === 'empty' || creep.memory.targetSource === null || creep.memory.targetSource === undefined)
            {
                // 'empty' check is to ease the transition of legacy code - Remove in future.
                // When the creep has just spawned, it won't have a target, so we add one here.
                this.pick_resource_target(creep);
            }

            if (creep.memory.targetSource !== 'empty' && creep.memory.targetSource !== null && creep.memory.targetSource !== undefined)
            {
                let target = Game.getObjectById(creep.memory.targetSource);
                if (!target) // If we somehow have an invalid target, try getting a new one before proceeding.
                {
                    console.log(creep.name + " has an invalid target: " + creep.memory.targetSource);
                    this.pick_resource_target(creep);
                    target = Game.getObjectById(creep.memory.targetSource);
                }

                if (target)
                {
                    if (target.structureType === undefined) // Check if it's a source, or another structure. Undefined means source.
                    {
                        let harvestResult = creep.harvest(target);
                        if(harvestResult === ERR_NOT_IN_RANGE)
                        {
                            if (!creep.fatigue)
                                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff3333'}});
                        }
                    }
                    else
                    {
                        let withdrawResult = creep.withdraw(target, RESOURCE_ENERGY);
                        if(withdrawResult === ERR_NOT_IN_RANGE)
                        {
                            creep.say('🔄 h ' + creep.memory.targetSource);
                            if (!creep.fatigue)
                                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
                        }
                        else if (withdrawResult === OK)
                        {
                            // If the container got empty with less than 50% of the energy that the creep can handle
                            // Search for a new source. Otherwise, get to work.
                            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) < creep.store.getCapacity(RESOURCE_ENERGY) * 0.5)
                            {
                                creep.say('〽️alt h')
                                this.pick_resource_target(creep);
                            }
                            else
                            {
                                creep.say('🚧 early build');
                                creep.memory.building = true;
                            }
                        }
                    }
                }
            }

        }
    },

    /**
     * This function selects a new resource pool, for the creep, to collect resources from.
     *
     * Try to collect energy from the storage first, if available.
     * If it's not possible, try to find the best container to collect from.
     * If that's still not possible, find a source that we can harvest.
     *
     * If the creep needs to find a source to harvest, it will attempt to find the one with
     * as most energy as possible. If they're pretty close in the energy levels, a random
     * source is given. (This last bit can be improved)
     *
     * @param {Creep} creep - Target creep that is looking for a new resource pool.
     */
    pick_resource_target: function(creep)
    {
        // Check if we have a storage and if it has enough energy for us
        if (creep.room.storage !== undefined)
        {
            if (creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getFreeCapacity(RESOURCE_ENERGY))
            {
                creep.memory.targetSource = creep.room.storage.id;
                return;
            }
        }

        // Find the container with the most available energy and store it.
        let targets = creep.room.find(FIND_STRUCTURES,
        {
            filter: (structure) => structure.structureType === STRUCTURE_CONTAINER
        });

        if (targets.length)
        {
            let bestContainer = util.maxRes(targets);
            if (bestContainer.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getFreeCapacity(RESOURCE_ENERGY))
            {
                creep.memory.targetSource = bestContainer.id;
                return;
            }
        }

        // If we're here, might be a good idea to harvest directly from a source.
        let sources = creep.room.find(FIND_SOURCES);
        let sortedSources = _.sortByOrder(sources, s => s.energy, 'desc');

        // A room can only have 2 sources max
        if (sortedSources.length === 1)
        {
            creep.memory.targetSource = sortedSources[0].id;
        }
        else if (sortedSources.length === 2)
        {
            // Check if one of the sources has more than 80% energy than the other. If so, redirect creeps that way.
            // This could get weird with low energy values available.
            if (sortedSources[0].energy > sortedSources[1].energy * 0.8)
            {
                creep.memory.targetSource = sortedSources[0].id;
            }
            else if (sortedSources[1].energy > sortedSources[0].energy * 0.8)
            {
                creep.memory.targetSource = sortedSources[1].id;
            }
            else
            {
                // If we're here, they're pretty close. Use game tick to add randomness. (Risky!)
                creep.memory.targetSource = sortedSources[Game.time % 2].id;
            }
            return;
        }
        else
        {
            // This shouldn't ever happen
            console.log("More than 3 sources in a room detected.");
            creep.memory.targetSource = sortedSources[Game.time % sortedSources.length].id;
        }
    }
};

module.exports = roleBuilder;