/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('util');
 * mod.thing == 'a thing'; // true
 */

function maxRes(c, res = RESOURCE_ENERGY) { // You can refactor this part
    if(!c || !c.length) // Safety check to prevent Infinity
        return null;
    return _.max(c, c => c.store[res] || 0);
}

function minRes(c, res = RESOURCE_ENERGY) { // You can refactor this part
    if(!c || !c.length) // Safety check to prevent Infinity
        return null;
    return _.min(c, c => c.store[res] || 0);
}


/**
 * Display message and spawn unit if requirements are met
 *
 * @param {StructureSpawn} targetSpawn  - The spawn structure where the creep will be spawned
 * @param {array<string>} bodyParts     - An array describing the new creep’s body
 * @param {string} name                 - The name of the creep
 * @param {dict} [memory]               - (Optional) The dict with the data to be inserted into the creep's memory
 * @param {string} [prettyName]         - (Optional) Pretty creep name to be displayed. Name will be used if this is missing.
 * @param {int} [offsetY]               - (Optional) Offset for Y coordinate, for message position
 */
function spawn(targetSpawn, bodyParts, name, memory, prettyName, offsetY)
{
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

    if (canSpawn != OK)
        return canSpawn;

    return targetSpawn.spawnCreep(bodyParts,
                                  name,
                                  {memory: memory});
}

module.exports = {
    maxRes,
    minRes,
    spawn,
};