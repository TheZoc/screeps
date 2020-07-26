// Game.spawns['Spawn1'].spawnCreep([MOVE], 'flagscout', {memory: {role: 'flagscout'}});

const roleFlagScout = {
    run: function(creep)
    {
        const targetFlag = Game.flags.scout;
        if (targetFlag !== undefined)
        {
            if (creep.pos !== Game.flags.pos && !creep.fatigue)
            {
                creep.moveTo(targetFlag);
            }
        }
    }
}

module.exports = roleFlagScout;