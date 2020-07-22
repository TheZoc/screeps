//////////////////////////////////////////////////////////////////////////////
// Bunker Blueprint - Work in progress
//////////////////////////////////////////////////////////////////////////////

let blueprintBunker = {

    init: function()
    {
        this.blueprint = [
            // RCL 1
            [
                {structure: STRUCTURE_SPAWN, x: 0, y: -2},
            ],
            // RCL 2
            [
                // Roads
                {structure: STRUCTURE_ROAD, x: 1, y: 0},
                {structure: STRUCTURE_ROAD, x: 1, y: 1},
                {structure: STRUCTURE_ROAD, x: 0, y: 1},
                {structure: STRUCTURE_ROAD, x: -1, y: 1},
                {structure: STRUCTURE_ROAD, x: -1, y: 0},
                {structure: STRUCTURE_ROAD, x: -1, y: -1},
                {structure: STRUCTURE_ROAD, x: 0, y: -1},
                {structure: STRUCTURE_ROAD, x: 1, y: -1},
                {structure: STRUCTURE_ROAD, x: 2, y: -2},
                {structure: STRUCTURE_ROAD, x: 1, y: -3},
                {structure: STRUCTURE_ROAD, x: 1, y: -4},
                {structure: STRUCTURE_ROAD, x: 2, y: -5},
                {structure: STRUCTURE_ROAD, x: 3, y: -4},
                {structure: STRUCTURE_ROAD, x: 4, y: -3},
                {structure: STRUCTURE_ROAD, x: 5, y: -2},
                {structure: STRUCTURE_ROAD, x: 4, y: -1},
                {structure: STRUCTURE_ROAD, x: 3, y: -1},
                {structure: STRUCTURE_ROAD, x: -1, y: -3},
                {structure: STRUCTURE_ROAD, x: -1, y: -4},
                {structure: STRUCTURE_ROAD, x: -2, y: -5},
                {structure: STRUCTURE_ROAD, x: -3, y: -4},
                {structure: STRUCTURE_ROAD, x: -4, y: -3},
                {structure: STRUCTURE_ROAD, x: -5, y: -2},
                {structure: STRUCTURE_ROAD, x: -4, y: -1},
                {structure: STRUCTURE_ROAD, x: -3, y: -1},
                {structure: STRUCTURE_ROAD, x: -2, y: -2},
                {structure: STRUCTURE_ROAD, x: -4, y: 1},
                {structure: STRUCTURE_ROAD, x: -3, y: 1},
                {structure: STRUCTURE_ROAD, x: -5, y: 2},
                {structure: STRUCTURE_ROAD, x: -4, y: 3},
                {structure: STRUCTURE_ROAD, x: -3, y: 4},
                {structure: STRUCTURE_ROAD, x: -2, y: 5},
                {structure: STRUCTURE_ROAD, x: -1, y: 4},
                {structure: STRUCTURE_ROAD, x: -1, y: 3},
                {structure: STRUCTURE_ROAD, x: -2, y: 2},
                {structure: STRUCTURE_ROAD, x: 2, y: 2},
                {structure: STRUCTURE_ROAD, x: 3, y: 3},
                {structure: STRUCTURE_ROAD, x: 4, y: 4},
                {structure: STRUCTURE_ROAD, x: 0, y: -5},
                {structure: STRUCTURE_ROAD, x: 0, y: -6},
                {structure: STRUCTURE_ROAD, x: 0, y: -7},
                {structure: STRUCTURE_ROAD, x: 0, y: -9},
                {structure: STRUCTURE_ROAD, x: 0, y: -8},
                {structure: STRUCTURE_ROAD, x: -5, y: 0},
                {structure: STRUCTURE_ROAD, x: -6, y: 0},
                {structure: STRUCTURE_ROAD, x: -7, y: 0},
                {structure: STRUCTURE_ROAD, x: -8, y: 0},
                {structure: STRUCTURE_ROAD, x: -9, y: 0},
                {structure: STRUCTURE_ROAD, x: 1, y: 3},
                {structure: STRUCTURE_ROAD, x: 1, y: 4},
                {structure: STRUCTURE_ROAD, x: 1, y: 5},
                {structure: STRUCTURE_ROAD, x: 0, y: 6},
                {structure: STRUCTURE_ROAD, x: 0, y: 7},
                {structure: STRUCTURE_ROAD, x: 3, y: 1},
                {structure: STRUCTURE_ROAD, x: 4, y: 1},
                {structure: STRUCTURE_ROAD, x: 5, y: 1},
                {structure: STRUCTURE_ROAD, x: 6, y: 0},
                {structure: STRUCTURE_ROAD, x: 7, y: 0},
                {structure: STRUCTURE_ROAD, x: 8, y: 0},
                {structure: STRUCTURE_ROAD, x: 9, y: 0},
                {structure: STRUCTURE_ROAD, x: 0, y: 8},
                {structure: STRUCTURE_ROAD, x: 0, y: 9},
                {structure: STRUCTURE_ROAD, x: 2, y: 6},
                {structure: STRUCTURE_ROAD, x: 3, y: 6},
                {structure: STRUCTURE_ROAD, x: 4, y: 6},
                {structure: STRUCTURE_ROAD, x: 6, y: 2},
                {structure: STRUCTURE_ROAD, x: 6, y: 3},
                {structure: STRUCTURE_ROAD, x: 6, y: 4},
                {structure: STRUCTURE_ROAD, x: 5, y: 5},

                // Extension                
                {structure: STRUCTURE_EXTENSION, x: 0, y: -3},
                {structure: STRUCTURE_EXTENSION, x: 0, y: -4},
                {structure: STRUCTURE_EXTENSION, x: 1, y: -5},
                {structure: STRUCTURE_EXTENSION, x: 1, y: -6},
                {structure: STRUCTURE_EXTENSION, x: 2, y: -6},
                {structure: STRUCTURE_EXTENSION, x: 2, y: -4},
                {structure: STRUCTURE_EXTENSION, x: 2, y: -3},
                {structure: STRUCTURE_EXTENSION, x: 3, y: -3},
                {structure: STRUCTURE_EXTENSION, x: 3, y: -2},
                {structure: STRUCTURE_EXTENSION, x: 4, y: -2},
                {structure: STRUCTURE_EXTENSION, x: 4, y: -4},
                {structure: STRUCTURE_EXTENSION, x: 5, y: -4},
                {structure: STRUCTURE_EXTENSION, x: 5, y: -3},
                {structure: STRUCTURE_EXTENSION, x: 3, y: -5},
                {structure: STRUCTURE_EXTENSION, x: 4, y: -5},
                {structure: STRUCTURE_EXTENSION, x: 5, y: -1},
                {structure: STRUCTURE_EXTENSION, x: 6, y: -1},
                {structure: STRUCTURE_EXTENSION, x: 6, y: -2},
                {structure: STRUCTURE_EXTENSION, x: 4, y: 0},
                {structure: STRUCTURE_EXTENSION, x: -1, y: -5},
                {structure: STRUCTURE_EXTENSION, x: -1, y: -6},
                {structure: STRUCTURE_EXTENSION, x: -2, y: -6},
                {structure: STRUCTURE_EXTENSION, x: -3, y: -5},
                {structure: STRUCTURE_EXTENSION, x: -4, y: -5},
                {structure: STRUCTURE_EXTENSION, x: -4, y: -4},
                {structure: STRUCTURE_EXTENSION, x: -5, y: -4},
                {structure: STRUCTURE_EXTENSION, x: -5, y: -3},
                {structure: STRUCTURE_EXTENSION, x: -6, y: -2},
                {structure: STRUCTURE_EXTENSION, x: -6, y: -1},
                {structure: STRUCTURE_EXTENSION, x: -5, y: -1},
                {structure: STRUCTURE_EXTENSION, x: -2, y: -4},
                {structure: STRUCTURE_EXTENSION, x: -3, y: -3},
                {structure: STRUCTURE_EXTENSION, x: -2, y: -3},
                {structure: STRUCTURE_EXTENSION, x: -3, y: -2},
                {structure: STRUCTURE_EXTENSION, x: -4, y: -2},
                {structure: STRUCTURE_EXTENSION, x: -6, y: 1},
                {structure: STRUCTURE_EXTENSION, x: -5, y: 1},
                {structure: STRUCTURE_EXTENSION, x: -6, y: 2},
                {structure: STRUCTURE_EXTENSION, x: -4, y: 2},
                {structure: STRUCTURE_EXTENSION, x: -3, y: 2},
                {structure: STRUCTURE_EXTENSION, x: -3, y: 3},
                {structure: STRUCTURE_EXTENSION, x: -2, y: 3},
                {structure: STRUCTURE_EXTENSION, x: -2, y: 4},
                {structure: STRUCTURE_EXTENSION, x: -5, y: 3},
                {structure: STRUCTURE_EXTENSION, x: -5, y: 4},
                {structure: STRUCTURE_EXTENSION, x: -4, y: 4},
                {structure: STRUCTURE_EXTENSION, x: -4, y: 5},
                {structure: STRUCTURE_EXTENSION, x: -3, y: 5},
                {structure: STRUCTURE_EXTENSION, x: -1, y: 5},
                {structure: STRUCTURE_EXTENSION, x: -1, y: 6},
                {structure: STRUCTURE_EXTENSION, x: -2, y: 6},
                {structure: STRUCTURE_EXTENSION, x: -4, y: 0},
                {structure: STRUCTURE_EXTENSION, x: 0, y: 3},
                {structure: STRUCTURE_EXTENSION, x: 0, y: 4},
                {structure: STRUCTURE_EXTENSION, x: 0, y: 5},
                {structure: STRUCTURE_EXTENSION, x: 5, y: 0},
                {structure: STRUCTURE_EXTENSION, x: 3, y: 0},
                {structure: STRUCTURE_EXTENSION, x: -3, y: 0},
                {structure: STRUCTURE_EXTENSION, x: -6, y: 3},
                {structure: STRUCTURE_EXTENSION, x: 3, y: -6}
            ],
            // RCL 3
            [
                {structure: STRUCTURE_TOWER, x: 1, y: -2},
            ],
            // RCL 4
            [
                {structure: STRUCTURE_STORAGE, x: 0, y: 0}
            ],
            // RCL 5
            [
                {structure: STRUCTURE_TOWER, x: -1, y: -2},
                {structure: STRUCTURE_LINK, x: 2, y: -1}
            ],
            // RCL 6
            [
                {structure: STRUCTURE_TERMINAL, x: 2, y: 1},
                {structure: STRUCTURE_LAB, x: 2, y: 3},
                {structure: STRUCTURE_LAB, x: 2, y: 4},
                {structure: STRUCTURE_LAB, x: 3, y: 4},
                {structure: STRUCTURE_LAB, x: 3, y: 5},
                {structure: STRUCTURE_LAB, x: 4, y: 5},
                {structure: STRUCTURE_LAB, x: 3, y: 2},
                {structure: STRUCTURE_LAB, x: 4, y: 2},
                {structure: STRUCTURE_LAB, x: 4, y: 3},
                {structure: STRUCTURE_LAB, x: 5, y: 3},
                {structure: STRUCTURE_LAB, x: 5, y: 4}
            ],
            // RCL 7
            [
                {structure: STRUCTURE_SPAWN, x: -2, y: 0},
                {structure: STRUCTURE_TOWER, x: -1, y: 2},
            ],
            // RCL 8
            [
                {structure: STRUCTURE_SPAWN, x: 0, y: 2},
                {structure: STRUCTURE_OBSERVER, x: -2, y: 1},
                {structure: STRUCTURE_POWER_SPAWN, x: -2, y: -1},
                {structure: STRUCTURE_NUKER, x: 2, y: 0},
                {structure: STRUCTURE_TOWER, x: 2, y: 5},
                {structure: STRUCTURE_TOWER, x: 1, y: 2},
                {structure: STRUCTURE_TOWER, x: 5, y: 2}
            ],
        ];
    },

    /**
     *
     * @param roomPosition {RoomPosition}
     */
    view: function(roomPosition)
    {
        if (Game.rooms[roomPosition.roomName] === undefined)
        {
            console.log("Attempting to set draw in an not visible (undefined) room");
            return;
        }

        for (let rcl in this.blueprint)
        {
            for (let i in this.blueprint[rcl])
            {
                if (this.blueprint[rcl][i].structure !== STRUCTURE_ROAD)
                    Game.rooms[roomPosition.roomName].visual.structure(roomPosition.x + this.blueprint[rcl][i].x, roomPosition.y + this.blueprint[rcl][i].y, this.blueprint[rcl][i].structure, {opacity: 0.25});
            }
        }
//        Game.rooms[roomPosition.roomName].visual.connectRoads();
    },

    /**
     *
     * @param roomPosition {RoomPosition}
     */
    view_extension_order: function(roomPosition)
    {
        if (Game.rooms[roomPosition.roomName] === undefined)
        {
            console.log("Attempting to set draw in an not visible (undefined) room");
            return;
        }

        let count = {};

        const colors = {
            "spawn": "red",
            "extension": "green",
            "road": "grey",
            "constructedWall": "blue",
            "rampart": "blue",
            "link": "blue",
            "storage": "blue",
            "tower": "yellow",
            "observer": "blue",
            "powerSpawn": "blue",
            "extractor": "blue",
            "lab": "teal",
            "terminal": "blue",
            "container": "blue",
            "nuker": "blue",
            "factory": "blue"
        }

        for (let rcl in this.blueprint)
        {
            for (let i in this.blueprint[rcl])
            {
                // if (this.blueprint[rcl][i].structure !== STRUCTURE_ROAD)
                {
                    if (count[this.blueprint[rcl][i].structure] === undefined)
                        count[this.blueprint[rcl][i].structure] = 0;

                    Game.rooms[roomPosition.roomName].visual.text(
                        ++count[this.blueprint[rcl][i].structure],
                        roomPosition.x + this.blueprint[rcl][i].x,
                        roomPosition.y + this.blueprint[rcl][i].y + 0.25,
                        {color: colors[this.blueprint[rcl][i].structure], font: 0.8})
                }
            }
        }
        Game.rooms[roomPosition.roomName].visual.connectRoads();
    },
}

module.exports = blueprintBunker;
