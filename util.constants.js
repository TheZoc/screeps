//////////////////////////////////////////////////////////////////////////////
// Util.Constants
// This file defines the common constants used through the code.
//
// Due to a lack of a better place to add configuration variables, I added
// them here too, for now.
//////////////////////////////////////////////////////////////////////////////

const constants = {
    // Base configuration - TODO: Move this to a better place
    MAX_TRANSPORTERS_PER_SOURCE : 2,
    MAX_UPGRADERS_PER_ROOM : 2,
    MAX_BUILDERS_PER_ROOM : 2,

    // Creep Roles
    ROLE_BUILDER          : 'B',
    ROLE_PROSPECTOR       : 'P',
    ROLE_REMOTE_HARVESTER : 'R', // Previously Neighbour Miner
    ROLE_SCOUT            : 'S', // Need to be rebuilt from scratch
    ROLE_STATIC_HARVESTER : 'H',
    ROLE_TRANSPORTER      : 'T', // Previously Hauler
    ROLE_UPGRADER         : 'U',

    // Combat Roles
    ROLE_ATTACKER         : 'A',
    ROLE_MEDIC            : 'M',

    // Priority
    PRIORITY_EMERGENCY  : 10,
    PRIORITY_IMMEDIATE  : 30,
    PRIORITY_VERY_HIGH  : 70,
    PRIORITY_HIGH       : 100,
    PRIORITY_NORMAL     : 200,
    PRIORITY_LOW        : 300,
}

module.exports = constants;