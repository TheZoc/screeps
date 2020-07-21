//////////////////////////////////////////////////////////////////////////////
// This is the automatic extension build logic. It will follow a X pattern
// around the spawn. It is not planned to be a strict clockwise order, but
// due to the way the structures are returned from the server, it's built in
// clockwise order. the shape is similar to the mockup below:
//
//     o o o o o
//      o o o o
//     o o S o o
//      o o o o
//     o o o o o
//////////////////////////////////////////////////////////////////////////////


var logicExtensions = {

    // Internal control variables
    queueExtensions:      Array(),
    currentNumExtensions: 0,

    /**
     * Given a target room, checks if it's possible to create new extensions, and create them around
     * the Spawns present in the target room.
     *
     * @param {Room} targetRoom
     */
    run: function(targetRoom)
    {
        // Only run this function if enough time has passed since the last update (25 ticks).
        if (Game.time < targetRoom.memory.nextUpdate.extensions)
            return;

        targetRoom.memory.nextUpdate.extensions = Game.time + 25;

        const listExtensions = targetRoom.find(FIND_MY_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_EXTENSION
        });

        if (listExtensions.length >= CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][targetRoom.controller.level])
            return;

        // This is how it would need to be sorted:
        // listExtensions.sort((a,b)=>a.getRangeTo(spawn)-b.getRangeTo(spawn))

        this.currentNumExtensions = listExtensions.length;

        // Always start from the spawn and work our way out

        const roomSpawns = targetRoom.find(FIND_MY_SPAWNS);
        for (let i = 0; i < roomSpawns.length; ++i)
        {
            this.queueExtensions.push(roomSpawns[i].pos);
        }

        this.expand(targetRoom);
    },

    /**
     * Greedy algorithm that expands in X shapes.
     * The positions of the target spawns must already be inserted in queueExtensions.
     *
     * @param {Room} targetRoom - Target room to do the expansion
     */
    expand(targetRoom)
    {
        while (this.queueExtensions.length > 0)
        {
            if (this.currentNumExtensions >= CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][targetRoom.controller.level])
                return;

            const currentPos = this.queueExtensions.shift();
            const currentPosDiagonals = _.map(DIAGONALS, (d) => currentPos.addDirection(d));

            // Iterate over the candidates array
            for (let i = 0; i < currentPosDiagonals.length; ++i)
            {
                const structures = currentPosDiagonals[i].lookFor(LOOK_STRUCTURES);
                if (structures.length)
                {
                    if (structures[0].structureType === STRUCTURE_EXTENSION)
                        this.queueExtensions.push(currentPosDiagonals[i]);
                    continue; // Skip if this is some other structure
                }

                const cs = currentPosDiagonals[i].lookFor(LOOK_CONSTRUCTION_SITES);
                if (cs.length)
                {
                    if (cs[0].structureType === STRUCTURE_EXTENSION)
                        this.queueExtensions.push(currentPosDiagonals[i]);
                    continue; // Skip if this is some other structure
                }

                // If we're still here, spawn the structure
                const createExtensionResult = targetRoom.createConstructionSite(currentPosDiagonals[i], STRUCTURE_EXTENSION);
                this.queueExtensions.push(currentPosDiagonals[i]);
                ++this.currentNumExtensions;

                // Create roads for the extensions
                if (createExtensionResult === OK)
                {
                    const currentPosHorizVert = _.map(HORIZONTALS, (d) => currentPosDiagonals[i].addDirection(d));
                    for (let i = 0; i < currentPosHorizVert.length; ++i)
                        targetRoom.createConstructionSite(currentPosHorizVert[i], STRUCTURE_ROAD);
                }
            }
        }

    }

};

module.exports = logicExtensions;