//////////////////////////////////////////////////////////////////////////////
// This is a role for the Hauler creep.
// Their purpose is to fetch the resources harvested by the Static Harvester
// from its container and transfer it to the closest tower, spawn or
// extension. When they're full, start stocking the resources in the room's
// storage.
//////////////////////////////////////////////////////////////////////////////

var roleHauler = {

    /**
     * This function runs the Hauler behavior for the given creep.
     * It is a finite state machine with 2 possible states: Withdrawing or not.
     *
     * If the creep has just spawned, it will look for a resource pool and then
     * it will continue in the withdraw state.
     *
     * Withdraw state:
     * Move to the target resource pool and collect resources.
     * If a transfer (collect) action had resources, but not enough to fill the
     * creep store capacity, the creep does an early deliver, instead of waiting
     * for the resources to be available.
     *
     * Deliver (non-withdraw) state:
     * Go to the nearest Tower, Spawn or Extension that needs resources, and
     * transfer them there. Do this until there's no more resources being carried.
     * (This logic definitely can be improved with priorities!)
     * If every Spawn, Container and Extension are filled, transfer to our storage.
     * If storage is full, move to the nearest Spawn and idle there.
     *
     * @param {Creep} creep - Creep to execute the role
     */
    run: function(creep)
    {
        if(creep.memory.withdraw === true || creep.memory.withdraw === undefined)
        {
            if (creep.memory.fromStructure === undefined)
            {
                const foundStructure = this.pick_resource_target(creep);
                if (!foundStructure)
                {
                    // Panic! Log it.
                    console.log("Hauler Panic!")
                    return;
                }
            }

            const withdrawSource = Game.getObjectById(creep.memory.fromStructure);
            const withdrawResult = creep.withdraw(withdrawSource, RESOURCE_ENERGY);
            if(withdrawResult === ERR_NOT_IN_RANGE)
            {
                if (!creep.fatigue)
                    creep.moveTo(Game.getObjectById(creep.memory.fromStructure), {visualizePathStyle: {stroke: '#FFEA88'}});
            }
            else if (withdrawResult === ERR_NOT_ENOUGH_RESOURCES && withdrawSource.id === creep.room.storage.id)
            {
                // If we were fetching from storage and it's now empty, get resources from somewhere else.
                this.pick_resource_target(creep, true);
            }
            else if (withdrawResult === OK)
            {
                // HACK HACK HACK - Lets speed things up if there's not enough energy to be withdrawn
                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
                    creep.store.getUsedCapacity(RESOURCE_ENERGY) < creep.store.getCapacity(RESOURCE_ENERGY))
                {
                    creep.say('🔽early d');
                }
                else
                {
                    creep.say('🔽deposit');
                }
                creep.memory.withdraw = false;
                delete creep.memory["fromStructure"];
            }
        }
        else
        {
            const targets = creep.room.find(FIND_MY_STRUCTURES,
            {
                filter: (structure) =>
                {
                    return (structure.structureType === STRUCTURE_EXTENSION ||
                            structure.structureType === STRUCTURE_SPAWN ||
                            structure.structureType === STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                }
            });

            if(targets.length > 0)
            {
                // TODO: Should we remove towers from this selection?
                const target = creep.pos.findClosestByPath(targets);
                const transferResult = creep.transfer(target, RESOURCE_ENERGY);
                if(transferResult === ERR_NOT_IN_RANGE)
                {
                    if (!creep.fatigue)
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }

                if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0)
                {
                    creep.memory.withdraw = true;
                }
            }
            else
            {
                // If we're here, all the spawns, extensions and structures are at their capacity. Start moving things to our storage.
                const storages = creep.room.find(FIND_MY_STRUCTURES,
                {
                    filter: (structure) =>
                    {
                        return structure.structureType === STRUCTURE_STORAGE && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });

                if (storages.length > 0)
                {
                    const target = creep.pos.findClosestByPath(storages);
                    const transferResult = creep.transfer(target, RESOURCE_ENERGY);
                    if(transferResult === ERR_NOT_IN_RANGE)
                    {
                        if (!creep.fatigue)
                            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }

                    if (creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0)
                    {
                        creep.memory.withdraw = true;
                    }
                }
                else
                {
                    // No loitering! - Get out of the way so others can pass.
                    const target = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
                    if (!creep.fatigue)
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    },

    /**
     * This function selects a new resource pool, for the creep, to collect resources from.
     *
     * If `skipStorage` is false (default), it will check if the room and spawns have less
     * than 60% resources filled and, if that's the case, will prioritize collecting resources
     * from the Storage, to speed things up.
     *
     * Otherwise, this creep will move to their assigned container and collect from there.
     *
     * @param {Creep} creep         - Target creep that is looking for a new resource pool.
     * @param {boolean} skipStorage - Ignore the Storage as a valid resource pool.
     *
     * @return {boolean}
     */
    pick_resource_target: function(creep, skipStorage = false)
    {
        if (!skipStorage)
        {
            // This initial block check if there's less than 50% of resources available in spawn + extensions.
            // If so, try to fetch from the room storage, if available.
            let maxResources = 0;
            let currentResource = 0;
            const resourceStructures = creep.room.find(FIND_MY_STRUCTURES,
            {
                filter: (structure) => (structure.structureType === STRUCTURE_EXTENSION ||
                                        structure.structureType === STRUCTURE_SPAWN)
            });

            for (const s in resourceStructures)
            {
                currentResource += resourceStructures[s].store.getUsedCapacity(RESOURCE_ENERGY);
                maxResources    += resourceStructures[s].store.getCapacity(RESOURCE_ENERGY);
            }

            // Less than 60% of the total (spawn + extensions) available? Check if there's a storage and get it from there. ("High availability" mode)
            if (currentResource < maxResources * 0.6 && creep.room.storage !== undefined)
            {
                // Determine current state
                if (creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.carryCapacity)
                {
                    creep.say('🔼withdraw');
                    creep.memory.withdraw = true;
                    creep.memory.fromStructure = creep.room.storage.id;
                    return true;
                }
            }
        }

        // Still here? Find the source container this creeps is assigned to.
        const targetPos = new RoomPosition(creep.room.memory.sources[creep.memory.source].x,
                                           creep.room.memory.sources[creep.memory.source].y,
                                           creep.room.name);

        const structures = targetPos.lookFor(LOOK_STRUCTURES);

        if (!structures.length)
        {
            creep.say('🛑PANIC🛑');
            return false;
        }

        if (structures[0].structureType !== 'container')
        {
            creep.say('⚠️PANIC⚠️');
            return false;
        }
        creep.memory.fromStructure = structures[0].id;
        return true;
    }

};

module.exports = roleHauler;