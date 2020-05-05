var roleUpgraderNewRoom = {

    /** @param {Creep} creep **/
    run: function(creep)
    {

        if(creep.memory.upgrading && creep.carry.energy == 0)
        {
            creep.say('🔄 harvest');
            creep.memory.upgrading = false;
            this.pick_target(creep);
        }
        if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity)
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
//            if (creep.memory.targetSource == 'empty')
//            {
                let sources = creep.room.find(FIND_SOURCES);
                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(sources[0], {visualizePathStyle: {stroke: '#FF3333'}});
                }
/*
            }
            else
            {
                let target = Game.getObjectById(creep.memory.targetSource);

                if(target && creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
                else
                {
                    this.pick_target(creep);
                }
            }
*/
        }
    },

    pick_target: function(creep)
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

module.exports = roleUpgraderNewRoom;