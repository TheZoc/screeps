var logicExtensions = {
    queueExtensions:        Array(),
    currentNumExtensions:   0,

    run: function(targetRoom)
    {
        // Only run this function if enough time has passed since the last update (25 ticks).
        if (Game.time < targetRoom.memory.nextUpdate.extensions)
            return;

        targetRoom.memory.nextUpdate.extensions = Game.time + 25;

        let listExtensions          = targetRoom.find(FIND_MY_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_EXTENSION; }});

        if (listExtensions.length >= CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][targetRoom.controller.level])
            return;

        // This is how it would need to be sorted:
        // listExtensions.sort((a,b)=>a.getRangeTo(spawn)-b.getRangeTo(spawn))

        currentNumExtensions = listExtensions.length;

        // Always start from the spawn and work our way out
        const roomSpawns          = targetRoom.find(FIND_MY_SPAWNS);

        for (i in roomSpawns)
        {
            this.queueExtensions.push(roomSpawns[i].pos);
        }

        this.expand(targetRoom);
    },

    expand(targetRoom)
    {
        while (this.queueExtensions.length > 0)
        {
            if (currentNumExtensions >= CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][targetRoom.controller.level])
                return;

            const currentPos = this.queueExtensions.shift();
            const currentPosDiagonals = _.map(DIAGONALS, (d) => currentPos.addDirection(d));

            for (i in currentPosDiagonals)
            {
                const structures = currentPosDiagonals[i].lookFor(LOOK_STRUCTURES);
                if (structures.length)
                {
                    if (structures[0].structureType == STRUCTURE_EXTENSION)
                        this.queueExtensions.push(currentPosDiagonals[i]);
                    continue; // Skip if this is some other structure
                }

                const cs = currentPos.lookFor(LOOK_CONSTRUCTION_SITES);
                if (cs.length)
                {
                    if (cs[0].structureType == STRUCTURE_EXTENSION)
                        this.queueExtensions.push(currentPosDiagonals[i]);
                    continue; // Skip if this is some other structure
                }

                // If we're still here, spawn the structure
                targetRoom.createConstructionSite(currentPosDiagonals[i], STRUCTURE_EXTENSION);
                this.queueExtensions.push(currentPosDiagonals[i]);
                ++currentNumExtensions;
            }
        }

    }

};

module.exports = logicExtensions;