//////////////////////////////////////////////////////////////////////////////
// Bunker Blueprint - Work in progress
//////////////////////////////////////////////////////////////////////////////

let blueprintBase = {

    init: function()
    {
        this.blueprint = [
            // RCL 1
            [
                {structure: STRUCTURE_SPAWN, x: 0, y: 0},
            ],
            // RCL 2
            [
                {structure: STRUCTURE_EXTENSION, x: 2, y: -1},

                {structure: STRUCTURE_ROAD, x: 0, y:-1},
                {structure: STRUCTURE_ROAD, x: -1, y:0},
                {structure: STRUCTURE_ROAD, x: 1, y:0},
                {structure: STRUCTURE_ROAD, x: -2, y:1},
                {structure: STRUCTURE_ROAD, x: 2, y:1},
                {structure: STRUCTURE_ROAD, x: -3, y:2},
                {structure: STRUCTURE_ROAD, x: 1, y:2},
                {structure: STRUCTURE_ROAD, x: 3, y:2},
                {structure: STRUCTURE_ROAD, x: -2, y:3},
                {structure: STRUCTURE_ROAD, x: 2, y:3},
                {structure: STRUCTURE_ROAD, x: -1, y:4},
                {structure: STRUCTURE_ROAD, x: 1, y:4},
                {structure: STRUCTURE_ROAD, x: 0, y:5},

                {structure: STRUCTURE_ROAD, x: 2, y:-3},
                {structure: STRUCTURE_ROAD, x: 1, y:-2},
                {structure: STRUCTURE_ROAD, x: 3, y:-2},
                {structure: STRUCTURE_ROAD, x: 4, y:-1},
                {structure: STRUCTURE_ROAD, x: 5, y:0},
                {structure: STRUCTURE_ROAD, x: 4, y:1},
            ],
            // RCL 3
            [
                {structure: STRUCTURE_EXTENSION, x: 3, y: 0},
                {structure: STRUCTURE_TOWER, x: 0, y: 1},
            ],
            // RCL 4
            [
                {structure: STRUCTURE_EXTENSION, x: -3, y: 4},
                {structure: STRUCTURE_EXTENSION, x: -2, y: 5},
                {structure: STRUCTURE_STORAGE, x: 0, y: 2},
                {structure: STRUCTURE_ROAD, x: -4, y:3},
                {structure: STRUCTURE_ROAD, x: -5, y:4},
                {structure: STRUCTURE_ROAD, x: -4, y:5},
                {structure: STRUCTURE_ROAD, x: -3, y:6},
                {structure: STRUCTURE_ROAD, x: -2, y:7},
                {structure: STRUCTURE_ROAD, x: -1, y:6},

            ],
            // RCL 5
            [
                {structure: STRUCTURE_EXTENSION, x: -3, y: 0},
                {structure: STRUCTURE_EXTENSION, x: -2, y: -1},

                {structure: STRUCTURE_TOWER, x: -1, y: 2},
                {structure: STRUCTURE_LINK, x: 1, y: 3},

                {structure: STRUCTURE_ROAD, x: -2, y:-3},
                {structure: STRUCTURE_ROAD, x: -3, y:-2},
                {structure: STRUCTURE_ROAD, x: -1, y:-2},
                {structure: STRUCTURE_ROAD, x: -4, y:-1},
                {structure: STRUCTURE_ROAD, x: -5, y:0},
                {structure: STRUCTURE_ROAD, x: -4, y:1},

            ],
            // RCL 6
            [
                // TODO: After RCL 5, it should just try to fit the extensions in the best possible way, from a list. They're here temporarely.
                {structure: STRUCTURE_EXTENSION, x: -5, y: 2},
                {structure: STRUCTURE_EXTENSION, x: 0, y: -3},
                {structure: STRUCTURE_EXTENSION, x: 0, y: 7},
                {structure: STRUCTURE_EXTENSION, x: 5, y: 2},

                // Roads for the resources above RCL 5 should be created together with the STRUCTURE_EXTENSION cross. Keeping it here for now.

                {structure: STRUCTURE_ROAD, x: -6, y:1},
                {structure: STRUCTURE_ROAD, x: -7, y:2},
                {structure: STRUCTURE_ROAD, x: -6, y:3},


                {structure: STRUCTURE_ROAD, x: 0, y:-5},
                {structure: STRUCTURE_ROAD, x: -1, y:-4},
                {structure: STRUCTURE_ROAD, x: 1, y:-4},

                {structure: STRUCTURE_ROAD, x: 6, y:1},
                {structure: STRUCTURE_ROAD, x: 7, y:2},
                {structure: STRUCTURE_ROAD, x: 6, y:3},
                {structure: STRUCTURE_ROAD, x: 5, y:4},
                {structure: STRUCTURE_ROAD, x: 4, y:3},

                {structure: STRUCTURE_ROAD, x: 1, y:6},
                {structure: STRUCTURE_ROAD, x: 2, y:7},
                {structure: STRUCTURE_ROAD, x: -1, y:8},
                {structure: STRUCTURE_ROAD, x: 1, y:8},
                {structure: STRUCTURE_ROAD, x: 0, y:9},

                // Lab road
                {structure: STRUCTURE_ROAD, x: 2, y:4},
                {structure: STRUCTURE_ROAD, x: 3, y:5},
                {structure: STRUCTURE_ROAD, x: 4, y:6},
                {structure: STRUCTURE_ROAD, x: 5, y:7},
                {structure: STRUCTURE_ROAD, x: 6, y:6},
                {structure: STRUCTURE_ROAD, x: 6, y:5},
                {structure: STRUCTURE_ROAD, x: 4, y:8},
                {structure: STRUCTURE_ROAD, x: 3, y:8},

                {structure: STRUCTURE_TERMINAL, x: 3, y: 3},

                {structure: STRUCTURE_LAB, x: 3, y: 4},
                {structure: STRUCTURE_LAB, x: 4, y: 4},
                {structure: STRUCTURE_LAB, x: 4, y: 5},
            ],
            // RCL 7
            [
                {structure: STRUCTURE_SPAWN, x: -2, y: 2},
                {structure: STRUCTURE_TOWER, x: 0, y: 3},

                {structure: STRUCTURE_LAB, x: 2, y: 5},
                {structure: STRUCTURE_LAB, x: 2, y: 6},
                {structure: STRUCTURE_LAB, x: 3, y: 6},
            ],
            // RCL 8
            [
                {structure: STRUCTURE_SPAWN, x: 0, y: 4},
                {structure: STRUCTURE_OBSERVER, x: -1, y: 1},
                {structure: STRUCTURE_POWER_SPAWN, x: 2, y: 2},
                {structure: STRUCTURE_NUKER, x: 1, y: 5}, // Consider replacing this with a factory and repositioning the nuke
                {structure: STRUCTURE_TOWER, x: 0, y: 6},
                {structure: STRUCTURE_TOWER, x: 4, y: 2},
                {structure: STRUCTURE_TOWER, x: 0, y: -2},

                {structure: STRUCTURE_LAB, x: 5, y: 5},
                {structure: STRUCTURE_LAB, x: 3, y: 7},
                {structure: STRUCTURE_LAB, x: 4, y: 7},
                {structure: STRUCTURE_LAB, x: 5, y: 6}
            ],
        ];
   },

    /**
     *
     * @param roomPosition {RoomPosition}
     */
    view: function(roomPosition)
    {
        if (Memory.test === undefined)
        {
            Memory.test = {}
        }
        if (Memory.test.counter === undefined)
        {
            Memory.test.counter = 0;
        }

        if (Game.rooms[roomPosition.roomName] === undefined)
        {
            console.log("Attempting to set draw in an not visible (undefined) room");
            return;
        }

        let target_rcl = Memory.test.counter;
        for (let rcl = 0; rcl < target_rcl; ++rcl)
        {
            for (let i in this.blueprint[rcl])
            {
                //if (this.blueprint[rcl][i].structure !== STRUCTURE_ROAD)
                    Game.rooms[roomPosition.roomName].visual.structure(roomPosition.x + this.blueprint[rcl][i].x, roomPosition.y + this.blueprint[rcl][i].y, this.blueprint[rcl][i].structure, {opacity: 0.25});
            }
        }
         Game.rooms[roomPosition.roomName].visual.connectRoads();


        Memory.test.counter = Memory.test.counter % 12;
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
            "spawn": "crimson",
            "extension": "#FFE87B",
            "road": "#CCC",
            "constructedWall": "blue",
            "rampart": "blue",
            "link": "blue",
            "storage": "blue",
            "tower": "violet",
            "observer": "blue",
            "powerSpawn": "hotpink",
            "extractor": "blue",
            "lab": "teal",
            "terminal": "blue",
            "container": "blue",
            "nuker": "blue",
            "factory": "blue"
        }

        let target_rcl = Memory.test.counter;
        for (let rcl = 0; rcl < target_rcl; ++rcl)
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
                        {color: colors[this.blueprint[rcl][i].structure], font: 0.6})
                }
            }
        }
   },
}

module.exports = blueprintBase;
