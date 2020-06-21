var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep)
    {

        if(creep.memory.building && creep.carry.energy == 0)
        {
            creep.say('🔄 harvest');
            creep.memory.building = false;
            this.pick_resource_target(creep);
        }
        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity)
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
                if(creep.build(targetExtension) == ERR_NOT_IN_RANGE)
                {
                    creep.say('🚧🏠');
                    creep.moveTo(targetExtension, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                return;
            }

            // If there's no exntesions, go to the closest CS
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
                        // Prioritize walls with less than 5% HP
                        let closestWallDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (structure) => structure.hits < structure.hitsMax * 0.5 && structure.structureType == STRUCTURE_WALL
                        });
                        if (closestWallDamagedStructure)
                        {
                            if(creep.repair(closestWallDamagedStructure) == ERR_NOT_IN_RANGE)
                            {
                                creep.say('🔧 rep W');
                                creep.moveTo(closestWallDamagedStructure, {visualizePathStyle: {stroke: '#FF3333'}});
                            }
                        }
                        else
                        {
                            // Remaining walls
                            let closestWallDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                                filter: (structure) => structure.hits < structure.hitsMax && structure.structureType == STRUCTURE_WALL
                            });
                            if (closestWallDamagedStructure)
                            {
                                if(creep.repair(closestWallDamagedStructure) == ERR_NOT_IN_RANGE)
                                {
                                    creep.say('🔧 rep W');
                                    creep.moveTo(closestWallDamagedStructure, {visualizePathStyle: {stroke: '#FF3333'}});
                                }
                            }

                        }
                    }
                }
            }
        }
        else
        {
            if (creep.memory.targetSource == 'empty' || creep.memory.targetSource === null)
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