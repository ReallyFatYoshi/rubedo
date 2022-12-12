import { world } from "@minecraft/server";
import { text } from "../../../../lang/text";
import { TABLES } from "../../../../lib/Database/tables";
import { DIMENSIONS } from "../../../../utils.js";
import { getRoleSync, isLockedDown, kick, setRole } from "../../utils";
import { Mute } from "../models/Mute";
import { ChangePlayerRoleTask } from "../models/Task";

world.events.playerJoin.subscribe(async ({ player }) => {
  if (isLockedDown() && (await getRoleSync(player)) != "admin")
    return kick(player, text["lockdown.kick.message"]());
  let e = world.events.tick.subscribe(async (data) => {
    try {
      await DIMENSIONS.overworld.runCommandAsync(
        `testfor @a[name="${player.name}"]`
      );
      world.events.tick.unsubscribe(e);
      if (Mute.getMuteData(player))
        player.runCommandAsync(`ability @s mute true`);
      if (!TABLES.ids.has(player.name)) {
        // Player is new!
        TABLES.ids.set(player.name, player.id);
      } else {
        player.addTag("old");
      }
      /**
       * This is a role that was tried to push when the player was offline
       * so were setting it now because the player just joined
       */
      const roleToSet = ChangePlayerRoleTask.getPlayersRoleToSet(player.name);
      if (roleToSet) setRole(player, roleToSet);
    } catch (error) {}
  });
});
