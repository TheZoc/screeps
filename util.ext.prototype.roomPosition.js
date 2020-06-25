//////////////////////////////////////////////////////////////////////////////
// Extension functions added to RoomPosition prototype
//////////////////////////////////////////////////////////////////////////////

/**
 * Directional lookup table
 * @example: const [dx,dy] = DIR_TABLE[dir];
 */
global.DIR_TABLE = {
    [TOP]          : [0, -1],
    [TOP_RIGHT]    : [1, -1],
    [RIGHT]        : [1, 0],
    [BOTTOM_RIGHT] : [1, 1],
    [BOTTOM]       : [0, 1],
    [BOTTOM_LEFT]  : [-1, 1],
    [LEFT]         : [-1, 0],
    [TOP_LEFT]     : [-1, -1]
};

global.DIAGONALS   = [TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT, TOP_LEFT];
global.HORIZONTALS = [TOP, BOTTOM, LEFT, RIGHT];

/**
 * Given a room position and a direction defined in the DIR_TABLE, returns a new RoomPosition with the added direction
 *
 * @param {RoomPosition} direction - One of the directions defined in the DIR_TABLE
 *
 * @return {RoomPosition}
 *
 */
RoomPosition.prototype.addDirection = function (direction) {
    const [dx, dy] = DIR_TABLE[direction];
    const { x, y, roomName } = this;
    return new RoomPosition(x + dx, y + dy, roomName);
};

// Example:
// const positions = _.map(HORIZONTALS, (d) => CustomUserList.addDirection(d));