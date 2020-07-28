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
require('util.ext.prototype.roomVisual');

const constants         = require("util.constants");

// Screeps specific code
const logicMemoryInit     = require('logic.memoryinit');
const logicMemory         = require('logic.memory');
const logicTower          = require('logic.tower');
const logicLink           = require('logic.link');
const logicExtensions     = require('logic.extensions');
const logicSpawnQueue     = require('logic.spawnqueue');
const logicSpawn          = require('logic.spawn');

const roleHauler          = require('role.hauler');
const roleUpgrader        = require('role.upgrader');
const roleBuilder         = require('role.builder');
const roleStaticHarvester = require('role.staticharvester');
//const roleUpgraderNewRoom = require('role.upgradernewroom');
const roleScout           = require('role.scout');
const roleFlagScout       = require('role.flagscout');
const roleNeighbourMiner  = require('role.neighbourminer');
const roleProspector      = require('role.prospector');

const utilVisualizer      = require('util.visualizer');
//const utilRoadPlanner     = require('util.roadplanner');

const blueprintBase       = require('blueprint.base');
blueprintBase.init();

//const blueprintBunker     = require('blueprint.bunker');
//blueprintBunker.init();

// Task manager
//const taskManager         = require('logic.taskmanager')

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

        // RoomVisual prototype enhancement test
        // Game.rooms[k].visual.structure(15, 31, STRUCTURE_TOWER, {opacity: 0.25});
        // Game.rooms[k].visual.connectRoads();
        // Game.rooms[k].visual.speech('Hello World', 22, 24);
        // Game.rooms[k].visual.animatedPosition(12, 32);
        // Game.rooms[k].visual.resource("XGHO2", 14, 33);
        // Game.rooms[k].visual.resource("K", 13, 32, 0.5);
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
            filter: (structure) => structure.hits < structure.hitsMax * 0.001 && structure.structureType === STRUCTURE_WALL
        });

        // Debug
        // console.log("targets.length: " + targets.length + " - closestMyDamagedStructure.length: " + myDamagedStructure.length + " - closestWallDamagedStructure.length: " + wallDamagedStructure.length);

        activateBuilder[roomName] = targets.length || myDamagedStructure.length || wallDamagedStructure.length;
    }

    // Go through all the creeps, check their role and run their behavior function
    for(const [/* creepName */, creep] of Object.entries(Game.creeps))
    {
        switch (creep.memory.role)
        {
            case constants.ROLE_BUILDER:
                if (activateBuilder[creep.room.name])
                    roleBuilder.run(creep);
                else
                    roleUpgrader.run(creep);
                break;

            case constants.ROLE_PROSPECTOR:
                roleProspector.run(creep);
                break;

            case constants.ROLE_REMOTE_HARVESTER:
            case 'neighbourminer':
                roleNeighbourMiner.run(creep);
                break;

            case constants.ROLE_SCOUT:
                roleScout.run(creep);
                break;

            case constants.ROLE_STATIC_HARVESTER:
                roleStaticHarvester.run(creep);
                break;

            case constants.ROLE_TRANSPORTER:
                roleHauler.run(creep);
                break;

            case constants.ROLE_UPGRADER:
                roleUpgrader.run(creep);
                break;

            // Old stuff
            case 'upgradernewroom':
                if (creep.pos.roomName !== 'W1N4')
                    if (!creep.fatigue)
                        creep.moveTo(Game.flags.spawnflag);
                    else
                        roleUpgrader.run(creep);
                break;

            case 'flagscout':
                roleFlagScout.run(creep);
                break;
        }
    }

    //*
    // Bunker Blueprint test
    if (Game.flags.Flag1 !== undefined)
    {
        blueprintBase.view(Game.flags.Flag1.pos);
        blueprintBase.view_extension_order(Game.flags.Flag1.pos);
        ++Memory.test.counter;

        // blueprintBunker.view(Game.flags.Flag1.pos);
        // blueprintBunker.view_extension_order(Game.flags.Flag1.pos);
    }
    //*/
}