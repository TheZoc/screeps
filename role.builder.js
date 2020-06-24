var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep)
    {
        if(creep.memory.building && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0)
        {
            creep.say('🔄 harvest');
            creep.memory.building = false;
            this.pick_resource_target(creep);
        }
        if (!creep.memory.building)
        {
            if (creep.store.getUsedCapacity(RESOURCE_ENERGY) == creep.store.getCapacity(RESOURCE_ENERGY))
            {
                creep.say('🚧 build');
                creep.memory.building = true;
            }
            else
            {
                // Not enough energy in the target? If current target is the room storage, pick a new target.
                let targetSource = Game.getObjectById(creep.memory.targetSource);
                if (targetSource == creep.room.storage)
                {
                    this.pick_resource_target(creep);
                }
            }
        }

        if(creep.memory.building)
        {
            // Prioritize extensions
            let csExtensions = creep.room.find(FIND_MY_CONSTRUCTION_SITES, {filter: { structureType: STRUCTURE_EXTENSION }});
            if (csExtensions.length)
            {
                let targetExtension = creep.pos.findClosestByPath(csExtensions);
                if(creep.build(targetExtension) == ERR_NOT_IN_RANGE)
                {
                    creep.say('🚧🏠');
                    creep.moveTo(targetExtension, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                return;
            }

            // If there's no extensions, go to the closest CS
            let targetCS = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
            if(targetCS)
            {
                if(creep.build(targetCS) == ERR_NOT_IN_RANGE)
                {
                    creep.say('🚧');
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
                        filter: (structure) => structure.hits < structure.hitsMax
                    });
                    if (closestMyDamagedStructure)
                    {
                        if(creep.repair(closestMyDamagedStructure) == ERR_NOT_IN_RANGE)
                        {
                            creep.say('🔧 rep M');
                            creep.moveTo(closestMyDamagedStructure, {visualizePathStyle: {stroke: '#FF3333'}});
                        }
                    }
                    else
                    {
                        // Start with storage and containers, put them up to 80% hp whenever possible
                        let closestRepairable = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER ||
                                                    structure.structureType == STRUCTURE_ROAD) && structure.hits < structure.hitsMax * 0.8
                        });

                        if (closestRepairable)
                        {
                            if(creep.repair(closestRepairable) == ERR_NOT_IN_RANGE)
                            {
                                creep.say('🔧 R C/R 80%');
                                creep.moveTo(closestRepairable, {visualizePathStyle: {stroke: '#FF3333'}});
                            }
                        }
                        else
                        {
                            // IMPORTANT: The 0.01 here must be the same value used in main.js
                            // Prioritize walls with less than 1% HP
                            let closestWallDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                                filter: (structure) => structure.hits < structure.hitsMax * 0.01 && structure.structureType == STRUCTURE_WALL
                            });
                            if (closestWallDamagedStructure)
                            {
                                if(creep.repair(closestWallDamagedStructure) == ERR_NOT_IN_RANGE)
                                {
                                    creep.say('🔧 R W 1%');
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
//                                        creep.moveTo(closestWallDamagedStructure, {visualizePathStyle: {stroke: '#FF3333'}});
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
//                                            creep.moveTo(closestWallDamagedStructure, {visualizePathStyle: {stroke: '#FF3333'}});
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
            if (creep.memory.targetSource == 'empty' || creep.memory.targetSource === null || creep.memory.targetSource === undefined)
            {
                let source = creep.pos.findClosestByPath(FIND_SOURCES);
                if(creep.harvest(source) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#FF3333'}});
                }
            }
            else
            {
                let target = Game.getObjectById(creep.memory.targetSource);

                if(target && creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                {
                    creep.say('🔄 h ' + creep.memory.targetSource);
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                else
                {
                    this.pick_resource_target(creep);
                }
            }

        }
    },

    pick_resource_target: function(creep)
    {
        // Check if we have a storage and if it has enough energy for us
        if (creep.room.storage != undefined)
        {
            if (creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.carryCapacity)
            {
                creep.memory.targetSource = creep.room.storage.id;
                return;
            }
        }

        // Find the container with the most available energy and store it.
        let targets = creep.room.find(FIND_STRUCTURES,
        {
            filter: (structure) =>
            {
                return structure.structureType == STRUCTURE_CONTAINER;
            }
        });

        if (targets.length)
        {
            let bestContainer = util.maxRes(targets);

            if (bestContainer.store.energy > creep.carryCapacity)
            {
                creep.memory.targetSource = bestContainer.id;
                return;
            }
        }

        // If we're here, might be a good idea to harvest directly from source.
        creep.memory.targetSource = 'empty';
    }
};

module.exports = roleBuilder;