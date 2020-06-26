//////////////////////////////////////////////////////////////////////////////
// Link logic
//////////////////////////////////////////////////////////////////////////////

var logicLink =
    {
        /**
         * Runs the logic for the links in a given room.
         * The idea is to always transfer to the link that is close to the storage.
         * The minimum transferred amount is the hauler capacity (Currently 250
         * energy) + 3% that is lost with the transfer.
         *
         * @param {Room} room - Target room to process all the links inside
         */
        run: function(room)
        {
            let links = (room.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_LINK }}));
            if(links.length === 0)
                return;

            for(let i = 0, l = links.length; i < l; ++i)
            {
                if (room.memory.links === undefined)
                    room.memory.links = {}

                // Check if we have a storage link (i.e. destination link)
                if (room.memory.links.storageLink === undefined)
                {
                    if (links[i].pos.inRangeTo(room.storage, 1))
                    {
                        room.memory.links.storageLink   = links[i].id;
                        room.memory.links.storageEnergy = links[i].store.getUsedCapacity(RESOURCE_ENERGY);
                    }
                    else
                    {
                        continue;
                    }
                }

                // Storage link, for now, doesn't do anything.
                if (room.memory.links.storageLink === links[i].id)
                    continue;

                // If there's space for at least 250 energy, do the transfer.
                const haulerCapacity = 250;
                const minimumTransfer = haulerCapacity * 1.03; // 3% is lost in the transfer
                const storageLink = Game.getObjectById(room.memory.links.storageLink);
                const currentLink = links[i];
                const availableStorage = storageLink.store.getFreeCapacity(RESOURCE_ENERGY);
                const currentEnergy = currentLink.store.getUsedCapacity(RESOURCE_ENERGY);
                if (currentEnergy > minimumTransfer && availableStorage > haulerCapacity && !currentLink.cooldown)
                {
                    const initialEnergy = storageLink.store.getUsedCapacity(RESOURCE_ENERGY);

                    // Transfer our energy to the storage link.
                    let transferResult = links[i].transferEnergy(storageLink);

                    if (transferResult === OK)
                    {
                        const deltaEnergy = storageLink.store.getUsedCapacity(RESOURCE_ENERGY) - initialEnergy;

                        // This is used to multiple creeps from trying to get more energy than it's available.
                        // Check hauler logic ;)
                        room.memory.links.storageEnergy += deltaEnergy;
                    }
                }
            }
        },
    };

module.exports = logicLink;