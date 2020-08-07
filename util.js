//////////////////////////////////////////////////////////////////////////////
// Utility functions that used through the code
//////////////////////////////////////////////////////////////////////////////

const constants         = require('util.constants');

/**
 * A function that, given an array of structures, returns the one with the most energy stored
 *
 * @param {array<Structure>>} structures - An array of structures to be tested
 * @param {string}            resource   - The type of resource to check, one of the RESOURCE_* constants. If omitted, defaults to RESOURCE_ENERGY
 *
 * @returns {null|*} - Returns the structure with most resources, or null if the function wasn't able to find a valid structure.
 */
function maxRes(structures, resource = RESOURCE_ENERGY)
{
    if(!structures || !structures.length) // Safety check to prevent Infinity
        return null;
    return _.max(structures, s => s.store[resource] || 0);
}

/**
 * A function that, given an array of structures, returns the one with the least energy stored
 *
 * @param {array<Structure>>} structures - An array of structures to be tested
 * @param {string}            resource   - The type of resource to check, one of the RESOURCE_* constants. If omitted, defaults to RESOURCE_ENERGY
 *
 * @returns {null|*} - Returns the structure with less resources, or null if the function wasn't able to find a valid structure.
 */
function minRes(structures, resource = RESOURCE_ENERGY) { // You can refactor this part
    if(!structures || !structures.length) // Safety check to prevent Infinity
        return null;
    return _.min(structures, s => s.store[resource] || 0);
}

/**
 * Display message and spawn unit if requirements are met
 *
 * @deprecated since version 1.1. Use creepSpawn() instead. Will be deleted soon(tm).
 * For now, this method will remain as a way to spawn creeps manually.
 *
 * @param {StructureSpawn} targetSpawn  - The spawn structure where the creep will be spawned
 * @param {array<string>} bodyParts     - An array describing the new creep’s body
 * @param {string} name                 - The name of the creep
 * @param {dict} [memory]               - (Optional) The dict with the data to be inserted into the creep's memory
 * @param {string} [prettyName]         - (Optional) Pretty creep name to be displayed. Name will be used if this is missing.
 * @param {int} [offsetY]               - (Optional) Offset for Y coordinate, for message position
 *
 * @return {OK|number|ERR_NOT_OWNER|ERR_NAME_EXISTS|ERR_BUSY|ERR_NOT_ENOUGH_ENERGY|ERR_INVALID_ARGS|ERR_RCL_NOT_ENOUGH}
 */
function spawn(targetSpawn, bodyParts, name, memory, prettyName, offsetY)
{
    console.log("<span style=\"color: red;\">Calling deprecated method <b>util.spawn</b></span>");

    memory = memory || {};
    prettyName = prettyName || name;
    offsetY = offsetY || 0;

    targetSpawn.room.visual.text('🚦 Willing to spawn ' + prettyName,
                                 targetSpawn.pos.x + 1,
                                 targetSpawn.pos.y - 0.5 + offsetY + numMsg++, // numMSg must be set to 0 at the start of the main loop
                                 {align: 'left', opacity: 0.8});

    const canSpawn = targetSpawn.spawnCreep(bodyParts,
                                            name,
                                            {memory: memory, dryRun: true});

    if (canSpawn !== OK)
        return canSpawn;

    return targetSpawn.spawnCreep(bodyParts,
                                  name,
                                  {memory: memory});
}

/**
 * Display message and spawn creep if resource requirements are met
 *
 * @param targetSpawn {StructureSpawn} The spawn structure where the creep will be spawned
 * @param spawnData {Object} The spawn data structure that contains all the information about
 *                           the creep. At minimum, it needs an Array of Body Parts, a name
 *                           and a memory object.
 *
 * @return {OK|number|ERR_NOT_OWNER|ERR_NAME_EXISTS|ERR_BUSY|ERR_NOT_ENOUGH_ENERGY|ERR_INVALID_ARGS|ERR_RCL_NOT_ENOUGH}
 */
function creepSpawn(targetSpawn, spawnData)
{
    targetSpawn.room.visual.text('🚦 Willing to spawn ' + spawnData.name,
        targetSpawn.pos.x + 1,
        targetSpawn.pos.y - 0.5, // numMSg must be set to 0 at the start of the main loop
        {align: 'left', opacity: 0.8});

    const canSpawn = targetSpawn.spawnCreep(spawnData.bodyParts,
                                            spawnData.name,
                                            {memory: spawnData.memory, dryRun: true});

    if (canSpawn !== OK)
        return canSpawn;

    return targetSpawn.spawnCreep(spawnData.bodyParts,
                                  spawnData.name,
                                  {memory: spawnData.memory});
}

/**
 * Given an Array of body parts, returns the total resource cost for it.
 *
 * @param bodyParts {Array} Array of body parts of a creep
 * @return {number} Total cost
 */
function calculateBodyPartsCost(bodyParts)
{
    let totalCost = 0;
    for (let i = 0; i < bodyParts.length; ++i)
    {
        totalCost += BODYPART_COST[bodyParts[i]];
    }
    return totalCost;
}

/**
 * Returns the necessary number of upgraders for a given room
 * @param {Room} room - Target room
 */
function numUpgradersForRoom(room)
{
    if (room.controller.level < 6)
        return constants.MAX_UPGRADERS_PER_ROOM_BELOW_CL_6;
    else if (room.controller.level < 8)
        return constants.MAX_UPGRADERS_PER_ROOM_BELOW_CL_8;
    else
        return constants.MAX_UPGRADERS_PER_ROOM_CL_8;
}

module.exports = {
    maxRes,
    minRes,
    spawn,
    creepSpawn,
    calculateBodyPartsCost,
    numUpgradersForRoom,
};