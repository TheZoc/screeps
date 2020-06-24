var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep)
    {
        if(creep.memory.upgrading && creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0)
        {
            creep.say('🔄 harvest');
            creep.memory.upgrading = false;
            this.pick_resource_target(creep);
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
                    if (target.structureType === undefined) // Check if it's a source, or another structure
                    {
                        let harvestResult = creep.harvest(target);
                        if(harvestResult === ERR_NOT_IN_RANGE)
                        {
                            creep.moveTo(target, {visualizePathStyle: {stroke: '#ff3333'}});
                        }
                    }
                    else
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

        }
    },

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
        if (sortedSources.length == 1)
        {
            creep.memory.targetSource = sortedSources[0].id;
        }
        else if (sortedSources.length == 2)
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

module.exports = roleUpgrader;