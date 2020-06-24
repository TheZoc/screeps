var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep)
    {
        if(creep.memory.upgrading && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0)
        {
            creep.say('🔄 harvest');
            creep.memory.upgrading = false;
            this.pick_target(creep);
        }
        if(!creep.memory.upgrading && creep.store.getUsedCapacity(RESOURCE_ENERGY) === creep.store.getCapacity(RESOURCE_ENERGY))
        {
            creep.say('⚡ upgrade');
            creep.memory.upgrading = true;
        }

        if(creep.memory.upgrading)
        {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE)
            {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#3333ff'}});
            }
        }
        else
        {
            if (creep.memory.targetSource === 'empty' || creep.memory.targetSource === null || creep.memory.targetSource === undefined)
            {
                let sources = creep.room.find(FIND_SOURCES);
                let harvestResult = creep.harvest(sources[0]);
                if(harvestResult === ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#FF3333'}});
                }
            }
            else
            {
                let target = Game.getObjectById(creep.memory.targetSource);
                if (!target)
                {
                    this.pick_resource_target(creep);
                }

                if (target)
                {
                    let withdrawResult = creep.withdraw(target, RESOURCE_ENERGY);
                    if(withdrawResult === ERR_NOT_IN_RANGE)
                    {
                        creep.say('🔄 h ' + creep.memory.targetSource);
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                    else if (withdrawResult === OK)
                    {
                        // If the container got empty with less than 50% of the energy that the creep can handle
                        // Search for a new source. Otherwise, get to work.
                        if (creep.store.getUsedCapacity(RESOURCE_ENERGY) < creep.store.getUsedCapacity(RESOURCE_ENERGY) * 0.5)
                        {
                            creep.say('〽️alt h')
                            this.pick_resource_target(creep);
                        }
                        else
                        {
                            creep.say('⚡ early upgrade');
                            creep.memory.upgrading = true;
                        }
                    }
                }
            }

        }
    },

    pick_target: function(creep)
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

        // If we're here, might be a good idea to harvest directly from source.
        creep.memory.targetSource = 'empty';
    }
};

module.exports = roleUpgrader;