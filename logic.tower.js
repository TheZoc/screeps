//////////////////////////////////////////////////////////////////////////////
// Tower logic
//////////////////////////////////////////////////////////////////////////////

var logicTower =
{
    /**
     * Runs the logic for the towers in a given room.
     *
     * @param {Room} room - Target room to process all the towers
     */
    run: function(room)
    {
        let towers = (room.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_TOWER }}));
        if(towers.length)
        {
            for(let i = 0, l = towers.length; i < l; ++i)
            {
                // Top priority: Attack hostile creeps
                let closestHostile = towers[i].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if(closestHostile)
                {
                    const attackResult = towers[i].attack(closestHostile);

                    if (attackResult === ERR_NOT_ENOUGH_ENERGY)
                    {
                        // Quick hack to activate safe mode if available and not active.
                        if (room.controller.safeModeAvailable && room.controller.safeMode === undefined)
                            room.controller.activateSafeMode();
                    }

                }
                else
                {
                    // Only repair if the tower has more than 80% energy!
                    if (towers[i].store.getUsedCapacity(RESOURCE_ENERGY) < towers[i].store.getCapacity(RESOURCE_ENERGY) * 0.8)
                        return;

                    // No threat? Repair damaged structures
                    let closestOwnedDamagedStructure = towers[i].pos.findClosestByRange(FIND_MY_STRUCTURES, {
                        filter: (structure) => (structure.structureType !== STRUCTURE_RAMPART && structure.hits < structure.hitsMax) ||
                                               (structure.structureType === STRUCTURE_RAMPART && structure.hits < structure.hitsMax * 0.01) // don't heal ramparts over 1% hp
                    });

                    if(closestOwnedDamagedStructure)
                    {
                        towers[i].repair(closestOwnedDamagedStructure);
                    }
                    else
                    {
                        // We also want to repair roads and containers in our maps
                        let closestDamagedStructure = towers[i].pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (structure) => (structure.structureType === STRUCTURE_CONTAINER ||
                                                    structure.structureType === STRUCTURE_ROAD) && structure.hits < structure.hitsMax
                        });

                        if(closestDamagedStructure)
                        {
                            towers[i].repair(closestDamagedStructure);
                        }
                    }
                }
            }
        }
    },

};

module.exports = logicTower;