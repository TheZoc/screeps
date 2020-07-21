//////////////////////////////////////////////////////////////////////////////
// Simple Screeps AI
//
// Felipe Guedes
//
// A small bot with big ambitions :)
//////////////////////////////////////////////////////////////////////////////
'use strict';

// Initialization
global.util             = require('util');
global.ex               = (x) => JSON.stringify(x, null, 2);
global.FlatQueue        = require('datastructure.priorityqueue');

// Utilities
require('util.ext.prototype.roomPosition');
const constants         = require("util.constants");

// Screeps specific code
var logicMemoryInit     = require('logic.memoryinit');
var logicMemory         = require('logic.memory');
var logicTower          = require('logic.tower');
var logicLink           = require('logic.link');
var logicExtensions     = require('logic.extensions');
var logicSpawnQueue     = require('logic.spawnqueue');
var logicSpawn          = require('logic.spawn');

var roleHauler          = require('role.hauler');
var roleUpgrader        = require('role.upgrader');
var roleBuilder         = require('role.builder');
var roleStaticHarvester = require('role.staticharvester');
var roleUpgraderNewRoom = require('role.upgradernewroom');
var roleScout           = require('role.scout');
var roleNeighbourMiner  = require('role.neighbourminer');

var utilVisualizer      = require('util.visualizer');
var utilRoadPlanner     = require('util.roadplanner');

// Task manager
var taskManager         = require('logic.taskmanager')

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
            console.log("Bucket over 5000, generating pixel.");
            Game.cpu.generatePixel();
        }
    }

    // Start by cleaning up the memory
    logicMemory.cleanup();

    /*
    // Task manager test
    let tasks = new Map();
    for(let k in Game.rooms)
    {
        tasks[Game.rooms[k].name] = new FlatQueue();
        taskManager.gather_room_tasks(Game.rooms[k], tasks[Game.rooms[k].name]);

        const dump = tasks[Game.rooms[k].name].dumpNicely();
        if (dump !== "")
            console.log(dump);
    }
    //*/

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

        // Run the link logic
        logicLink.run(Game.rooms[k]);

        // Create the spawn queue for this room
        logicSpawnQueue.run(Game.rooms[k]);

        // Spawn units in the spawn queue
        logicSpawn.run(Game.rooms[k]);
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
        const myDamagedStructure = room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => (structure.structureType !== STRUCTURE_RAMPART && structure.hits < structure.hitsMax * 0.9) ||
                (structure.structureType === STRUCTURE_RAMPART && structure.hits < structure.hitsMax * 0.01) // don't heal ramparts over 1% hp
        });

        // Find walls that need repairs
        // IMPORTANT: The 0.01 here must be the same value used in role.builder.js
        const wallDamagedStructure = room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax * 0.01 && structure.structureType === STRUCTURE_WALL
        });

        // Debug
        // console.log("targets.length: " + targets.length + " - closestMyDamagedStructure.length: " + myDamagedStructure.length + " - closestWallDamagedStructure.length: " + wallDamagedStructure.length);

        activateBuilder[roomName] = targets.length || myDamagedStructure.length || wallDamagedStructure.length;
    }

    // Go through all the creeps, check their role and run their behavior function
    for(const [creepName, creep] of Object.entries(Game.creeps))
    {
        const role = creep.memory.role;
        if(role === 'hauler' || role === constants.ROLE_TRANSPORTER)
        {
            roleHauler.run(creep);
        }
        else if(role === 'staticHarvester' || role === constants.ROLE_STATIC_HARVESTER)
        {
            roleStaticHarvester.run(creep);
        }
        else if(role === 'upgrader' || role === constants.ROLE_UPGRADER)
        {
                roleUpgrader.run(creep);
        }
        else if(role === 'upgradernewroom')
        {
            if (creep.pos.roomName !== 'W1N4')
                if (!creep.fatigue)
                    creep.moveTo(Game.flags.spawnflag);
            else
                roleUpgrader.run(creep);
        }
        else if(role === 'builder' || role === constants.ROLE_BUILDER)
        {
            if (activateBuilder[creep.room.name])
            {
                roleBuilder.run(creep);
            }
            else
            {
                roleUpgrader.run(creep);
            }
        }
        else if(role === 'scout' || role === constants.ROLE_SCOUT)
        {
            roleScout.run(creep);
        }
        else if(role === 'neighbourminer' || role === constants.ROLE_REMOTE_HARVESTER)
        {
            roleNeighbourMiner.run(creep);
        }
    }
}