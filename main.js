//////////////////////////////////////////////////////////////////////////////
// Simple Screeps AI
//
// Felipe Guedes
//
// A small bot with big ambitions :)
//////////////////////////////////////////////////////////////////////////////

// Initialization
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
var roleColonizer       = require('role.colonizer');

var utilVisualizer      = require('util.visualizer');
var utilRoadPlanner     = require('util.roadplanner');


// This is a WIP road planner. It is planned outside of the loop to save cycles.
// It doesn't work on it's own, needing user modification to use it.
/*
utilRoadPlanner.plan(new RoomPosition(Memory.rooms['W8N4'].sources[0].x,
                                      Memory.rooms['W8N4'].sources[0].y,
                                      'W8N4'),
                                      Game.spawns['Spawn1'].room.storage.pos);
//                                      Game.spawns['Spawn1'].pos);
//*/
// utilRoadPlanner.build_roads();

// Main loop
module.exports.loop = function ()
{
    global.numMsg = 0; // Used in util.spawn()
//    utilRoadPlanner.draw_planned_road();

    // On official server, generate pixels
    if (typeof Game.cpu.generatePixel == 'function')
    {
        if (Game.cpu.bucket >= 5000)
        {
            console.log("Bucket over 5000, generating pixel.")
            Game.cpu.generatePixel();
        }
    }

    // Start by cleaning up the memory
    logicMemory.cleanup();

    // Room utilities
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
    for (let spawn in Game.spawns)
    {
        // Handle spawning
        logicSpawn.run(Game.spawns[spawn]);  // This might not work when using a controller loop (ABOVE TODO)
    }

    // Special checks for the builder - this prevent it to be run once per creep
    let activateBuilder = {}
    for(const [roomName, room] of Object.entries(Game.rooms))
    {
        // Process each room only once
        if (activateBuilder[roomName] !== undefined)
            continue;

        // Find construction sites
        const targets = room.find(FIND_MY_CONSTRUCTION_SITES);

        // Find structures that are damaged
        const closestMyDamagedStructure = room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });

        // Find walls that need repairs
        // IMPORTANT: The 0.01 here must be the same value used in role.builder.js
        const closestWallDamagedStructure = room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax * 0.01 && structure.structureType === STRUCTURE_WALL
        });

        activateBuilder[roomName] = targets.length || closestMyDamagedStructure.length || closestWallDamagedStructure.length;
    }

    // Go through all the creeps, check their role and run their behavior function
    for(const [creepName, creep] of Object.entries(Game.creeps))
    {
        if(creep.memory.role === 'hauler')
        {
            roleHauler.run(creep);
        }
        else if(creep.memory.role === 'staticHarvester')
        {
            roleStaticHarvester.run(creep);
        }
        else if(creep.memory.role === 'upgrader')
        {
                roleUpgrader.run(creep);
        }
        else if(creep.memory.role === 'upgradernewroom')
        {
            if (creep.pos.roomName !== 'W1N4')
                creep.moveTo(Game.flags.spawnflag);
            else
                roleUpgrader.run(creep);
        }
        else if(creep.memory.role === 'builder')
        {
            if (activateBuilder[creep.room.name])
                roleBuilder.run(creep);
            else
                roleUpgrader.run(creep);
        }
        else if(creep.memory.role === 'colonizer')
        {
            roleColonizer.run(creep);
        }

    }
}