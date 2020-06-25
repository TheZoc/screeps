//////////////////////////////////////////////////////////////////////////////
// This is a role for the Static Harvester creep.
// Their purpose is to build a container into the designed space (if there
// isn't already one) and harvest without moving, so other creeps can collect
// resources in an effective way.
//////////////////////////////////////////////////////////////////////////////
var roleStaticHarvester = {

    /**
     * When spawning, this creep is assigned a source to harvest from.
     * It will move there and, if there's no container in the target position,
     * attempt to build one.
     *
     * Once in place, it will harvest until the end of it's life. It will
     * attempt to repair the container if it's below certain thresholds.
     *
     * @param {Creep} creep - Creep to execute the role
     */
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

        // Creep state
        const creepEnergy    = creep.store.getUsedCapacity(RESOURCE_ENERGY);
        const creepMaxEnergy = creep.store.getCapacity(RESOURCE_ENERGY);

        // Go to our target position
        if (!creep.pos.isEqualTo(targetPos))
        {
            creep.say('➡️(' + targetPos.x + ',' + targetPos.y + ')');

            if (!creep.fatigue)
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
            else if (cs[0].structureType !== 'container')
            {
                creep.say('🛑PANIC🛑');
            }
            else
            {
                // We have a container construction site. Build it in place!

                // Max Storage or Enough energy - Do a build action.
                let maxWorkTickCost = (creep.body.filter(function(x){return x.type === 'work'}).length * BUILD_POWER);
                if (creepEnergy >= creepMaxEnergy ||
                    creepEnergy >= maxWorkTickCost)
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

        if (structures[0].structureType !== 'container')
        {
            //console.log(global.ex(structures))
            creep.say('⚠️PANIC⚠️');
            return;
        }

        // Container state
        const containerEnergy    = structures[0].store.getUsedCapacity(RESOURCE_ENERGY);
        const containerMaxEnergy = structures[0].store.getCapacity(RESOURCE_ENERGY);
        const containerHP        = structures[0].hits;
        const containerMaxHP     = structures[0].hitsMax;

        // We got a container! Check if it needs repair! (Repair whenever below 60% hp)
        if (containerHP < containerMaxHP * 0.6)
        {
            if (creepEnergy >= creepMaxEnergy * 0.9)
            {
                creep.say('🔧⚠️ 60%');
                creep.repair(structures[0]);
                return;
            }
        }
        // If below 90% HP, do a repair tick and check if there's enough space in
        // the storage, and then drop the remaining resources.
        else if (containerHP < containerMaxHP * 0.9)
        {
            if (creepEnergy === creepMaxEnergy)
            {
                creep.say('🔧 90%+');
                creep.repair(structures[0]);

                if (containerEnergy + creepEnergy <= containerMaxEnergy)
                    creep.drop(RESOURCE_ENERGY);

                return;
            }
        }

        if (containerEnergy >= containerMaxEnergy &&
            creepEnergy === creepMaxEnergy)
        {
            if (containerHP < containerMaxHP)
            {
                creep.say('idle🔧');
                creep.repair(structures[0]);
                return;
            }
        }
        else
        {
            // Only harvest if the container has space in it or we still have room to store energy in the creep.
            const harvestResult = creep.harvest(Game.getObjectById(creep.room.memory.sources[creep.memory.source].id));
            if (harvestResult === ERR_NOT_ENOUGH_RESOURCES)
            {
                // Source is empty. Drop what we have (into the container), so other creeps can get it while we
                // wait for a refresh.
                if (creepEnergy > 0)
                    creep.drop(RESOURCE_ENERGY);
            }
        }
    }
};

module.exports = roleStaticHarvester;