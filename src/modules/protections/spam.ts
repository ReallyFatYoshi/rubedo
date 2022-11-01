import { world } from "@minecraft/server";
import { PREFIX } from "../../config/commands";
import { TABLES } from "../../lib/Database/tables";
import { getRole } from "../../utils";
import { Mute } from "../models/Mute";
import { PlayerLog } from "../models/PlayerLog";

const previousMessage = new PlayerLog<string>();

/**
 * Stores per world load violation data for players
 */
const ViolationCount = new PlayerLog<number>();

world.events.beforeChat.subscribe((data) => {
  if (data.message.startsWith(PREFIX)) return;
  if (["admin", "moderator"].includes(getRole(data.sender))) return;
  const spam_config = TABLES.config.get("spam_config") ?? {
    repeatedMessages: true,
    zalgo: true,
    violationCount: 0,
    permMutePlayer: false,
  };
  const isSpam = () => {
    const count = (ViolationCount.get(data.sender) ?? 0) + 1;
    ViolationCount.set(data.sender, count);
    if (spam_config.permMutePlayer && count >= spam_config.violationCount)
      new Mute(data.sender, null, null, "Reached Violation count");
  };
  if (
    spam_config.repeatedMessages &&
    previousMessage.get(data.sender) == data.message
  ) {
    data.cancel = true;
    isSpam();
    return data.sender.tell(`§cRepeated message detected!`);
  }
  if (spam_config.zalgo && /%CC%/g.test(encodeURIComponent(data.message))) {
    data.cancel = true;
    isSpam();
    return data.sender.tell(
      `§cYou message contains some type of zalgo and cannot be sent!`
    );
  }
  previousMessage.set(data.sender, data.message);
});