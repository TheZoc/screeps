var roleColonizer = {
    run: function(creep)
    {
        const targetRoom = '';

        // TODO: Use Game.map.findRoute() to get this right.
        if (creep.pos.roomName != targetRoom)
        {
            creep.moveTo(Game.flags.spawnflag);
            return;
        }

        // Only makes sense if there is a controller in the target room!
        if(creep.room.controller)
        {
            if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE)
            {
                creep.moveTo(creep.room.controller);
            }
        }
        else
        {
            creep.say('🛑PANIC🛑');
        }

    }
}

module.exports = roleHauler;