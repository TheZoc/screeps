var utilRoadPlanner =
{
    pathfinderResults: 0,
    drawColor: '#f00',

    /**
     * Draw the path stored in `this.pathfinderResults`
     */
    draw_planned_road: function()
    {
        if (!this.pathfinderResults)
            return;

        for(var i = 0, l = this.pathfinderResults.path.length - 1; i < l; ++i)
        {
            if (Game.rooms[this.pathfinderResults.path[i].roomName]   !== undefined &&
                Game.rooms[this.pathfinderResults.path[i+1].roomName] !== undefined)
            {
                if (this.pathfinderResults.path[i].roomName !== this.pathfinderResults.path[i+1].roomName)
                    continue;

                Game.rooms[this.pathfinderResults.path[i].roomName].visual.line(this.pathfinderResults.path[i],
                                                                           this.pathfinderResults.path[i+1],
                                                                           {width: 0.15, color: this.drawColor, opacity: 0.8, lineStyle: 'undefined'});
            }
        }
/*
        for(var i = 0, l = this.pathfinderResults.path.length; i < l; ++i)
        {
            if (Game.rooms[this.pathfinderResults.path[i].roomName] != undefined)
            {
                Game.rooms[this.pathfinderResults.path[i].roomName].visual.rect(this.pathfinderResults.path[i].x - 0.5,
                                                                           this.pathfinderResults.path[i].y - 0.5,
                                                                           1,
                                                                           1,
                                                                           {fill: this.drawColor, stroke: 'transparent', strokeWidth: '0.05', opacity: '0.4'});
            }
        }
//*/

    },

    /**
     * Find the optimal path between origin and destination, ignoring creeps.
     * This will store a path on `this.pathfinderResults` starting on a neighbor cell
     * from origin and ending in a neighbor cell in destination.
     *
     * @param {RoomPosition} origin       - The initial coordinate for the search
     * @param {RoomPosition} destination  - The final coordinate for the search
     */
    plan: function(origin, destination)
    {
        this.drawColor = '#f00';
        this.pathfinderResults = PathFinder.search(
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
     * Create the construction sites for the path stored in this.pathfinderResults
     */
    build_roads()
    {
        this.drawColor = '#BEFFE0';
        for(var i = 0, l = this.pathfinderResults.path.length; i < l; ++i)
        {
            // TODO: If it is possible to have multiple structures in a single spot, update here.
            let struct = this.pathfinderResults.path[i].lookFor(LOOK_STRUCTURES);

            if (struct.length && struct[0].structureType === 'road')
                continue;

            if (struct.length > 1)
                console.log('Found more than one structure at (' + this.pathfinderResults.path[i].x + ', ' + this.pathfinderResults.path[i].y + '). Need to investigate.');

            let cs = this.pathfinderResults.path[i].lookFor(LOOK_CONSTRUCTION_SITES);

            if (cs.length && cs[0].structureType === 'road')
                continue;

            this.pathfinderResults.path[i].createConstructionSite(STRUCTURE_ROAD);
        }
    },
};


module.exports = utilRoadPlanner;