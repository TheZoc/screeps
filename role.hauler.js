var roleHauler = {

    /**
     * @param {Creep} creep 
     */
    run: function(creep)
    {
        if(creep.memory.withdraw == true || creep.memory.withdraw == undefined)
        {
            if (creep.memory.fromStructure == undefined)
            {
                const foundStructure = this.pick_resource_target(creep);
                if (!foundStructure)
                {
                    // Panic! Log it.
                    console.log("Hauler Panic!")
                    return;
                }
            }

            const withdrawResult = creep.withdraw(Game.getObjectById(creep.memory.fromStructure), RESOURCE_ENERGY);
            if(withdrawResult == ERR_NOT_IN_RANGE)
            {
                creep.moveTo(Game.getObjectById(creep.memory.fromStructure), {visualizePathStyle: {stroke: '#FFEA88'}});
            }
            else if (withdrawResult == ERR_NOT_ENOUGH_RESOURCES)
            {
                this.pick_resource_target(creep, true); // Skip storage
            }
            else if (withdrawResult == OK)
            {
                // HACK HACK HACK - Lets speed things up if there's not enough energy to be withdrawed
                if (creep.carry.energy > 0 && creep.carry.energy < creep.carryCapacity)
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
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                            structure.structureType == STRUCTURE_SPAWN ||
                            structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                }
            });

            if(targets.length > 0)
            {
                // TODO: Should we remove towers from this selection?
                const target = creep.pos.findClosestByPath(targets);
                const transferResult = creep.transfer(target, RESOURCE_ENERGY);
                if(transferResult == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
                else if (transferResult == OK)
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
                        return structure.structureType == STRUCTURE_STORAGE && structure.store.getFreeCapacity() > 0;
                    }
                });

                if (storages.length > 0)
                {
                    const target = creep.pos.findClosestByPath(storages);
                    const transferResult = creep.transfer(target, RESOURCE_ENERGY);
                    if(transferResult == ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                    else if (transferResult == OK)
                    {
                        creep.memory.withdraw = true;
                    }
                }
                else
                {
                    // No loitering! - Get out of the way so others can pass.
                    const target = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }

            }
        }
    }, 

    pick_resource_target: function(creep, forceContainer = false)
    {
        if (!forceContainer)
        {
            // This initial block check if there's less than 50% of resources available in spawn + extensions.
            // If so, try to fetch from the room storage, if available.
            let foundResourceSource = false;
            let maxResources = 0;
            let currentResource = 0;
            const resourceStructures = creep.room.find(FIND_MY_STRUCTURES,
            {
                filter: (structure) => (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN)
            });

            for (const s in resourceStructures)
            {
                currentResource += resourceStructures[s].store.getUsedCapacity(RESOURCE_ENERGY);
                maxResources    += resourceStructures[s].store.getCapacity(RESOURCE_ENERGY);
            }

            // Less than 60% of the total (spawn + extensions) available? Check if there's a storage and get it from there. ("High availability" mode)
            if (currentResource < maxResources * 0.6 && creep.room.storage != undefined)
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

        if (structures[0].structureType != 'container')
        {
            creep.say('⚠️PANIC⚠️');
            return false;
        }
        creep.memory.fromStructure = structures[0].id;
        return true;
    }

};

module.exports = roleHauler;