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
                    towers[i].attack(closestHostile);
                }
                else
                {
                    // No threat? Repair damaged structures
                    let closestOwnedDamagedStructure = towers[i].pos.findClosestByRange(FIND_MY_STRUCTURES, {
                        filter: (structure) => (structure.structureType !== STRUCTURE_RAMPART && structure.hits < structure.hitsMax) ||
                                               (structure.structureType === STRUCTURE_RAMPART && structure.hits < structure.hitsMax * 0.01)
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