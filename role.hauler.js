var roleHauler = {

    /** @param {Creep} creep **/
    run: function(creep)
    {
        const targetPos = new RoomPosition(creep.room.memory.sources[creep.memory.source].x,
                                           creep.room.memory.sources[creep.memory.source].y,
                                           creep.room.name);

        let structures = targetPos.lookFor(LOOK_STRUCTURES);

        if (!structures.length)
        {
            creep.say('🛑PANIC🛑');
            return;
        }

        if (structures[0].structureType != 'container')
        {
            creep.say('⚠️PANIC⚠️');
            return;
        }

        if(!creep.memory.withdraw && creep.carry.energy == 0)
        {
            creep.say('🔼withdraw');
            creep.memory.withdraw = true;
        }
        if(creep.memory.withdraw && creep.carry.energy == creep.carryCapacity)
        {
            creep.say('🔽deposit');
            creep.memory.withdraw = false;
        }

        if(creep.memory.withdraw)
        {
            const withdrawResult = creep.withdraw(structures[0], RESOURCE_ENERGY);
            if(withdrawResult == ERR_NOT_IN_RANGE)
            {
                creep.moveTo(structures[0], {visualizePathStyle: {stroke: '#FFEA88'}});
            }
            // HACK HACK HACK - Lets speed things up if there's not enough energy to be withdrawed
            else if (withdrawResult == OK && creep.carry.energy > 0 && creep.carry.energy < creep.carryCapacity)
            {
                creep.memory.withdraw = false;
                creep.say('🔽early d');                
            }
        }
        else
        {
            let targets = creep.room.find(FIND_MY_STRUCTURES,
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
                let target = creep.pos.findClosestByPath(targets);

//                if (creep.room.name != 'W2N5')
//                    console.log(creep.room.name + ' - ' + target);

                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else
            {
                // If we're here, all the spawns, extensions and structures are at their capacity. Start moving things to our storage.
                let storages = creep.room.find(FIND_MY_STRUCTURES,
                {
                    filter: (structure) =>
                    {
                        return structure.structureType == STRUCTURE_STORAGE && structure.energy < structure.energyCapacity;
                    }
                });

                if (storages.length > 0)
                {
                    let target = creep.pos.findClosestByPath(storages);
                    if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
                else
                {
                    // No loitering! - Get out of the way so others can pass.
                    let target = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }

            }
        }
    }

};

module.exports = roleHauler;