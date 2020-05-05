var roleStaticHarvester = {

    /** @param {Creep} creep **/
    run: function(creep)
    {
//       if (!creep.memory.source)
//       {
//           creep.say('❌Missing:Source!')
//           return;
//       }

        const targetPos = new RoomPosition(creep.room.memory.sources[creep.memory.source].x,
                                           creep.room.memory.sources[creep.memory.source].y,
                                           creep.room.name);
        // Go to our target position
        if (!creep.pos.isEqualTo(targetPos))
        {
            creep.say('➡️(' + targetPos.x + ',' + targetPos.y + ')');

            creep.moveTo(targetPos, {visualizePathStyle: {stroke: '#FDCE6F'}});
            return;
        }

        // Check if there's a container there
        let structures = targetPos.lookFor(LOOK_STRUCTURES);

        if (!structures.length)
        {
            let cs = targetPos.lookFor(LOOK_CONSTRUCTION_SITES);
            if (!cs.length)
            {
                creep.room.createConstructionSite(targetPos, STRUCTURE_CONTAINER);
            }
            else if (cs[0].structureType != 'container')
            {
                creep.say('🛑PANIC🛑');
            }
            else
            {
                // We have a container construction site. Build it in place!

                // Max Storage or Enough energy - Do a build action.
                let maxWorkTickCost = (creep.body.filter(function(x){return x.type == 'work'}).length * BUILD_POWER);
                if (creep.carry.energy >= creep.carryCapacity ||
                    creep.carry.energy >= maxWorkTickCost)
                {
                    creep.say('🚧Container');
                    creep.build(cs[0]);
                }
                else
                {
                    // Harvest so we can build!
                    creep.say('🔄Container');
                    creep.harvest(Game.getObjectById(creep.room.memory.sources[creep.memory.source].id));
                }
            }

            // If we got here, something consumed this creep action. Return!
            return;
        }

        if (structures[0].structureType != 'container')
        {
            //console.log(global.ex(structures))
            creep.say('⚠️PANIC⚠️');
            return;
        }

        // We got a container! Check if it needs repair! (Repair whenever below 80% hp)
        if (structures[0].hits < structures[0].hitsMax * 0.6)
        {
            if (creep.carry.energy >= creep.carryCapacity * 0.9)
            {
                creep.say('🔧+');
                creep.repair(structures[0]);
                return;
            }
        }
        else if (structures[0].hits < structures[0].hitsMax * 0.9)
        {
            if (creep.carry.energy == creep.carryCapacity)
            {
                creep.say('🔧');
                creep.repair(structures[0]);
                creep.drop(RESOURCE_ENERGY);
                return;
            }
        }

        if (structures[0].store.energy >= structures[0].storeCapacity &&
            creep.carry.energy >= creep.carryCapacity)
        {
            if (structures[0].hits < structures[0].hitsMax)
            {
                creep.say('idle🔧');
                creep.repair(structures[0]);
                return;
            }
        }
        else
        {
            // Only harvest if the container has space in it or we still have room to store energy in the creep.
            creep.harvest(Game.getObjectById(creep.room.memory.sources[creep.memory.source].id));
        }
    }
};

module.exports = roleStaticHarvester;