//////////////////////////////////////////////////////////////////////////////
// This is a role for the Builder creep.
// Their purpose is to get available resources, in the following priority
// order: Storage > Static Harverter's container > harvest from source.
// And then upgrade the Room Controller.
//////////////////////////////////////////////////////////////////////////////

var roleUpgrader = {

    /**
     * This function runs the Upgrader behavior for the given creep.
     * It is a finite state machine with 2 possible states: Upgrading or not.
     *
     * If the creep has just spawned, look for a resource pool to collect from
     * and will proceed in the not building state.
     *
     * Not-Upgrading state:
     * Do some sanity checks for the resource pool to collect from, and start moving
     * on it's way. If it's a source, harvest from. If it's a container, transfer
     * (collect) from.
     * If at least 50% of it's capacity is collected from the resource pool, it will
     * transition to the Upgrading state. Otherwise, it will look for another source
     * to fill it's container.
     *
     * Upgrader state:
     * The creep will move to the Room Controller and upgrade it until it runs out
     * of energy.
     *
     * The main.js file is responsible to assign the creep to the Upgrader role if there
     * isn't any building work to do.
     *
     * @param {Creep} creep - Creep to execute the role
     */
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
            if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE)
            {
                if (!creep.fatigue)
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
                            creep.say('🔄 w ' + creep.memory.targetSource);
                            if (!creep.fatigue)
                                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
                        }
                        else if (withdrawResult === ERR_NOT_ENOUGH_RESOURCES)
                        {
                            creep.say(" ⤵️swap");
                            this.pick_resource_target(creep);
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
                                creep.say('⚡ early upgrade');
                                creep.memory.upgrading = true;
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
            // Just harvest from the only source in the room.
            creep.memory.targetSource = sortedSources[0].id;
        }
        else if (sortedSources.length === 2)
        {
            // See if there's an available space near the source to be able to harvest. If there's just a
            // single one, assume it's for the Static Harvester creep.
            let allSourcesHarvestable = true;
            let harvestableSources = Array();

            for(let i = 0, l = sortedSources.length; i < l; ++i)
            {

                const lookSource = creep.room.lookForAtArea(LOOK_TERRAIN,
                    sortedSources[i].pos.y - 1,
                    sortedSources[i].pos.x - 1,
                    sortedSources[i].pos.y + 1,
                    sortedSources[i].pos.x + 1,
                    true);

                let freeSlotsSource = _.filter(lookSource, function (obj)
                {
                    return (obj["terrain"] !== "wall") &&
                           (obj["terrain"] !== "swamp");
                });

                if (freeSlotsSource.length > 1)
                {
                    harvestableSources.push(i);
                }
            }

            if (harvestableSources.length === 2)
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
            }
            else if (harvestableSources.length === 1)
            {
                creep.memory.targetSource = sortedSources[harvestableSources[0]].id;
            }
            else
            {
                // Haven't encountered this issue yet.
                // TODO: Decide strategy.
                console.log("BIG PANIC FOR THE UPGRADER");
                creep.say("BIG PANIC FOR THE UPGRADER");
            }
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