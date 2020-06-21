var logicTower =
{
    run: function(room)
    {
        let towers = (room.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_TOWER }}));
        if(towers.length)
        {
            for(let i = 0, l = towers.length; i < l; ++i)
            {
                var closestHostile = towers[i].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if(closestHostile)
                {
                    towers[i].attack(closestHostile);
                }
                else
                {
                    var closestDamagedStructure = towers[i].pos.findClosestByRange(FIND_MY_STRUCTURES, {
                        filter: (structure) => structure.hits < structure.hitsMax
                    });

                    if(closestDamagedStructure)
                    {
                        towers[i].repair(closestDamagedStructure);
                    }
                }
            }
        }
    },

};

module.exports = logicTower;