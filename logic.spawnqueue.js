//////////////////////////////////////////////////////////////////////////////
// Spawn queue
//
// This file creates a per-room spawn queue for creeps, with priorities.
// This should only be run every few ticks, to ensure it's lightweight.
//////////////////////////////////////////////////////////////////////////////

global.FlatQueue        = require('datastructure.priorityqueue');
const constants         = require('util.constants');

let logicSpawnQueue = {
    /**
     * Process all the rules for a room and create a spawn queue
     *
     * @param room {Room}
     */
    run: function(room)
    {
        // Only run this function if enough time has passed since the last update (10 ticks).
        if (Game.time < room.memory.nextUpdate.spawnQueue)
            return;
        room.memory.nextUpdate.spawnQueue = Game.time + 10;

        const spawns = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN } });
        if (spawns < 1)
            return;

        Memory.rooms[room.name].spawnQueue = {};
        this.spawnQueue = new FlatQueue(Memory.rooms[room.name].spawnQueue);

        // This is needed multiple times, so I'm caching it here.
        this.listContainers = room.find(FIND_STRUCTURES, {
            filter: (structure) => { return structure.structureType === STRUCTURE_CONTAINER; }
        });

        this.check_static_harvester(room);
        this.check_transporter(room);
        this.check_upgrader(room);
        this.check_builder(room);
        this.check_prospector(room);
        this.check_scout(room);
    },

    /**
     *
     * @param room {Room}
     */
    check_static_harvester: function (room)
    {
        // Calculate the best available body for the static harvester

        // For the static harvester, 5 parts are enough to drain the source completely, before it respawns.
        // Attempting to use max 10 parts, to have more resources available sooner.
        const maxWorkParts = 10;

        // Assemble the creep blueprint
        // Minimum parts: [MOVE, CARRY, WORK]
        const energyAvailable = room.energyCapacityAvailable - 100;  // Remove the mandatory move and carry parts
        const desiredWorkParts = Math.min(Math.floor(energyAvailable / BODYPART_COST[WORK]), maxWorkParts);
        let staticHarvesterParts = [MOVE]; // 50 energy
        for (let i = 0; i < desiredWorkParts; ++i)
            staticHarvesterParts.push(WORK); // 100 per part
        staticHarvesterParts.push(CARRY); // 50 energy

        const sourcesInTheRoom = room.memory.sources.length;
        let neededHarvesters = 0;
        // Search for available sources, without a static harvester creep assigned
        for (let i = 0; i < sourcesInTheRoom; ++i)
        {
            if (room.memory.sources[i].harvester)
            {
                // First, try to get the harvester by id
                if (!Game.getObjectById(room.memory.sources[i].harvester))
                {
                    // If it failed, try to get the harvester using it's name. That will happen in the first time this runs (We can't store the id until the creep is spawned)
                    const creep = Game.creeps[room.memory.sources[i].harvester];
                    if (creep)
                    {
                        // Did we get it? Save it as id for future checks
                        if (typeof creep.id !== 'undefined') // This prevents multiple spawns from setting the variable to undefined ;)
                        {
//                          console.log('Check if null for sources [' + i + '] ' + creep.id);
                            room.memory.sources[i].harvester = creep.id;
                        }
                    } else
                    {
                        // POWER_CREEP_LIFE_TIME = 5000, CREEP_LIFE_TIME = 1500, Least common multiple = 15000
                        const newStaticHarvesterName = constants.ROLE_STATIC_HARVESTER + (Game.time % 15000).toString(36);
                        const newCreep = {
                            bodyParts: staticHarvesterParts,
                            name: newStaticHarvesterName, // Maybe move this to the actual spawning function?
                            memory: {
                                role: constants.ROLE_STATIC_HARVESTER,
                                source: i,
                                room: room.name
                            }
                        }

                        this.spawnQueue.push(constants.PRIORITY_HIGH, newCreep);
                        ++neededHarvesters;
                    }
                }
            }
        }

        // This might need to be adjusted if creating a Spawn in a room with a single source.
        if (neededHarvesters === sourcesInTheRoom)
        {
            let totalCost = 0;
            for (let i = 0; i <  staticHarvesterParts.length; ++i)
            {
                totalCost += BODYPART_COST[staticHarvesterParts[i]];
            }

            // If we have NO harvesters and not enough to spawn an upgraded harvester,
            // queue up an "emergency" harvester with just the basic parts
            if (totalCost > room.energyAvailable)
            {
                // If we have containers, focus on harvesting and repairing the best one.
                let targetSource = 0;
                if (this.listContainers.length > 0)
                {
                    let bestContainer = util.maxRes(this.listContainers);
                    for(let i = 0, l = room.memory.sources.length; i < l; ++i)
                    {
                        if (room.memory.sources[i].id === bestContainer.id)
                        {
                            targetSource = i;
                            break;
                        }
                    }
                }

                const newStaticHarvesterName = "ÊĤ" + (Game.time % 15000).toString(36);
                const newCreep = {
                    bodyParts: [MOVE,WORK,WORK,CARRY],
                    name: newStaticHarvesterName,
                    memory: {
                        role: constants.ROLE_STATIC_HARVESTER,
                        source: targetSource,
                        room: room.name
                    }
                }
                this.spawnQueue.push(constants.PRIORITY_VERY_HIGH - 1, newCreep);
            }
        }
    },

    /**
     *
     * @param room {Room}
     */
    check_transporter: function(room)
    {
        // Only spawn transporters if we have containers!
        if (this.listContainers.length === 0)
            return;

        // Limit the amount of [CARRY, CARRY, MOVE] added per transporter
        let maxPartsSet = 4;

        // Assemble the creep blueprint
        // Minimum parts: [CARRY, CARRY, MOVE]
        const energyAvailable = room.energyCapacityAvailable - 150;  // Remove the mandatory MOVE and 2*CARRY parts
        let transporterParts = [CARRY, CARRY, MOVE]; // 100 energy

        const setCost = BODYPART_COST[CARRY] * 2 + BODYPART_COST[MOVE]
        const desiredTransporterPartsSet = Math.min(Math.floor(energyAvailable / setCost), maxPartsSet);

        // Each MOVE part can carry +1 other part in plains, or +2 other parts in roads.
        for (let i = 0; i < desiredTransporterPartsSet; ++i)
        {
            transporterParts.push(CARRY); // 50 per part
            transporterParts.push(CARRY); // 50 per part
            transporterParts.push(MOVE); // 50 per part
        }
        // console.log(transporterParts);

        for(let i = 0, l = room.memory.sources.length; i < l; ++i)
        {
            if (room.memory.sources[i].haulers >= constants.MAX_TRANSPORTERS_PER_SOURCE)
                continue;

            const newTransporterName = constants.ROLE_TRANSPORTER + (Game.time % 15000).toString(36);
            const newCreep = {
                bodyParts: transporterParts,
                name: newTransporterName,
                memory: {
                    role: constants.ROLE_TRANSPORTER,
                    source: i,
                    room: room.name
                }
            }

            this.spawnQueue.push(constants.PRIORITY_NORMAL, newCreep);

        }

        const amountTransporters = _.filter(Game.creeps, (creep) => (creep.memory.role === 'hauler' || creep.memory.role === constants.ROLE_TRANSPORTER) && (creep.memory.room === room.name)).length;
        if (amountTransporters === 0)
        {
            const totalCost = util.calculateBodyPartsCost(transporterParts);

            // If we have NO transporters and not enough to spawn an upgraded transporter,
            // queue up an "emergency" transporter with just the basic parts
            if (totalCost > room.energyAvailable)
            {
                let bestContainer = util.maxRes(this.listContainers);
                let targetSource  = 0;
                for(let i = 0, l = room.memory.sources.length; i < l; ++i)
                {
                    if (room.memory.sources[i].id === bestContainer.id)
                    {
                        targetSource = i;
                        break;
                    }
                }

                const newEmergencyTransporterName = "ÊṪ" + (Game.time % 15000).toString(36);
                const newCreep = {
                    bodyParts: [MOVE,MOVE,CARRY,CARRY],
                    name: newEmergencyTransporterName,
                    memory: {
                        role: constants.ROLE_TRANSPORTER,
                        source: targetSource,
                        room: room.name
                    }
                }
                this.spawnQueue.push(constants.PRIORITY_VERY_HIGH, newCreep);
            }
        }
    },

    /**
     *
     * @param room {Room}
     */
    check_upgrader: function(room)
    {
        const amountUpgrader = _.filter(Game.creeps, (creep) => (creep.memory.role === 'upgrader' || creep.memory.role === constants.ROLE_UPGRADER) && (creep.memory.room === room.name)).length;
        if (amountUpgrader >= constants.MAX_UPGRADERS_PER_ROOM)
            return;

        // Limit the amount of par sets added per upgrader
        let maxPartsSet = 4;

        let desiredParts = [MOVE, MOVE, WORK, CARRY, CARRY]; // 300 energy
        let energyAvailable = room.energyCapacityAvailable - 300;

        let addExtraWorkPart = false;
        let addedSets = 0;
        while (energyAvailable > 150 && addedSets <= maxPartsSet)
        {
            energyAvailable -= 150;
            desiredParts.push(MOVE);
            desiredParts.push(CARRY);
            desiredParts.push(CARRY);

            if (energyAvailable > 100)
            {
                if (addExtraWorkPart)
                {
                    addExtraWorkPart = false;
                    energyAvailable -= 100;
                    desiredParts.push(WORK);
                }
                else
                {
                    addExtraWorkPart = true; // Add extra work part on next loop
                }
            }
            addedSets += 1;
        }

        const newUpgraderName = constants.ROLE_UPGRADER + (Game.time % 15000).toString(36);
        const newCreep = {
            bodyParts: desiredParts,
            name: newUpgraderName,
            memory: {
                role: constants.ROLE_UPGRADER,
                room: room.name
            }
        }

        this.spawnQueue.push(constants.PRIORITY_NORMAL, newCreep);
    },

    /**
     *
     * @param room {Room}
     */
    check_builder: function(room)
    {
        const amountBuilder = _.filter(Game.creeps, (creep) => (creep.memory.role === 'builder' || creep.memory.role === constants.ROLE_BUILDER) && (creep.memory.room === room.name)).length;

        if (amountBuilder >= constants.MAX_BUILDERS_PER_ROOM)
            return;

        let energyAvailable = room.energyCapacityAvailable;
        let desiredParts;
        let priority = constants.PRIORITY_NORMAL;

        let newBuilderName;
        if(amountBuilder === 0 && room.energyAvailable < 300)
        {
            desiredParts = [MOVE, WORK, CARRY];
            priority = constants.PRIORITY_VERY_HIGH - 2;
            newBuilderName = "ÊḂ" + (Game.time % 15000).toString(36);
        }
        else
        {
            // Each MOVE part can carry 2 other parts through a road.
            let maxCarryParts = 0;
            newBuilderName = constants.ROLE_BUILDER + (Game.time % 15000).toString(36);
            if (energyAvailable <= 350)
            {
                desiredParts = [MOVE, MOVE, WORK, CARRY, CARRY];
                energyAvailable -= 300;
                maxCarryParts = 1;
            }
            else if (energyAvailable <= 600)
            {
                desiredParts = [MOVE,MOVE,MOVE,WORK,WORK];
                energyAvailable -= 350;
                maxCarryParts = 4;
            }
            else if (energyAvailable <= 850)
            {
                desiredParts = [MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK];
                energyAvailable -= 500;
                maxCarryParts = 5;
            }
            else if (energyAvailable <= 1100)
            {
                desiredParts = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK];
                energyAvailable -= 700;
                maxCarryParts = 8;
            }
            else // if (energyAvailable > 1200)
            {
                desiredParts = [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK];
                energyAvailable -= 900;
                maxCarryParts = 11;
            }
            const carryParts = Math.min(Math.floor(energyAvailable / BODYPART_COST[CARRY]), maxCarryParts);
            for(let i = 0; i < carryParts; ++i)
                desiredParts.push(CARRY);
        }

        const newCreep = {
            bodyParts: desiredParts,
            name: newBuilderName,
            memory: {
                role: constants.ROLE_BUILDER,
                room: room.name
            }
        }
        this.spawnQueue.push(priority, newCreep);
    },

    /**
     *
     * @param {Room} room
     */
    check_prospector: function(room)
    {
        if (room.controller.level < 6)
            return;

        const amountProspectors = _.filter(Game.creeps, (creep) => (creep.memory.role === constants.ROLE_PROSPECTOR) &&
                                                                   (creep.memory.room === room.name)).length;

        if (amountProspectors >= constants.MAX_PROSPECTORS_PER_ROOM)
            return;

        // TODO: Optimize this body
        let desiredParts = [];
        for (let i = 0; i < 8; ++i) desiredParts.push(WORK);
        for (let i = 0; i < 9; ++i) desiredParts.push(MOVE);
        for (let i = 0; i < 10; ++i)  desiredParts.push(CARRY);

        const newCreepName = constants.ROLE_PROSPECTOR + (Game.time % 15000).toString(36);
        const newCreep = {
            bodyParts: desiredParts,
            name: newCreepName,
            memory: {
                role: constants.ROLE_PROSPECTOR,
                room: room.name,        // "Owner" room
            }
        }

        this.spawnQueue.push(constants.PRIORITY_LOW, newCreep);
    },

    /**
     *
     * @param room {Room}
     */
    check_scout: function(room)
    {
        // Disabled for now.
        return;


        // Try to know the rooms around us, so we can plan for expansion and remote mining
        const scout = Game.getObjectById(room.memory.scouting.scoutId);
        if (scout !== null)
            return;

        const desiredParts = [TOUGH, MOVE, MOVE, HEAL];
        const priority = constants.PRIORITY_LOW;
        const newScoutName = constants.ROLE_SCOUT + (Game.time % 15000).toString(36);

        const newCreep = {
            bodyParts: desiredParts,
            name: newScoutName,
            memory: {
                role: constants.ROLE_SCOUT,
                room: room.name,        // "Owner" room
                targetRoom: room.name,  // Target room
                currentRoom: room.name, // Current room
            }
        }

        this.spawnQueue.push(priority, newCreep);
    },

    /**
     * Super hackish version to spawn an attack duo unit
     *
     * @param {Room} room
     */
    spawn_attack_duo: function(room)
    {
        if (Game.flags.spawnduo === undefined)
            return;

        let attackerDesiredParts = [];
        for (let i = 0; i < 10; ++i) attackerDesiredParts.push(TOUGH);
        for (let i = 0; i < 10; ++i) attackerDesiredParts.push(MOVE);
        for (let i = 0; i < 5; ++i)  attackerDesiredParts.push(RANGED_ATTACK);

        const priority = constants.PRIORITY_NORMAL;
        const newAttackerName = constants.ROLE_ATTACKER + (Game.time % 15000).toString(36);

        const newAttackerCreep = {
            bodyParts: attackerDesiredParts,
            name: newAttackerName,
            memory: {
                role: constants.ROLE_ATTACKER,
                room: room.name,        // "Owner" room
                healer: null
            }
        }
        this.spawnQueue.push(priority, newAttackerCreep);
    },

    spawn_medic_for_attack_duo(room)
    {
        const lonelyDuoAttackersAmount = _.filter(Game.creeps,
                                                 (creep) =>
                                                     (creep.memory.role === constants.ROLE_ATTACKER) &&
                                                     (creep.memory.healer === null)).length;

        if (lonelyDuoAttackersAmount === 0)
            return;

        const priority = constants.PRIORITY_HIGH; // If the attacker is waiting, lets not waste ticks!

        let medicDesiredParts = [];
        for (let i = 0; i < 10; ++i) medicDesiredParts.push(TOUGH);
        for (let i = 0; i < 8; ++i)  medicDesiredParts.push(MOVE);
        for (let i = 0; i < 4; ++i)  medicDesiredParts.push(HEAL);

        const newMedicName = constants.ROLE_MEDIC + (Game.time % 15000).toString(36);
        const newMedicCreep = {
            bodyParts: medicDesiredParts,
            name: newMedicName,
            memory: {
                role: constants.ROLE_MEDIC,
                room: room.name,        // "Owner" room
                attacker: null
            }
        }
        this.spawnQueue.push(priority, newMedicCreep);
    }
};

module.exports = logicSpawnQueue;