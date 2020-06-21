var logicSpawn = {
    // "Constants"
    MAX_PER_ROOM_BUILDERS         : 4,
    MAX_PER_SOURCE_HAULERS        : 2, // This is counter per source, not per room!
    MAX_PER_ROOM_STATICHARVESTERS : 2,
    MAX_PER_ROOM_UPGRADERS        : 2,

    // Control Variables
    willToSpawn             : false,
    amountBuilder           : 0,
    amountHauler            : 0,
    amountStaticHarvester   : 0,
    amountUpgrader          : 0,

    listContainers          : 0,

    run: function(targetSpawn)
    {
        if (targetSpawn.spawning)   // Saves processing cycles. Remove for debugging and extra messages ;)
            return;

        logicSpawn.willToSpawn = false;

        // TODO: A room can contain multiple spawns. Change this to be room-based instead of spawn-based
        this.count_creeps(targetSpawn.room);

        this.spawn_static_harvester(targetSpawn);
        if (!logicSpawn.willToSpawn) this.spawn_hauler(targetSpawn);
        if (!logicSpawn.willToSpawn) this.spawn_upgrader(targetSpawn);
        if (!logicSpawn.willToSpawn) this.spawn_builder(targetSpawn);
//        if (!logicSpawn.willToSpawn) this.spawn_upgrader_newroom(targetSpawn);

        this.spawn_emergency_builder(targetSpawn);
        this.spawn_emergency_static_harvester(targetSpawn);
        this.spawn_emergency_hauler(targetSpawn);
    },

    count_creeps: function(targetRoom)
    {
        logicSpawn.amountBuilder           = _.filter(Game.creeps, (creep) => (creep.memory.role == 'builder'        ) && (creep.memory.room == targetRoom.name)).length;
        logicSpawn.amountHauler            = _.filter(Game.creeps, (creep) => (creep.memory.role == 'hauler'         ) && (creep.memory.room == targetRoom.name)).length;
        logicSpawn.amountStaticHarvester   = _.filter(Game.creeps, (creep) => (creep.memory.role == 'staticHarvester') && (creep.memory.room == targetRoom.name)).length;
        logicSpawn.amountUpgrader          = _.filter(Game.creeps, (creep) => (creep.memory.role == 'upgrader'       ) && (creep.memory.room == targetRoom.name)).length;

        logicSpawn.listContainers          = targetRoom.find(FIND_STRUCTURES, { filter: (structure) => { return structure.structureType == STRUCTURE_CONTAINER; }});
    },

    spawn_static_harvester: function(targetSpawn)
    {
//Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,MOVE], 'StaticHarvester1', {memory: {role: 'staticHarvester', source: 1}});
//Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,MOVE], 'Builder1', {memory: {role: 'builder'}});

        const targetRoom          = targetSpawn.room;
        const staticHarvesterName = 'StaticHarvester';  // TODO: Move this to a global constant (?)

        // TODO: Improve this messy hack
        // console.log(targetSpawn.room.energyCapacityAvailable);
        const energyAvailable = targetSpawn.room.energyCapacityAvailable - 100;  // Remove the mandatory move and carry parts
        const maxWorkParts = 5;
        let desiredWorkParts = Math.min(Math.floor(energyAvailable / BODYPART_COST[WORK]), maxWorkParts);

        var staticHarvesterParts = [MOVE]; // 50 energy
        for(let i = 0; i < desiredWorkParts; ++i) staticHarvesterParts.push(WORK);
        staticHarvesterParts.push(CARRY); // 50 energy
        //let staticHarvesterParts  = [MOVE,WORK,WORK,WORK,WORK,CARRY]; // Cost: 400

        // Spawn static harvesters here
        for(let i = 0, l = targetRoom.memory.sources.length; i < l; ++i)
        {
            // For some reason, this happened after a while. Leaving a message here to try and catch the error
            if (typeof (targetRoom.memory.sources[i].harvester) === 'undefined')
            {
//                targetRoom.memory.sources[i].harvester = 'staticHarvester';
                console.log('targetRoom.memory.sources[' + i + '].harvester memory got deleted. Reinitializing.')
            }

            if(targetRoom.memory.sources[i].harvester)
            {
                // First, try to get the harvester by id
                if (!Game.getObjectById(targetRoom.memory.sources[i].harvester))
                {
                    // If it failed, try to get the harvester using it's name
                    const creep = Game.creeps[targetRoom.memory.sources[i].harvester];
                    if (creep)
                    {
                        // Did we get it? Save it as id.
                        if (typeof creep.id !== 'undefined') // This prevents multiple spawns from setting the variable to undefined ;)
                        {
//                          console.log('Check if null for sources [' + i + '] ' + creep.id);
                            targetRoom.memory.sources[i].harvester = creep.id;
                            continue;
                        }
                    }
                    else
                    {
                        logicSpawn.willToSpawn = true;
                        let newStaticHarvesterName = staticHarvesterName + Game.time;
                        const spawnResult = util.spawn(targetSpawn,
                                                       staticHarvesterParts,
                                                       newStaticHarvesterName,
                                                       {role: 'staticHarvester', source: i, room: targetSpawn.room.name},
                                                       staticHarvesterName);
                        if (spawnResult == OK)
                        {
                            targetRoom.memory.sources[i].harvester = newStaticHarvesterName;
                            break;  // Break out of for loop, nothing else to be done here.
                        }
                    }
                }
            }
        }
    },

    spawn_hauler: function(targetSpawn)
    {
        // Only spawn haulers if we have containers!
        if (logicSpawn.listContainers.length === 0)
            return;

        // Spawn haulers here
        const haulerName       = 'Hauler';

        // TODO: Improve this messy hack
        // console.log(targetSpawn.room.energyCapacityAvailable);
        let energyAvailable = targetSpawn.room.energyCapacityAvailable - 150;  // Remove the cost of mandatory move and carry parts
        let maxCarryParts = 4;
        let currentCarryParts = 0;
        var haulerParts = [MOVE, MOVE]; // 100 energy
        while (energyAvailable > (currentCarryParts*100) && currentCarryParts < maxCarryParts )
        {
            ++currentCarryParts;
            haulerParts.push(CARRY);
        }
        haulerParts.push(CARRY); // 50 energy
//        console.log(haulerParts);

        //let   haulerParts      = [MOVE,MOVE,CARRY,CARRY,CARRY,CARRY]; // Cost: 500

        for(let i = 0, l = targetSpawn.room.memory.sources.length; i < l; ++i)
        {
            if (targetSpawn.room.memory.sources[i].haulers >= this.MAX_PER_SOURCE_HAULERS)
                continue;

            logicSpawn.willToSpawn = true;
            const spawnResult = util.spawn(targetSpawn,
                                           haulerParts,
                                           haulerName + Game.time,
                                           {role: 'hauler', source: i, room: targetSpawn.room.name},
                                           haulerName);
            if (spawnResult == OK)
            {
                ++targetSpawn.room.memory.sources[i].haulers;
                break;  // Break out of for loop, nothing else to be done here.
            }
        }
    },

    spawn_upgrader: function(targetSpawn)
    {
        if (logicSpawn.amountUpgrader >= this.MAX_PER_ROOM_UPGRADERS)
            return;

        const upgraderName    = 'Upgrader';
//        let   upgraderParts   = [MOVE,MOVE,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY]; // Cost: 550

        let energyAvailable = targetSpawn.room.energyCapacityAvailable;  // Remove the mandatory move and carry parts
        let desiredParts;
        if (targetSpawn.room.energyCapacityAvailable <= 300)
        {
            desiredParts = [MOVE, WORK];
            energyAvailable -= 150;
        }
        else
        {
            desiredParts = [MOVE,MOVE,WORK,WORK];
            energyAvailable -= 300;
        }

        const maxCarryParts = 10;
        let carryParts = Math.min(Math.floor(energyAvailable / BODYPART_COST[CARRY]), maxCarryParts);

        for(let i = 0; i < carryParts; ++i) desiredParts.push(CARRY);

        //console.log(desiredParts);


        logicSpawn.willToSpawn = true;
        util.spawn(targetSpawn,
                   desiredParts,
                   upgraderName + Game.time,
                   {role: 'upgrader', room: targetSpawn.room.name},
                   upgraderName);
    },


    spawn_upgrader_newroom: function(targetSpawn)
    {
        const upgraderPerRoom = 1;
        const upgraderAmount  = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgradernewroom').length;

        if (upgraderAmount >= upgraderPerRoom)
            return;

        const upgraderName    = 'UpgraderNewRoom';
        let   upgraderParts   = [MOVE,MOVE,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY]; // Cost: 550


        logicSpawn.willToSpawn = true;
        util.spawn(targetSpawn,
                   upgraderParts,
                   upgraderName + Game.time,
                   {role: 'upgradernewroom', room: targetSpawn.room.name},
                   upgraderName);
    },

    spawn_builder: function(targetSpawn)
    {
        if (logicSpawn.amountBuilder >= this.MAX_PER_ROOM_BUILDERS)
            return;

        const builderName    = 'Builder';
//        let   builderParts   = [MOVE,MOVE,WORK,WORK,WORK,CARRY,CARRY,CARRY]; // Cost: 550



        let energyAvailable = targetSpawn.room.energyCapacityAvailable;  // Remove the mandatory move and carry parts
        let desiredParts;
        if (targetSpawn.room.energyCapacityAvailable <= 300)
        {
            desiredParts = [MOVE, WORK];
            energyAvailable -= 150;
        }
        else if (targetSpawn.room.energyCapacityAvailable <= 500)
        {
            desiredParts = [MOVE,MOVE,WORK,WORK];
            energyAvailable -= 300;
        }
        else if (targetSpawn.room.energyCapacityAvailable <= 750)
        {
            desiredParts = [MOVE,MOVE,WORK,WORK,WORK];
            energyAvailable -= 400;
        }
        else // if (targetSpawn.room.energyCapacityAvailable <= 1200)
        {
            desiredParts = [MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK];
            energyAvailable -= 600;
        }

        const maxCarryParts = 20;
        const carryParts = Math.min(Math.floor(energyAvailable / BODYPART_COST[CARRY]), maxCarryParts);
        for(let i = 0; i < carryParts; ++i) desiredParts.push(CARRY);


        logicSpawn.willToSpawn = true;
        util.spawn(targetSpawn,
                   desiredParts,
                   builderName + Game.time,
                   {role: 'builder', room: targetSpawn.room.name},
                   builderName);
    },

    spawn_emergency_static_harvester: function(targetSpawn)
    {
        if (logicSpawn.amountStaticHarvester > 0)
            return;

        let targetSource = 0;

        // If we have containers, focus on harvesting and repairing the best one.
        if (logicSpawn.listContainers.length > 0)
        {
            let bestContainer = util.maxRes(logicSpawn.listContainers);
            for(let i = 0, l = targetSpawn.room.memory.sources.length; i < l; ++i)
            {
                if (targetSpawn.room.memory.sources[i].id == bestContainer.id)
                {
                    targetSource = i;
                    break;
                }
            }
        }

        const staticHarvesterName   = 'EmergencySH' + Game.time;  // TODO: Move this to a global constant (?)
        let   staticHarvesterParts  = [MOVE,WORK,WORK,CARRY]; // Cost: 300

        logicSpawn.willToSpawn = true;
        const spawnResult = util.spawn(targetSpawn,
                                       staticHarvesterParts,
                                       staticHarvesterName,
                                       {role: 'staticHarvester', source: targetSource, room: targetSpawn.room.name},
                                       staticHarvesterName,
                                       -1);


        if (spawnResult == OK)
        {
            targetSpawn.room.memory.sources[targetSource].harvester = staticHarvesterName;
        }
    },

    spawn_emergency_builder: function(targetSpawn)
    {
        if (logicSpawn.amountBuilder >= this.MAX_PER_ROOM_BUILDERS)
            return;

        if (logicSpawn.listContainers.length >= targetSpawn.room.memory.sources.length)
            return;

        // If we're here, we have zero containers. We might as well create the first one:
        if (targetSpawn.room.memory.sources && targetSpawn.room.memory.sources[0])
        {
            const targetPos = new RoomPosition(targetSpawn.room.memory.sources[0].x,
                                               targetSpawn.room.memory.sources[0].y,
                                               targetSpawn.room.name);

            let cs = targetPos.lookFor(LOOK_CONSTRUCTION_SITES);
            if (!cs.length)
                targetSpawn.room.createConstructionSite(targetPos, STRUCTURE_CONTAINER);
        }

        const builderName    = 'EmergencyBuilder';
        let   builderParts   = [MOVE,WORK,CARRY]; // Cost: 200

        logicSpawn.willToSpawn = true;
        util.spawn(targetSpawn,
                   builderParts,
                   builderName + Game.time,
                   {role: 'builder', room: targetSpawn.room.name},
                   builderName);

    },

    spawn_emergency_hauler: function(targetSpawn)
    {
        if (logicSpawn.amountHauler > 0)
            return;

        if (logicSpawn.listContainers.length === 0)
            return;

        let bestContainer = util.maxRes(logicSpawn.listContainers);
        let targetSource  = 0; // HACK: This is set to -1 so we're able to track any issues in an easier fashion
        for(let i = 0, l = targetSpawn.room.memory.sources.length; i < l; ++i)
        {

            if (targetSpawn.room.memory.sources[i].id == bestContainer.id)
            {
                targetSource = i;
                break;
            }
        }

        const haulerName   = 'EmergencyHauler';  // TODO: Move this to a global constant (?)
        let   haulerParts  = [MOVE,CARRY,CARRY,CARRY]; // Cost: 200

        logicSpawn.willToSpawn = true;
        const spawnResult = util.spawn(targetSpawn,
                                       haulerParts,
                                       haulerName + Game.time,
                                       {role: 'hauler', source: targetSource, room: targetSpawn.room.name},
                                       haulerName,
                                       -1);

        if (spawnResult == OK)
        {
            ++targetSpawn.room.memory.sources[targetSource].haulers;
        }
    },
};

module.exports = logicSpawn;