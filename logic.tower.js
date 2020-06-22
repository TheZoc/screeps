var logicTower =
{
    run: function(room)
    {
        let towers = (room.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_TOWER }}));
        if(towers.length)
        {
            for(let i = 0, l = towers.length; i < l; ++i)
            {
                let closestHostile = towers[i].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if(closestHostile)
                {
                    towers[i].attack(closestHostile);
                }
                else
                {
                    let closestDamagedStructure = towers[i].pos.findClosestByRange(FIND_MY_STRUCTURES, {
                        filter: (structure) => structure.hits < structure.hitsMax
                    });

                    if(closestDamagedStructure)
                    {
                        towers[i].repair(closestDamagedStructure);
                    }
                    else
                    {
                        let closestContainer = towers[i].pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER ||
                                                    structure.structureType == STRUCTURE_ROAD) && structure.hits < structure.hitsMax
                        });

                        if(closestContainer)
                        {
                            towers[i].repair(closestContainer);
                        }
                    }
                }
            }
        }
    },

};

module.exports = logicTower;