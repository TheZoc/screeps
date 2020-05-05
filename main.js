global.util             = require('util');
global.ex               = (x) => JSON.stringify(x, null, 2);

require('util.ext.prototype.roomPosition');

var logicSpawn          = require('logic.spawn');
var logicMemoryInit     = require('logic.memoryinit');
var logicMemory         = require('logic.memory');
var logicTower          = require('logic.tower');
var logicExtensions     = require('logic.extensions');

var roleHauler          = require('role.hauler');
var roleUpgrader        = require('role.upgrader');
var roleBuilder         = require('role.builder');
var roleStaticHarvester = require('role.staticharvester');
var roleUpgraderNewRoom = require('role.upgradernewroom');

var utilVisualizer      = require('util.visualizer');
var utilRoadPlanner     = require('util.roadplanner');

/*
utilRoadPlanner.plan(new RoomPosition(Game.spawns['Spawn1'].room.memory.sources[1].x,
                                      Game.spawns['Spawn1'].room.memory.sources[1].y,
                                      'W8N3'),
                                      Game.spawns['Spawn1'].room.controller.pos);
//                                      Game.spawns['Spawn1'].pos);
//*/
// utilRoadPlanner.build_roads();

module.exports.loop = function ()
{
    global.numMsg = 0; // Used in util.spawn()
//    utilRoadPlanner.draw_planned_road();


    // Start by cleaning up the memory
    logicMemory.cleanup();

    for(let k in Game.rooms)
    {
        // Initialize memory
        logicMemoryInit.run(Game.rooms[k]);

        // Attempt to create extensions in a X shape, per spawn/extension
        logicExtensions.run(Game.rooms[k]);

        // Visualizer utilities
        utilVisualizer.draw(Game.rooms[k]);

        // Run the tower logic
        logicTower.run(Game.rooms[k]);
    }


    // TODO: Replace with a room/controller loop
    for (spawn in Game.spawns)
    {
        // Handle spawning
        logicSpawn.run(Game.spawns[spawn]);  // This might not work when using a controller loop (ABOVE TODO)
    }

    // Check role and run behavior function
    for(var name in Game.creeps)
    {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'hauler')
        {
            roleHauler.run(creep);
        }
        else if(creep.memory.role == 'staticHarvester')
        {
            roleStaticHarvester.run(creep);
        }
        else if(creep.memory.role == 'upgrader')
        {
                roleUpgrader.run(creep);
        }
        else if(creep.memory.role == 'upgradernewroom')
        {
            if (creep.pos.roomName != 'W1N4')
                creep.moveTo(Game.flags.spawnflag);
            else
                roleUpgrader.run(creep);
        }
        else if(creep.memory.role == 'builder')
        {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);

            if (targets.length)
            {
                roleBuilder.run(creep);
            }
            else
                roleUpgrader.run(creep);
        }
/*
        else if(creep.memory.role == 'colonizer')
        {
//            Game.creeps['Colonizer'].moveTo(Game.flags.Flag1);

//*
            if(creep.room.controller)
            {
                if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(creep.room.controller);
                }
            }
//* /
        }
//*/

    }
}