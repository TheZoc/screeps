var utilRoadPlanner =
{
    pathfinderResults: 0,
    drawColor: '#f00',

    /**
     * Draw the path stored in `pathfinderResults`
     */
    draw_planned_road: function()
    {
        if (!pathfinderResults)
            return;

        for(var i = 0, l = pathfinderResults.path.length - 1; i < l; ++i)
        {
            if (Game.rooms[pathfinderResults.path[i].roomName]   != undefined &&
                Game.rooms[pathfinderResults.path[i+1].roomName] != undefined)
            {
                if (pathfinderResults.path[i].roomName != pathfinderResults.path[i+1].roomName)
                    continue;

                Game.rooms[pathfinderResults.path[i].roomName].visual.line(pathfinderResults.path[i],
                                                                           pathfinderResults.path[i+1],
                                                                           {width: 0.15, color: drawColor, opacity: 0.8, lineStyle: 'undefined'});
            }
        }
/*
        for(var i = 0, l = pathfinderResults.path.length; i < l; ++i)
        {
            if (Game.rooms[pathfinderResults.path[i].roomName] != undefined)
            {
                Game.rooms[pathfinderResults.path[i].roomName].visual.rect(pathfinderResults.path[i].x - 0.5,
                                                                           pathfinderResults.path[i].y - 0.5,
                                                                           1,
                                                                           1,
                                                                           {fill: drawColor, stroke: 'transparent', strokeWidth: '0.05', opacity: '0.4'});
            }
        }
//*/

    },

    /**
     * Find the optimal path between origin and destination, ignoring creeps.
     * This will store a path on `pathfinderResults` starting on a neighbor cell
     * from origin and ending in a neighbor cell in destination.
     *
     * @param {origin} RoomPosition       - The initial coordinate for the search
     * @param {destination} RoomPosition  - The final coordinate for the search
     */
    plan: function(origin, destination)
    {
        drawColor = '#f00';
        pathfinderResults = PathFinder.search(
            origin,                         // TODO: Get from memory
            { pos: destination, range:1 },  // Game.spawns['Spawn1'].pos
            {
                // We need to set the defaults costs higher so that we
                // can set the road cost lower in `roomCallback`
                plainCost: 2,
                swampCost: 10,

                roomCallback: function(roomName)
                {

                    let room = Game.rooms[roomName];
                    // In this example `room` will always exist, but since
                    // PathFinder supports searches which span multiple rooms
                    // you should be careful!
                    if (!room) return;
                    let costs = new PathFinder.CostMatrix;

                    room.find(FIND_STRUCTURES).forEach(function(struct)
                    {
                        if (struct.structureType === STRUCTURE_ROAD)
                        {
                            // Favor roads over plain tiles
                            costs.set(struct.pos.x, struct.pos.y, 1);
                        }
                        else if (struct.structureType !== STRUCTURE_CONTAINER &&
                                (struct.structureType !== STRUCTURE_RAMPART || !struct.my))
                        {
                            // Can't walk through non-walkable buildings
                            costs.set(struct.pos.x, struct.pos.y, 0xff);
                        }
                    });

                    return costs;
                },
            }
        );
    },

    /**
     * Create the construction sites for the path stored in pathfinderResults
     */
    build_roads()
    {
        drawColor = '#BEFFE0';
        for(var i = 0, l = pathfinderResults.path.length; i < l; ++i)
        {
            // TODO: If it is possible to have multiple structures in a single spot, update here.
            let struct = pathfinderResults.path[i].lookFor(LOOK_STRUCTURES);

            if (struct.length && struct[0].structureType == 'road')
                continue;

            if (struct.length > 1)
                console.log('Found more than one structure at (' + pathfinderResults.path[i].x + ', ' + pathfinderResults.path[i].y + '). Need to investigate.');

            let cs = pathfinderResults.path[i].lookFor(LOOK_CONSTRUCTION_SITES);

            if (cs.length && cs[0].structureType == 'road')
                continue;

            pathfinderResults.path[i].createConstructionSite(STRUCTURE_ROAD);
        }
    },
};


module.exports = utilRoadPlanner;