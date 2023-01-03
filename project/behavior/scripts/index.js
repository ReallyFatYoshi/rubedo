// project/behavior/src/index.ts
import {
  ItemStack as ItemStack5,
  MinecraftItemTypes as MinecraftItemTypes7,
  system as system14
} from "@minecraft/server";

// project/behavior/src/lib/Command/index.ts
import { world as world4 } from "@minecraft/server";

// project/behavior/src/config/commands.ts
var PREFIX = "-";

// project/behavior/src/lib/Command/ArgumentTypes.ts
import { world as world3 } from "@minecraft/server";

// project/behavior/src/database/Database.ts
import { ItemStack, MinecraftItemTypes } from "@minecraft/server";

// project/behavior/src/config/database.ts
import { BlockLocation } from "@minecraft/server";
var MAX_DATABASE_STRING_SIZE = 32e3;
var ENTITY_IDENTIFIER = "rubedo:database";
var ENTITY_LOCATION = new BlockLocation(0, -64, 0);
var INVENTORY_SIZE = 128;

// project/behavior/src/lib/Events/EntitiesLoad.ts
import { system as system2, world as world2 } from "@minecraft/server";

// project/behavior/src/utils.ts
import {
  BlockLocation as BlockLocation2,
  MinecraftDimensionTypes,
  system,
  world
} from "@minecraft/server";

// project/behavior/src/lib/Form/Models/MessageForm.ts
import { MessageFormData } from "@minecraft/server-ui";

// project/behavior/src/config/form.ts
var TIMEOUT_THRESHOLD = 200;

// project/behavior/src/lib/Form/Models/MessageForm.ts
var MessageForm = class {
  constructor(title, body) {
    this.title = title;
    this.body = body;
    this.form = new MessageFormData();
    if (title)
      this.form.title(title);
    if (body)
      this.form.body(body);
    this.triedToShow = 0;
  }
  setButton1(text2, callback) {
    this.button1 = { text: text2, callback };
    this.form.button1(text2);
    return this;
  }
  setButton2(text2, callback) {
    this.button2 = { text: text2, callback };
    this.form.button2(text2);
    return this;
  }
  show(player) {
    this.form.show(player).then((response) => {
      if (response.canceled) {
        if (response.cancelationReason == "userBusy") {
          if (this.triedToShow > TIMEOUT_THRESHOLD)
            return player.tell(
              `\xA7cForm Timeout: tried to show form, but you were busy (close chat after running command)`
            );
          this.triedToShow++;
          this.show(player);
        }
        return;
      }
      if (response.selection == 1)
        this.button1?.callback?.();
      if (response.selection == 0)
        this.button2?.callback?.();
    });
  }
};

// project/behavior/src/utils.ts
var DIMENSIONS = {
  overworld: world.getDimension(MinecraftDimensionTypes.overworld),
  nether: world.getDimension(MinecraftDimensionTypes.nether),
  theEnd: world.getDimension(MinecraftDimensionTypes.theEnd),
  "minecraft:overworld": world.getDimension(MinecraftDimensionTypes.overworld),
  "minecraft:nether": world.getDimension(MinecraftDimensionTypes.nether),
  "minecraft:the_end": world.getDimension(MinecraftDimensionTypes.theEnd)
};
function durationToMs(duration) {
  const values = duration.split(",");
  console.warn(values.length);
  let ms = 0;
  for (const value of values) {
    const length = parseInt(value.match(/\D+|\d+/g)[0]);
    const unit = value.match(/\D+|\d+/g)[1];
    if (unit == "y")
      ms = ms + 317098e-16 * length;
    if (unit == "w")
      ms = ms + 6048e5 * length;
    if (unit == "d")
      ms = ms + 864e5 * length;
    if (unit == "h")
      ms = ms + 36e5 * length;
    if (unit == "m")
      ms = ms + 6e4 * length;
    if (unit == "s")
      ms = ms + 1e3 * length;
    if (unit == "ms")
      ms = ms + length;
  }
  return ms;
}
function msToTime(duration) {
  return new Date(duration).toString();
}
function vector3ToBlockLocation(loc) {
  return new BlockLocation2(
    Math.floor(loc.x),
    Math.floor(loc.y),
    Math.floor(loc.z)
  );
}
function confirmAction(player, action, onConfirm, onCancel = () => {
}) {
  new MessageForm("Confirm To Continue", action).setButton1("Confirm", onConfirm).setButton2("Never Mind", onCancel).show(player);
}
function sleep(tick) {
  return new Promise((resolve) => {
    let runScheduleId = system.runSchedule(() => {
      resolve();
      system.clearRunSchedule(runScheduleId);
    }, tick);
  });
}
function LocationEquals(a, b) {
  let aLocations = [a.x, a.y, a.z];
  let bLocations = [a.x, a.y, a.z];
  if (a instanceof BlockLocation2 || b instanceof BlockLocation2) {
    aLocations = aLocations.map((v) => Math.trunc(v));
    bLocations = bLocations.map((v) => Math.trunc(v));
  }
  return aLocations.find((v, i) => bLocations[i] != v) ? false : true;
}
function sort3DVectors(vector1, vector2) {
  const { x: x1, y: y1, z: z1 } = vector1;
  const { x: x2, y: y2, z: z2 } = vector2;
  const ox1 = x1 < x2 ? x1 : x2;
  const oy1 = y1 < y2 ? y1 : y2;
  const oz1 = z1 < z2 ? z1 : z2;
  const ox2 = x1 < x2 ? x2 : x1;
  const oy2 = y1 < y2 ? y2 : y1;
  const oz2 = z1 < z2 ? z2 : z1;
  return [
    { x: ox1, y: oy1, z: oz1 },
    { x: ox2, y: oy2, z: oz2 }
  ];
}
function betweenVector3(target, vector1, vector2) {
  const [{ x: x1, y: y1, z: z1 }, { x: x2, y: y2, z: z2 }] = sort3DVectors(
    vector1,
    vector2
  );
  let { x, y, z } = target;
  return x >= x1 && x <= x2 && y >= y1 && y <= y2 && z >= z1 && z <= z2;
}
function chunkString(str, length) {
  return str.match(new RegExp(".{1," + length + "}", "g"));
}

// project/behavior/src/lib/Events/EntitiesLoad.ts
var CALLBACKS = {};
var ENTITIES_LOADED = false;
system2.run(async () => {
  try {
    await DIMENSIONS.overworld.runCommandAsync(`testfor @a`);
    ENTITIES_LOADED = true;
    for (const [i, callback] of Object.entries(CALLBACKS)) {
      callback();
      delete CALLBACKS[i];
    }
  } catch (error) {
    let e2 = world2.events.entityCreate.subscribe((data) => {
      system2.run(() => {
        ENTITIES_LOADED = true;
        for (const [i, callback] of Object.entries(CALLBACKS)) {
          callback();
          delete CALLBACKS[i];
        }
        world2.events.entityCreate.unsubscribe(e2);
      });
    });
  }
});
var EntitiesLoad = class {
  static async awaitLoad() {
    if (ENTITIES_LOADED)
      return;
    return new Promise((resolve) => {
      EntitiesLoad.subscribe(resolve);
    });
  }
  static subscribe(callback) {
    if (ENTITIES_LOADED) {
      callback();
      return;
    }
    const key = Object.keys(CALLBACKS).length;
    CALLBACKS[key] = callback;
    return key;
  }
  static unsubscribe(key) {
    delete CALLBACKS[key];
  }
};

// project/behavior/src/database/Database.ts
var Database = class {
  constructor(tableName) {
    this.tableName = tableName;
    this.tableName = tableName;
    this.MEMORY = null;
    this.QUEUE = [];
    EntitiesLoad.subscribe(async () => {
      await this.initData();
      this.QUEUE.forEach((v) => v());
    });
  }
  static createTableEntity(tableName, index) {
    const entity = DIMENSIONS.overworld.spawnEntity(
      ENTITY_IDENTIFIER,
      ENTITY_LOCATION
    );
    entity.setDynamicProperty("tableName", tableName);
    entity.nameTag = `\xA7aDatabase Table: ${tableName}\xA7r`;
    if (index)
      entity.setDynamicProperty("index", index);
    return entity;
  }
  static getTableEntities(tableName) {
    return DIMENSIONS.overworld.getEntitiesAtBlockLocation(ENTITY_LOCATION).filter(
      (e2) => e2.typeId == ENTITY_IDENTIFIER && e2.getDynamicProperty("tableName") == tableName
    );
  }
  async addQueueTask() {
    return new Promise((resolve) => {
      this.QUEUE.push(resolve);
    });
  }
  async saveData() {
    if (!this.MEMORY)
      await this.addQueueTask();
    let entities = Database.getTableEntities(this.tableName);
    let chunks = chunkString(
      JSON.stringify(this.MEMORY),
      MAX_DATABASE_STRING_SIZE
    );
    const entitiesNeeded = Math.ceil(chunks.length / INVENTORY_SIZE) - entities.length;
    if (entitiesNeeded > 0) {
      for (let i = 0; i < entitiesNeeded; i++) {
        entities.push(Database.createTableEntity(this.tableName));
      }
    }
    for (const [i, entity] of entities.entries()) {
      const inventory = entity.getComponent("inventory").container;
      for (const [i2, chunk] of chunks.entries()) {
        if (!chunk)
          continue;
        if (i2 > inventory.size - 1)
          break;
        let item = new ItemStack(MinecraftItemTypes.acaciaBoat);
        item.nameTag = chunk;
        inventory.setItem(i2, item);
        chunks[i2] = null;
      }
      for (let i2 = chunks.length + 1; i2 < inventory.size; i2++) {
        inventory.setItem(i2, new ItemStack(MinecraftItemTypes.stick, 0));
      }
      entity.setDynamicProperty("index", i);
      entities[i] = null;
      if (!chunks.find((v) => v))
        break;
    }
    entities.filter((e2) => e2).forEach((e2) => e2.triggerEvent("despawn"));
    return;
  }
  async initData() {
    let entities = Database.getTableEntities(this.tableName).sort(
      (a, b) => a.getDynamicProperty("index") - b.getDynamicProperty("index")
    );
    let stringifiedData = "";
    for (const entity of entities) {
      const inventory = entity.getComponent("inventory").container;
      for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (!item)
          continue;
        stringifiedData = stringifiedData + item.nameTag;
      }
    }
    const data = stringifiedData == "" ? {} : JSON.parse(stringifiedData);
    this.MEMORY = data;
    return data;
  }
  async set(key, value) {
    this.MEMORY[key] = value;
    return this.saveData();
  }
  get(key) {
    if (!this.MEMORY)
      throw new Error(
        "Entities not loaded! Consider using `getAsync` instead!"
      );
    return this.MEMORY[key];
  }
  async getSync(key) {
    if (this.MEMORY)
      return this.get(key);
    await this.addQueueTask();
    return this.MEMORY[key];
  }
  keys() {
    if (!this.MEMORY)
      throw new Error(
        "Entities not loaded! Consider using `keysSync` instead!"
      );
    return Object.keys(this.MEMORY);
  }
  async keysSync() {
    if (this.MEMORY)
      return this.keys();
    await this.addQueueTask();
    return Object.keys(this.MEMORY);
  }
  values() {
    if (!this.MEMORY)
      throw new Error(
        "Entities not loaded! Consider using `valuesSync` instead!"
      );
    return Object.values(this.MEMORY);
  }
  async valuesSync() {
    if (this.MEMORY)
      return this.values();
    await this.addQueueTask();
    return Object.values(this.MEMORY);
  }
  has(key) {
    if (!this.MEMORY)
      throw new Error("Entities not loaded! Consider using `hasSync` instead!");
    return Object.keys(this.MEMORY).includes(key);
  }
  async hasSync(key) {
    if (this.MEMORY)
      return this.has(key);
    await this.addQueueTask();
    return Object.keys(this.MEMORY).includes(key);
  }
  collection() {
    if (!this.MEMORY)
      throw new Error(
        "Entities not loaded! Consider using `collectionSync` instead!"
      );
    return this.MEMORY;
  }
  async collectionSync() {
    if (this.MEMORY)
      return this.collection();
    await this.addQueueTask();
    return this.MEMORY;
  }
  async delete(key) {
    const status = delete this.MEMORY[key];
    await this.saveData();
    return status;
  }
  async clear() {
    this.MEMORY = {};
    return await this.saveData();
  }
};

// project/behavior/src/database/tables.ts
var TABLES = {
  config: new Database("config"),
  freezes: new Database("freezes"),
  mutes: new Database("mutes"),
  bans: new Database("bans"),
  regions: new Database("regions"),
  roles: new Database("roles"),
  tasks: new Database("tasks"),
  npcs: new Database("npcs"),
  ids: new Database("ids"),
  logs: new Database("logs"),
  protections: new Database("protections")
};

// project/behavior/src/lib/Command/ArgumentTypes.ts
function fetch(playerName) {
  return [...world3.getPlayers()].find((player) => player.name === playerName);
}
var LiteralArgumentType = class {
  constructor(name = "literal") {
    this.name = name;
    this.typeName = "literal";
    this.name = name;
  }
  matches(value) {
    return {
      success: this.name == value
    };
  }
  fail(value) {
    return `${value} should be ${this.name}!`;
  }
};
var StringArgumentType = class {
  constructor(name = "string") {
    this.name = name;
    this.typeName = "string";
    this.name = name;
  }
  matches(value) {
    return {
      success: value && value != "",
      value
    };
  }
  fail(value) {
    return `Value must be of type string!`;
  }
};
var IntegerArgumentType = class {
  constructor(name = "integer") {
    this.name = name;
    this.typeName = "int";
    this.name = name;
  }
  matches(value) {
    return {
      success: !isNaN(value),
      value: parseInt(value)
    };
  }
  fail(value) {
    return `Value must be valid number!`;
  }
};
var FloatArgumentType = class {
  constructor(name = "float") {
    this.name = name;
    this.typeName = "float";
    this.name = name;
  }
  matches(value) {
    return {
      success: Boolean(value?.match(/^\d+\.\d+$/)?.[0]),
      value: parseInt(value)
    };
  }
  fail(value) {
    return `Value must be valid float!`;
  }
};
var LocationArgumentType = class {
  constructor(name = "location") {
    this.name = name;
    this.typeName = "location";
    this.name = name;
  }
  matches(value) {
    return {
      success: /^([~^]{0,1}(-\d)?(\d*)?(\.(\d+))?)$/.test(value),
      value
    };
  }
  fail(value) {
    return `Value needs to be a valid number, value can include: [~,^]`;
  }
};
var BooleanArgumentType = class {
  constructor(name = "boolean") {
    this.name = name;
    this.typeName = "boolean";
    this.name = name;
  }
  matches(value) {
    return {
      success: Boolean(value?.match(/^(true|false)$/)?.[0]),
      value: value == "true" ? true : false
    };
  }
  fail(value) {
    return `"${value}" can be either "true" or "false"`;
  }
};
var PlayerArgumentType = class {
  constructor(name = "player") {
    this.name = name;
    this.typeName = "Player";
    this.name = name;
  }
  matches(value) {
    return {
      success: fetch(value) ? true : false,
      value: fetch(value)
    };
  }
  fail(value) {
    return `player: "${value}", is not in this world`;
  }
};
var TargetArgumentType = class {
  constructor(name = "target") {
    this.name = name;
    this.typeName = "Target";
    this.name = name;
  }
  matches(value) {
    return {
      success: Boolean(value?.match(/^(@.|"[\s\S]+")$/)?.[0]),
      value
    };
  }
  fail(value) {
    return `${value} is not a valid target`;
  }
};
var ArrayArgumentType = class {
  constructor(name = "array", types) {
    this.name = name;
    this.types = types;
    this.typeName = "string";
    this.name = name;
    this.types = types;
    this.typeName = types.join(" | ").replace(/(.{25})..+/, "$1...");
  }
  matches(value) {
    return {
      success: this.types.includes(value),
      value
    };
  }
  fail(value) {
    return `"${value}" must be one of these values: ${this.types.join(" | ")}`;
  }
};
var DurationArgumentType = class {
  constructor(name) {
    this.name = name;
    this.typeName = "Duration";
  }
  matches(value) {
    return {
      success: /^(\d+[hdysmw],?)+$/.test(value),
      value
    };
  }
  fail(value) {
    return `"${value}" must be a value like "10d" or "3s" the first part is the length second is unit`;
  }
};
var PlayerNameArgumentType = class {
  constructor(name = "playerName") {
    this.name = name;
    this.typeName = "playerName";
    this.name = name;
  }
  matches(value) {
    const player = TABLES.ids.get(value);
    return {
      success: player ? true : false,
      value
    };
  }
  fail(value) {
    return `player: "${value}" has never played this world before! Tip: if the name has spaces in it use quotes around name!`;
  }
};
var ArgumentTypes = {
  string: StringArgumentType,
  int: IntegerArgumentType,
  float: FloatArgumentType,
  location: LocationArgumentType,
  boolean: BooleanArgumentType,
  player: PlayerArgumentType,
  target: TargetArgumentType,
  array: ArrayArgumentType,
  duration: DurationArgumentType,
  playerName: PlayerNameArgumentType
};

// project/behavior/src/lib/Command/Callback.ts
var CommandCallback = class {
  constructor(data) {
    this.data = data;
    this.sender = data.sender;
  }
  reply(text2) {
    this.sender.tell(text2);
  }
};

// project/behavior/src/lib/Command/utils.ts
function getChatAugments(message, prefix) {
  try {
    return message.slice(prefix.length).trim().match(/"[^"]+"|[^\s]+/g).map((e2) => e2.replace(/"(.+)"/, "$1").toString());
  } catch (error) {
    return [];
  }
}
function commandNotFound(player, command2) {
  player.tell({
    rawtext: [
      {
        text: `\xA7c`
      },
      {
        translate: `commands.generic.unknown`,
        with: [`${command2}`]
      }
    ]
  });
}
function noPerm(player, command2) {
  player.tell({
    rawtext: [
      {
        text: command2.data.invalidPermission ? command2.data.invalidPermission : `\xA7cYou do not have permission to use "${command2.data.name}"`
      }
    ]
  });
}
function commandSyntaxFail(player, baseCommand, command2, args, i) {
  player.tell({
    rawtext: [
      {
        text: `\xA7c`
      },
      {
        translate: `commands.generic.syntax`,
        with: [
          `${PREFIX}${baseCommand.data.name} ${args.slice(0, i).join(" ")}`,
          args[i] ?? " ",
          args.slice(i + 1).join(" ")
        ]
      }
    ]
  });
  if (command2.children.length > 1 || !args[i]) {
    const types = command2.children.map(
      (c) => c.type instanceof LiteralArgumentType ? c.type.name : c.type?.typeName
    );
    player.tell(
      `\xA7c"${args[i] ?? "undefined"}" is not valid! Argument "${[...new Set(command2.children.map((c) => c.type.name))][0]}" can be typeof: "${types.join('", "')}"`
    );
  } else {
    player.tell(`\xA7c${command2.children[0]?.type?.fail(args[i])}`);
  }
}
function parseLocationArgs([x, y, z], { location, viewVector }) {
  if (!x || !y || !x)
    return null;
  const locations = [location.x, location.y, location.z];
  const viewVectors = [viewVector.x, viewVector.y, viewVector.z];
  const a = [x, y, z].map((arg) => {
    const r = parseFloat(arg);
    return isNaN(r) ? 0 : r;
  });
  const b = [x, y, z].map((arg, index) => {
    return arg.includes("~") ? a[index] + locations[index] : arg.includes("^") ? a[index] + viewVectors[index] : a[index];
  });
  return { x: b[0], y: b[1], z: b[2] };
}
function sendCallback(cmdArgs, args, event, baseCommand) {
  const lastArg = args[args.length - 1] ?? baseCommand;
  const argsToReturn = [];
  for (const [i, arg] of args.entries()) {
    if (arg.type.name.endsWith("*"))
      continue;
    if (arg.type instanceof LocationArgumentType) {
      argsToReturn.push(
        parseLocationArgs(
          [cmdArgs[i], cmdArgs[i + 1], cmdArgs[i + 2]],
          event.sender
        )
      );
      continue;
    }
    if (arg.type instanceof LiteralArgumentType)
      continue;
    argsToReturn.push(arg.type.matches(cmdArgs[i]).value ?? cmdArgs[i]);
  }
  lastArg.callback(new CommandCallback(event), ...argsToReturn);
}

// project/behavior/src/lib/Command/index.ts
var COMMANDS = [];
world4.events.beforeChat.subscribe((data) => {
  if (!data.message.startsWith(PREFIX))
    return;
  data.cancel = true;
  const args = getChatAugments(data.message, PREFIX);
  const command2 = COMMANDS.find(
    (c) => c.depth == 0 && (c.data.name == args[0] || c.data?.aliases?.includes(args[0]))
  );
  const event = {
    message: data.message,
    sendToTargets: data.sendToTargets,
    sender: data.sender,
    targets: data.targets
  };
  if (!command2)
    return commandNotFound(data.sender, args[0]);
  if (!command2.data?.requires(data.sender))
    return noPerm(event.sender, command2);
  args.shift();
  const verifiedCommands = [];
  const getArg = (start, i) => {
    if (start.children.length > 0) {
      const arg = start.children.find((v2) => v2.type.matches(args[i]).success);
      if (!arg && !args[i] && start.callback)
        return;
      if (!arg)
        return commandSyntaxFail(event.sender, command2, start, args, i), "fail";
      if (!arg.data?.requires(event.sender))
        return noPerm(event.sender, arg), "fail";
      verifiedCommands.push(arg);
      return getArg(arg, i + 1);
    }
  };
  let v = getArg(command2, 0);
  if (v == "fail")
    return;
  sendCallback(args, verifiedCommands, event, command2);
});

// project/behavior/src/lib/Chest GUI/index.ts
import { system as system6, world as world6 } from "@minecraft/server";

// project/behavior/src/config/chest.ts
var GUI_ITEM = "rubedo:gui";
var ENTITY_INVENTORY = "rubedo:inventory";

// project/behavior/src/plugins/Anti-Cheat/utils.ts
import {
  world as world5,
  Player as Player3,
  BlockLocation as BlockLocation4,
  MinecraftBlockTypes as MinecraftBlockTypes3,
  GameMode,
  system as system3
} from "@minecraft/server";

// project/behavior/src/plugins/Anti-Cheat/modules/models/Region.ts
import { BlockLocation as BlockLocation3, MinecraftBlockTypes } from "@minecraft/server";

// project/behavior/src/plugins/Anti-Cheat/config/region.ts
var DEFAULT_REGION_PERMISSIONS = {
  doorsAndSwitches: true,
  openContainers: true,
  pvp: false,
  allowedEntities: [
    "minecraft:player",
    "minecraft:npc",
    "minecraft:item",
    "rubedo:inventory",
    "rubedo:database"
  ]
};
var DOORS_SWITCHES = [
  "minecraft:acacia_door",
  "minecraft:acacia_trapdoor",
  "minecraft:acacia_button",
  "minecraft:birch_door",
  "minecraft:birch_trapdoor",
  "minecraft:birch_button",
  "minecraft:crimson_door",
  "minecraft:crimson_trapdoor",
  "minecraft:crimson_button",
  "minecraft:dark_oak_door",
  "minecraft:dark_oak_trapdoor",
  "minecraft:dark_oak_button",
  "minecraft:jungle_door",
  "minecraft:jungle_trapdoor",
  "minecraft:jungle_button",
  "minecraft:mangrove_door",
  "minecraft:mangrove_trapdoor",
  "minecraft:mangrove_button",
  "minecraft:spruce_door",
  "minecraft:spruce_trapdoor",
  "minecraft:spruce_button",
  "minecraft:warped_door",
  "minecraft:warped_trapdoor",
  "minecraft:warped_button",
  "minecraft:wooden_door",
  "minecraft:wooden_button",
  "minecraft:trapdoor",
  "minecraft:iron_door",
  "minecraft:iron_trapdoor",
  "minecraft:polished_blackstone_button",
  "minecraft:lever"
];
var BLOCK_CONTAINERS = [
  "minecraft:chest",
  "minecraft:ender_chest",
  "minecraft:barrel",
  "minecraft:trapped_chest",
  "minecraft:dispenser",
  "minecraft:dropper",
  "minecraft:furnace",
  "minecraft:blast_furnace",
  "minecraft:lit_furnace",
  "minecraft:lit_blast_furnace",
  "minecraft:hopper",
  "minecraft:shulker_box",
  "minecraft:undyed_shulker_box",
  "minecraft:lit_smoker",
  "minecraft:smoker"
];

// project/behavior/src/plugins/Anti-Cheat/modules/models/Region.ts
var REGIONS = [];
var REGIONS_HAVE_BEEN_GRABBED = false;
var LOWEST_Y_VALUE = -64;
var HIGHEST_Y_VALUE = 320;
var Region = class {
  static async getAllRegionsSync() {
    if (REGIONS_HAVE_BEEN_GRABBED)
      return REGIONS;
    const regions = (await TABLES.regions.valuesSync()).map(
      (region) => new Region(
        region.from,
        region.to,
        region.dimensionId,
        region.permissions,
        region.key
      )
    );
    regions.forEach((r) => {
      REGIONS.push(r);
    });
    REGIONS_HAVE_BEEN_GRABBED = true;
    return regions;
  }
  static getAllRegions() {
    if (REGIONS_HAVE_BEEN_GRABBED)
      return REGIONS;
    const regions = TABLES.regions.values().map(
      (region) => new Region(
        region.from,
        region.to,
        region.dimensionId,
        region.permissions,
        region.key
      )
    );
    regions.forEach((r) => {
      REGIONS.push(r);
    });
    REGIONS_HAVE_BEEN_GRABBED = true;
    return regions;
  }
  static blockLocationInRegion(blockLocation, dimensionId) {
    return this.getAllRegions().find(
      (region) => region.dimensionId == dimensionId && betweenVector3(
        blockLocation,
        { x: region.from.x, y: LOWEST_Y_VALUE, z: region.from.z },
        { x: region.to.x, y: HIGHEST_Y_VALUE, z: region.to.z }
      )
    );
  }
  static async blockLocationInRegionSync(blockLocation, dimensionId) {
    return (await this.getAllRegionsSync()).find(
      (region) => region.dimensionId == dimensionId && betweenVector3(
        blockLocation,
        { x: region.from.x, y: LOWEST_Y_VALUE, z: region.from.z },
        { x: region.to.x, y: HIGHEST_Y_VALUE, z: region.to.z }
      )
    );
  }
  static async removeRegionAtBlockLocation(blockLocation, dimensionId) {
    const region = this.blockLocationInRegion(blockLocation, dimensionId);
    if (!region)
      return false;
    return TABLES.regions.delete(region.key);
  }
  constructor(from, to, dimensionId, permissions, key) {
    this.from = from;
    this.to = to;
    this.dimensionId = dimensionId;
    this.permissions = permissions ?? DEFAULT_REGION_PERMISSIONS;
    this.key = key ? key : Date.now().toString();
    if (!key) {
      this.update().then(() => {
        loadRegionDenys();
        REGIONS.push(this);
      });
    }
  }
  async update() {
    return TABLES.regions.set(this.key, {
      key: this.key,
      from: this.from,
      dimensionId: this.dimensionId,
      permissions: this.permissions,
      to: this.to
    });
  }
  async delete() {
    const region = TABLES.regions.get(this.key);
    const loc1 = new BlockLocation3(
      region.from.x,
      region.dimensionId == "minecraft:overworld" ? -64 : 0,
      region.from.z
    );
    const loc2 = new BlockLocation3(
      region.to.x,
      region.dimensionId == "minecraft:overworld" ? -64 : 0,
      region.to.z
    );
    for (const blockLocation of loc1.blocksBetween(loc2)) {
      DIMENSIONS[region.dimensionId].getBlock(blockLocation)?.setType(MinecraftBlockTypes.bedrock);
    }
    REGIONS = REGIONS.filter((r) => r.key != this.key);
    return TABLES.regions.delete(this.key);
  }
  entityInRegion(entity) {
    return this.dimensionId == entity.dimension.id && betweenVector3(
      entity.location,
      { x: this.from.x, y: LOWEST_Y_VALUE, z: this.from.z },
      { x: this.to.x, y: HIGHEST_Y_VALUE, z: this.to.z }
    );
  }
  changePermission(key, value) {
    this.permissions[key] = value;
    this.update();
  }
};

// project/behavior/src/plugins/Anti-Cheat/modules/models/Task.ts
var ChangePlayerRoleTask = class {
  static getTasks() {
    return TABLES.tasks.get("changePlayerRole") ?? [];
  }
  static getPlayersRoleToSet(playerName) {
    const tasks = ChangePlayerRoleTask.getTasks();
    return tasks.find((t) => t.playerName == playerName)?.role;
  }
  constructor(playerName, role) {
    let tasks = ChangePlayerRoleTask.getTasks();
    tasks.push({ playerName, role });
    TABLES.tasks.set("changePlayerRole", tasks);
  }
};

// project/behavior/src/plugins/Anti-Cheat/config/moderation.ts
import { MinecraftBlockTypes as MinecraftBlockTypes2, MinecraftItemTypes as MinecraftItemTypes2 } from "@minecraft/server";
var FORBIDDEN_ITEMS = [
  MinecraftItemTypes2.beehive.id,
  MinecraftItemTypes2.beeNest.id,
  MinecraftItemTypes2.axolotlBucket.id,
  MinecraftItemTypes2.codBucket.id,
  MinecraftItemTypes2.tadpoleBucket.id,
  MinecraftItemTypes2.tropicalFishBucket.id,
  MinecraftItemTypes2.salmonBucket.id,
  MinecraftItemTypes2.pufferfishBucket.id
];
var BANNED_ITEMS = [
  MinecraftItemTypes2.allow.id,
  MinecraftItemTypes2.barrier.id,
  MinecraftItemTypes2.borderBlock.id,
  MinecraftItemTypes2.debugStick?.id ?? "minecraft:debug_stick",
  MinecraftItemTypes2.deny.id,
  MinecraftItemTypes2.jigsaw.id,
  MinecraftItemTypes2.lightBlock.id,
  MinecraftItemTypes2.commandBlock.id,
  MinecraftItemTypes2.repeatingCommandBlock.id,
  MinecraftItemTypes2.chainCommandBlock.id,
  MinecraftItemTypes2.commandBlockMinecart.id,
  MinecraftItemTypes2.structureBlock.id,
  MinecraftItemTypes2.structureVoid.id,
  MinecraftItemTypes2.bedrock.id,
  MinecraftItemTypes2.endPortalFrame.id,
  "minecraft:info_update",
  "minecraft:info_update2",
  "minecraft:reserved3",
  "minecraft:reserved4",
  "minecraft:reserved6",
  "minecraft:movingBlock",
  "minecraft:moving_block",
  "minecraft:movingblock",
  "minecraft:piston_arm_collision",
  "minecraft:piston_arm_collision",
  "minecraft:pistonarmcollision",
  "minecraft:stickyPistonArmCollision",
  "minecraft:sticky_piston_arm_collision",
  "minecraft:unknown",
  "minecraft:glowingobsidian",
  "minecraft:invisible_bedrock",
  "minecraft:invisiblebedrock",
  "minecraft:netherreactor",
  "minecraft:portal",
  "minecraft:fire",
  "minecraft:water",
  "minecraft:lava",
  "minecraft:flowing_lava",
  "minecraft:flowing_water",
  "minecraft:soul_fire"
];
var FORBIDDEN_BLOCKS = [
  MinecraftBlockTypes2.dispenser.id
];
var BANNED_BLOCKS = [
  MinecraftBlockTypes2.bedrock.id,
  MinecraftBlockTypes2.barrier.id,
  "minecraft:invisiblebedrock",
  "minecraft:movingBlock",
  "minecraft:movingblock",
  "minecraft:moving_block"
];
var API_CONTAINERS = [
  MinecraftBlockTypes2.chest.id,
  MinecraftBlockTypes2.trappedChest.id
];
var CONTAINERS = [
  MinecraftItemTypes2.chest.id,
  MinecraftItemTypes2.trappedChest.id,
  MinecraftItemTypes2.barrel.id,
  MinecraftItemTypes2.dispenser.id,
  MinecraftItemTypes2.dropper.id,
  MinecraftItemTypes2.furnace.id,
  "minecraft:lit_furnace",
  MinecraftItemTypes2.blastFurnace.id,
  "minecraft:lit_blast_furnace",
  MinecraftItemTypes2.smoker.id,
  "minecraft:lit_smoker",
  MinecraftItemTypes2.hopper.id,
  MinecraftItemTypes2.shulkerBox.id,
  MinecraftItemTypes2.undyedShulkerBox.id
];
var CHECK_SIZE = { x: 7, y: 7, z: 7 };

// project/behavior/src/plugins/Anti-Cheat/config/enchantments.ts
var ENCHANTMENTS = {
  aquaAffinity: 1,
  baneOfArthropods: 5,
  binding: 1,
  blastProtection: 4,
  channeling: 1,
  depthStrider: 3,
  efficiency: 5,
  featherFalling: 4,
  fireAspect: 2,
  fireProtection: 4,
  flame: 1,
  fortune: 3,
  frostWalker: 2,
  impaling: 5,
  infinity: 1,
  knockback: 2,
  looting: 3,
  loyalty: 4,
  luckOfTheSea: 3,
  lure: 3,
  mending: 1,
  multishot: 1,
  piercing: 4,
  power: 5,
  projectileProtection: 4,
  protection: 4,
  punch: 2,
  quickCharge: 3,
  respiration: 3,
  riptide: 3,
  sharpness: 5,
  silkTouch: 1,
  smite: 5,
  soulSpeed: 3,
  swiftSneak: 4,
  thorns: 3,
  unbreaking: 3,
  vanishing: 1
};

// project/behavior/src/config/app.ts
var VERSION = "2.6.4-beta";
var APPEAL_LINK = "https://discord.gg/dMa3A5UYKX";

// project/behavior/src/plugins/Anti-Cheat/utils.ts
function kick(player, message = [], onFail) {
  if (isServerOwner(player)) {
    console.warn(`[WARNING]: TRIED TO KICK OWNER`);
    player.tell(`You have been tried to kick, but you cant!`);
    return onFail?.();
  }
  try {
    player.runCommandAsync(`kick @s \xA7r${message.join("\n")}`);
    player.triggerEvent("kick");
  } catch (error) {
    player.triggerEvent("kick");
    if (!/"statusCode":-2147352576/.test(error))
      return;
    if (onFail)
      onFail();
  }
}
function getRole(player) {
  if (player instanceof Player3) {
    return TABLES.roles.get(player.name) ?? "member";
  } else {
    return TABLES.roles.get(player) ?? "member";
  }
}
function setRole(player, value) {
  if (typeof player == "string") {
    TABLES.roles.set(player, value);
    const inGamePlayer = [...world5.getPlayers()].find((p) => p.name == player);
    if (inGamePlayer) {
      inGamePlayer.setDynamicProperty("role", value);
    } else {
      new ChangePlayerRoleTask(player, value);
    }
  } else {
    TABLES.roles.set(player.name, value);
    player.setDynamicProperty("role", value);
  }
}
function isServerOwner(player) {
  return world5.getDynamicProperty("worldsOwner") == player.id;
}
function getServerOwner() {
  const id = world5.getDynamicProperty("worldsOwner");
  if (!id || id == "")
    return null;
  return id;
}
function getServerOwnerName() {
  const ownerId = getServerOwner();
  if (!ownerId)
    return null;
  const ids = TABLES.ids.collection();
  return Object.keys(ids).find((key) => ids[key] === ownerId);
}
function setServerOwner(player) {
  if (!player)
    return world5.setDynamicProperty("worldsOwner", "");
  world5.setDynamicProperty("worldsOwner", player.id.toString());
}
function isLockedDown() {
  return world5.getDynamicProperty("isLockDown") ?? false;
}
function setLockDown(val) {
  world5.setDynamicProperty("isLockDown", val);
}
function loadRegionDenys() {
  for (const region of Region.getAllRegions()) {
    const loc1 = new BlockLocation4(
      region.from.x,
      region.dimensionId == "minecraft:overworld" ? -64 : 0,
      region.from.z
    );
    const loc2 = new BlockLocation4(
      region.to.x,
      region.dimensionId == "minecraft:overworld" ? -64 : 0,
      region.to.z
    );
    for (const blockLocation of loc1.blocksBetween(loc2)) {
      DIMENSIONS[region.dimensionId].getBlock(blockLocation)?.setType(MinecraftBlockTypes3.deny);
    }
  }
}
var CALLBACKS2 = [];
var forEachValidPlayerCalls = 0;
function forEachValidPlayer(callback, delay = 0) {
  const key = forEachValidPlayerCalls;
  CALLBACKS2[key] = {
    callback,
    delay,
    lastCall: 0
  };
  forEachValidPlayerCalls = key + 1;
  return key;
}
function clearForEachValidPlayer(key) {
  delete CALLBACKS2[key];
}
EntitiesLoad.subscribe(() => {
  system3.runSchedule(() => {
    const players = [...world5.getPlayers()];
    for (const [i, player] of players.entries()) {
      if (getRole(player) == "admin")
        continue;
      for (const CALLBACK of Object.values(CALLBACKS2)) {
        if (CALLBACK.delay != 0 && system3.currentTick - CALLBACK.lastCall < CALLBACK.delay)
          continue;
        CALLBACK.callback(player);
        if (i == players.length - 1)
          CALLBACK.lastCall = system3.currentTick;
      }
    }
  });
});
function getConfigId(id) {
  switch (id) {
    case "spam_config":
      return TABLES.config.get("spam_config") ?? {
        repeatedMessages: true,
        zalgo: true,
        violationCount: 0,
        permMutePlayer: false
      };
    case "cbe_config":
      return TABLES.config.get("cbe_config") ?? {
        clearItem: true,
        violationCount: 0,
        banPlayer: false,
        canAddEnchantment: false
      };
    case "gamemode_config":
      return TABLES.config.get("gamemode_config") ?? {
        setToSurvival: true,
        clearPlayer: true,
        violationCount: 0,
        banPlayer: false
      };
    case "nuker_data":
      return TABLES.config.get("nuker_data") ?? {
        violationCount: 0,
        banPlayer: false
      };
    case "banned_items":
      return TABLES.config.get("banned_items") ?? BANNED_ITEMS;
    case "banned_blocks":
      return TABLES.config.get("banned_blocks") ?? BANNED_BLOCKS;
    case "enchantments":
      return TABLES.config.get("enchantments") ?? ENCHANTMENTS;
    case "appealLink":
      return TABLES.config.get("appealLink") ?? APPEAL_LINK;
  }
}
function setConfigId(key, value) {
  TABLES.config.set(key, value);
}
function getMaxEnchantmentLevel(enchantment) {
  const MAX_ENCHANTMENTS = getConfigId("enchantments");
  return MAX_ENCHANTMENTS[enchantment.type.id] ?? enchantment.type.maxLevel;
}
function getGamemode(player) {
  return Object.values(GameMode).find(
    (g) => [...world5.getPlayers({ name: player.name, gameMode: g })].length
  );
}

// project/behavior/src/lib/Chest GUI/Models/EntityChest.ts
import { system as system5 } from "@minecraft/server";

// project/behavior/src/lib/Events/onSlotChange.ts
import {
  system as system4
} from "@minecraft/server";
var CALLBACKS3 = {};
var MAPPED_INVENTORIES = {};
var PREVIOUS_CHANGE = {};
function getSlotChanges(entity, oldInv, newInv) {
  if (oldInv.length != newInv.length)
    return [];
  const changes = [];
  for (let i = 0; i < newInv.length; i++) {
    if (oldInv[i]?.item?.amount < newInv[i]?.item?.amount || oldInv[i]?.item?.amount > newInv[i]?.item?.amount && oldInv[i]?.item?.amount != 0) {
      const change_data = {
        slot: i,
        uid: newInv[i].uid,
        oldUid: oldInv[i].uid,
        item: newInv[i].item,
        oldItem: oldInv[i].item,
        changeType: "fluctuation"
      };
      changes.push(change_data);
      PREVIOUS_CHANGE[entity.id] = change_data;
      continue;
    }
    if (newInv[i].uid == oldInv[i].uid)
      continue;
    if (oldInv[i]?.item && newInv[i]?.item) {
      const change_data = {
        slot: i,
        uid: newInv[i].uid,
        oldUid: oldInv[i].uid,
        item: newInv[i].item,
        oldItem: oldInv[i].item,
        changeType: "swap"
      };
      changes.push(change_data);
      PREVIOUS_CHANGE[entity.id] = change_data;
    } else if (!newInv[i]?.item) {
      const change_data = {
        slot: i,
        uid: oldInv[i].uid,
        item: oldInv[i].item,
        changeType: "delete"
      };
      changes.push(change_data);
      PREVIOUS_CHANGE[entity.id] = change_data;
    } else if (newInv[i]?.item) {
      if (PREVIOUS_CHANGE[entity.id]?.changeType == "delete" && PREVIOUS_CHANGE[entity.id]?.uid == newInv[i].uid) {
        const change_data = {
          slot: i,
          uid: newInv[i].uid,
          item: newInv[i].item,
          changeType: "move"
        };
        changes.push(change_data);
        PREVIOUS_CHANGE[entity.id] = change_data;
        continue;
      } else {
        const change_data = {
          slot: i,
          uid: newInv[i].uid,
          item: newInv[i].item,
          changeType: "put"
        };
        changes.push(change_data);
        PREVIOUS_CHANGE[entity.id] = change_data;
      }
    }
  }
  return changes;
}
function getItemUid(item) {
  if (!item)
    return "";
  const data = [];
  data.push(item.typeId);
  data.push(item.nameTag);
  data.push(item.data);
  data.push(item.getLore().join(""));
  return data.join("");
}
function mapInventory(container) {
  const inventory = [];
  for (let i = 0; i < container.size; i++) {
    let item = container.getItem(i);
    inventory[i] = {
      uid: getItemUid(item),
      item
    };
  }
  return inventory;
}
system4.runSchedule(() => {
  for (const callback of Object.values(CALLBACKS3)) {
    for (const entity of DIMENSIONS.overworld.getEntities(callback.entities)) {
      const inventory = mapInventory(
        entity.getComponent("inventory").container
      );
      const changes = getSlotChanges(
        entity,
        MAPPED_INVENTORIES[entity.id] ?? inventory,
        inventory
      );
      MAPPED_INVENTORIES[entity.id] = inventory;
      if (changes.length == 0)
        continue;
      if (entity.hasTag("skipCheck")) {
        entity.removeTag("skipCheck");
        delete PREVIOUS_CHANGE[entity.id];
        continue;
      }
      for (const change of changes) {
        callback.callback(entity, change);
      }
    }
  }
}, 5);
var onEntityInventorySlotChange = class {
  static subscribe(entities, callback) {
    const key = Date.now();
    CALLBACKS3[key] = { callback, entities };
    return key;
  }
  static unsubscribe(key) {
    delete CALLBACKS3[key];
  }
};

// project/behavior/src/lib/Chest GUI/utils.ts
import { Location as Location2 } from "@minecraft/server";
var CHESTGUIS = {};
var PAGES = {};
function getHeldItem(player) {
  const inventory = player.getComponent("minecraft:inventory").container;
  return inventory.getItem(player.selectedSlot);
}
async function clearPlayersPointer(player, ItemToClear) {
  try {
    const inventory = player.getComponent("minecraft:inventory").container;
    let itemsToLoad = [];
    for (let i = 0; i < inventory.size; i++) {
      const item = inventory.getItem(i);
      if (!item)
        continue;
      if (item?.typeId == ItemToClear?.typeId) {
        itemsToLoad.push({ slot: i, item });
        inventory.setItem;
        if (i < 9) {
          player.runCommandAsync(`replaceitem entity @s slot.hotbar ${i} air`);
        } else {
          player.runCommandAsync(
            `replaceitem entity @s slot.inventory ${i - 9} air`
          );
        }
      }
    }
    await player.runCommandAsync(
      `clear @s ${ItemToClear?.typeId} ${ItemToClear.data} ${ItemToClear.amount}`
    );
    for (const item of itemsToLoad) {
      inventory.setItem(item.slot, item.item);
    }
  } catch (error) {
    [
      ...player.dimension.getEntities({
        type: "minecraft:item",
        location: new Location2(
          player.location.x,
          player.location.y,
          player.location.z
        ),
        maxDistance: 2,
        closest: 1
      })
    ].forEach((e2) => e2.kill());
  }
}
function getItemAtSlot(entity, slot) {
  const inventory = entity.getComponent("minecraft:inventory").container;
  return inventory.getItem(slot);
}

// project/behavior/src/lib/Chest GUI/Models/ItemGrabbedCallback.ts
var ItemGrabbedCallback = class {
  constructor(gui, slot, change) {
    this.gui = gui;
    this.slot = slot;
    this.change = change;
  }
  message(text2) {
    this.gui.player.tell(text2);
  }
  getItemAdded() {
    if (this.slot.item)
      return null;
    return this.gui.entity.getComponent("minecraft:inventory").container.getItem(this.change.slot);
  }
  GiveAction(item = this.slot.item.itemStack) {
    this.gui.player.getComponent("minecraft:inventory").container.addItem(item);
  }
  TakeAction(db = null) {
    this.gui.player.getComponent("minecraft:inventory").container.addItem(this.slot.item.itemStack);
    this.gui.page.slots[this.change.slot] = null;
    if (!db)
      return;
    db.delete(this.slot.item.components.dbKey);
  }
  PageAction(page, extras) {
    this.gui.setPage(page, extras);
  }
  CloseAction() {
    this.gui.despawn();
  }
  SetAction() {
    const container = this.gui.entity.getComponent(
      "minecraft:inventory"
    ).container;
    container.setItem(this.change.slot, this.slot.item.itemStack);
  }
  async FormAction(form) {
    this.CloseAction();
    await sleep(5);
    return await form.show(this.gui.player);
  }
};

// project/behavior/src/lib/Chest GUI/Models/EntityChest.ts
var ChestGUI = class {
  static spawnEntity(player) {
    try {
      return player.dimension.spawnEntity(
        ENTITY_INVENTORY,
        player.headLocation
      );
    } catch (error) {
      return null;
    }
  }
  constructor(player) {
    this.player = player;
    this.entity = ChestGUI.spawnEntity(player);
    if (this.entity) {
      this.hasChestOpen = false;
      this.setPage("home");
    }
    this.runScheduleId = system5.runSchedule(() => {
      if (!this.entity)
        return this.despawn();
      if (this.player.getComponent("mark_variant").value == 1) {
        if (!this.hasChestOpen) {
          this.slotChangeEvent = onEntityInventorySlotChange.subscribe(
            { type: ENTITY_INVENTORY },
            (entity, change) => {
              if (entity.id != this.entity.id)
                return;
              this.onSlotChange(change);
            }
          );
        }
        this.hasChestOpen = true;
      } else {
        try {
          this.entity.teleport(
            this.player.headLocation,
            this.player.dimension,
            this.player.rotation.x,
            this.player.rotation.y,
            true
          );
        } catch (error) {
          this.despawn();
        }
      }
    }, 5);
  }
  setPage(pageId, extras) {
    const c = this.entity.getComponent("inventory").container;
    for (let i = 0; i < c.size; i++) {
      c.setItem(i, AIR);
    }
    if (!Object.keys(PAGES).includes(pageId))
      throw new Error(`pageId ${pageId} does not exist!`);
    const page = PAGES[pageId];
    this.page = page;
    page.fillType(this.entity, page, extras);
    this.entity.nameTag = `size:54`;
  }
  onSlotChange(change) {
    const slot = this.page.slots[change.slot];
    if (!slot) {
      this.entity.getComponent("inventory").container.setItem(change.slot, AIR);
    } else if (change.changeType == "delete") {
      if (slot.item)
        clearPlayersPointer(this.player, change.item);
      if (!slot.item && !getItemAtSlot(this.entity, change.slot))
        return;
      slot.action(new ItemGrabbedCallback(this, slot, change));
    }
  }
  despawn() {
    try {
      this.entity?.triggerEvent("despawn");
    } catch (error) {
    }
    try {
      delete CHESTGUIS[this.player.name];
    } catch (error) {
    }
    if (this.runScheduleId)
      system5.clearRunSchedule(this.runScheduleId);
    if (this.slotChangeEvent)
      onEntityInventorySlotChange.unsubscribe(this.slotChangeEvent);
  }
};

// project/behavior/src/lib/Chest GUI/Models/PageItem.ts
import {
  ItemStack as ItemStack4
} from "@minecraft/server";
var PageItem = class {
  constructor(itemType, components = {}, itemStack) {
    this.itemType = itemType;
    this.components = components;
    this.setItemStack = itemStack;
  }
  get itemStack() {
    if (this.setItemStack)
      return this.setItemStack;
    const itemStack = new ItemStack4(this.itemType);
    if (this.components) {
      itemStack.amount = this.components?.amount ?? 1;
      itemStack.data = this.components?.data ?? 0;
      itemStack.nameTag = this.components?.nameTag;
      itemStack.setLore(this.components?.loreList ?? []);
      const enchantments = itemStack.getComponent("enchantments").enchantments;
      for (const enchantment of this.components?.enchantments ?? []) {
        enchantments.addEnchantment(enchantment);
      }
      itemStack.getComponent("enchantments").enchantments = enchantments;
    }
    return itemStack;
  }
};

// project/behavior/src/lib/Chest GUI/Models/FillTypes.ts
function DefaultFill(entity, page, extras) {
  const container = entity.getComponent("minecraft:inventory").container;
  for (let i = 0; i < container.size; i++) {
    const slot = page.slots[i];
    if (!slot || !slot.item) {
      container.setItem(i, AIR);
      continue;
    }
    container.setItem(i, slot.item.itemStack);
  }
}

// project/behavior/src/lib/Chest GUI/Models/Page.ts
var Page = class {
  constructor(id, fillType = DefaultFill) {
    if (Object.keys(PAGES).includes(id))
      throw new Error(`Page: ${id}, Already exists!`);
    this.id = id;
    this.fillType = fillType;
    this.slots = [];
    PAGES[id] = this;
  }
  setSlots(slot, item, action) {
    const data = item ? { item, action } : null;
    for (const i of slot) {
      this.slots[i] = data;
    }
    return this;
  }
};

// project/behavior/src/lib/Chest GUI/pages/home.ts
import { MinecraftItemTypes as MinecraftItemTypes3 } from "@minecraft/server";
var HOME_PAGE = new Page("home").setSlots(
  [22],
  new PageItem(MinecraftItemTypes3.enderChest, {
    nameTag: "\xA7l\xA7bInventory Viewer"
  }),
  (ctx) => {
    ctx.PageAction("moderation:see");
  }
).setSlots(
  [54],
  new PageItem(MinecraftItemTypes3.barrier, { nameTag: "\xA7cClose GUI" }),
  (ctx) => {
    ctx.CloseAction();
  }
);

// project/behavior/src/lib/Chest GUI/index.ts
EntitiesLoad.subscribe(() => {
  system6.runSchedule(() => {
    for (const player of world6.getPlayers()) {
      if (getHeldItem(player)?.typeId != GUI_ITEM) {
        if (CHESTGUIS[player.name])
          CHESTGUIS[player.name].despawn();
        continue;
      }
      if (Object.keys(CHESTGUIS).includes(player?.name))
        continue;
      if (getRole(player) != "admin")
        continue;
      CHESTGUIS[player.name] = new ChestGUI(player);
    }
  }, 10);
});
system6.runSchedule(() => {
  const validIds = Object.values(CHESTGUIS).map((c) => c.entity.id);
  for (const entity of DIMENSIONS.overworld.getEntities({
    type: ENTITY_INVENTORY
  })) {
    if (validIds.includes(entity.id))
      continue;
    entity.triggerEvent("despawn");
  }
}, 100);

// project/behavior/src/plugins/Anti-Cheat/protections.ts
import { system as system7 } from "@minecraft/server";
var PROTECTIONS = {};
EntitiesLoad.subscribe(() => {
  system7.run(() => {
    for (const protection6 of Object.values(PROTECTIONS)) {
      if (!protection6.getConfig().enabled)
        continue;
      protection6.enable();
    }
  });
});

// project/behavior/src/lang/text.ts
var text = {
  "api.name": () => "Smelly API",
  "api.error.unknown": () => "An unknown error has occurred.",
  "api.database.error.table_name": (a, b) => `The display name ${a} is too long for an objective, it can be at most ${b} characters long`,
  "api.utilities.formatter.error.ms": (a) => `${a} is not a string or a number`,
  "api.Providers.form.invalidType": (a, b) => `Type ${a} is not a valid type to add a ${b}`,
  "modules.protections.cps.clickingToFast": () => `You are clicking to fast! Please click slower!`,
  "modules.managers.mute.isMuted": () => `\xA7cYou've been temporarily muted in chat.`,
  "modules.commands.ban.reply": (playerName, duration, reason = "") => `\xA7cBanned \xA7f"\xA7a${playerName}\xA7f" \xA7cfor ${duration} Because: "${reason ?? "No reason Provided"}" \xA7aSuccessfully`,
  "lockdown.kick.message": () => [
    `\xA7cYou have been kicked!`,
    `\xA7aReason: \xA7fServer is currently under LockDown`,
    `\xA7fServer will be up soon, Try to join later`
  ],
  "commands.ban.list.player": (name, reason, expire) => `- "${name}" Because: ${reason}, Expiry ${expire}`,
  "commands.freeze.list.player": (name, reason) => `- "${name}" Because: ${reason}`,
  "commands.mutes.list.player": (name, reason, expire) => `- "${name}" Because: ${reason}, Expiry: ${expire}`,
  "commands.lockdown.confirm": "Are you sure you want to lockdown the server, this will kick all active players and all players who try to join who are not admin"
};

// project/behavior/src/lib/Command/Command.ts
var Command = class {
  constructor(data, type, depth = 0, parent) {
    this.data = data;
    this.type = type;
    this.depth = depth;
    this.parent = parent;
    if (!data.requires)
      data.requires = (player) => true;
    this.data = data;
    this.type = type ?? new LiteralArgumentType(this.data.name);
    this.children = [];
    this.depth = depth;
    this.parent = parent;
    this.callback = null;
    COMMANDS.push(this);
  }
  argument(type) {
    const cmd = new Command(
      this.data,
      type,
      this.depth + 1,
      this
    );
    this.children.push(cmd);
    return cmd;
  }
  string(name) {
    return this.argument(new StringArgumentType(name));
  }
  int(name) {
    return this.argument(new IntegerArgumentType(name));
  }
  array(name, types) {
    return this.argument(new ArrayArgumentType(name, types));
  }
  boolean(name) {
    return this.argument(new BooleanArgumentType(name));
  }
  location(name) {
    const cmd = this.argument(new LocationArgumentType(name));
    if (!name.endsWith("*")) {
      const newArg = cmd.location(name + "_y*").location(name + "_z*");
      return newArg;
    }
    return cmd;
  }
  literal(data) {
    const cmd = new Command(
      data,
      new LiteralArgumentType(data.name),
      this.depth + 1,
      this
    );
    this.children.push(cmd);
    return cmd;
  }
  executes(callback) {
    this.callback = callback;
    return this;
  }
};

// project/behavior/src/plugins/Anti-Cheat/modules/models/Ban.ts
import { Player as Player6 } from "@minecraft/server";
function setBan(player, id, duration, reason = "No Reason", by = "Rubedo Auto Mod") {
  const data = {
    key: id,
    playerName: player instanceof Player6 ? player.name : player,
    date: Date.now(),
    duration: duration ? durationToMs(duration) : null,
    expire: duration ? durationToMs(duration) + Date.now() : null,
    reason,
    by
  };
  TABLES.bans.set(id, data);
}
var Ban = class {
  constructor(player, duration, reason = "No Reason", by = "Rubedo Auto Mod") {
    if (player instanceof Player6) {
      setBan(player, player.id, duration, reason, by);
    } else {
      setBan(player, TABLES.ids.get(player), duration, reason, by);
    }
  }
};

// project/behavior/src/plugins/Anti-Cheat/modules/commands/ban.ts
function ban(ctx, player, duration, reason, by) {
  if (TABLES.bans.get(TABLES.ids.get(player)))
    return ctx.reply(`\xA7c${player} is already banned`);
  ctx.reply(`\xA7aClose chat to confirm`);
  confirmAction(
    ctx.sender,
    `Are you sure you want to ban ${player}, for ${duration ?? "forever"}`,
    () => {
      new Ban(player, duration, reason, ctx.sender.name);
      ctx.reply(text["modules.commands.ban.reply"](player, duration, reason));
    }
  );
}
var root = new Command({
  name: "ban",
  description: "Manage bans",
  requires: (player) => ["admin", "moderator"].includes(getRole(player))
});
root.literal({
  name: "add",
  description: "Bans a player"
}).argument(new ArgumentTypes.playerName()).executes((ctx, player) => {
  ban(ctx, player, null, null, ctx.sender.name);
}).argument(new ArgumentTypes.duration("duration")).executes((ctx, player, duration) => {
  ban(ctx, player, duration, null, ctx.sender.name);
}).string("reason").executes((ctx, player, duration, reason) => {
  ban(ctx, player, duration, reason, ctx.sender.name);
});
root.literal({
  name: "remove",
  description: "un-bans a player"
}).argument(new ArgumentTypes.playerName("playerName")).executes((ctx, playerName) => {
  const banData = TABLES.bans.values().find((ban2) => ban2.playerName == playerName);
  if (!banData)
    return ctx.reply(`${playerName} is not banned`);
  if (TABLES.bans.delete(banData.key)) {
    ctx.reply(`\xA7a${playerName}\xA7r has been Unbanned!`);
  } else {
    ctx.reply(`\xA7cFailed to un-ban ${playerName}`);
  }
});
root.literal({
  name: "list",
  description: "Lists all bans"
}).executes((ctx) => {
  const bans = TABLES.bans.values();
  if (bans.length == 0)
    return ctx.sender.tell(`\xA7cNo one is banned!`);
  ctx.sender.tell(`\xA72--- Showing Bans (${bans.length}) ---`);
  for (const ban2 of bans) {
    ctx.sender.tell(
      text["commands.ban.list.player"](
        ban2.playerName,
        ban2.reason,
        ban2.expire ? msToTime(ban2.duration) : "Forever"
      )
    );
  }
});

// project/behavior/src/plugins/Anti-Cheat/modules/commands/database.ts
var root2 = new Command({
  name: "database",
  description: "Interacts with SA Database",
  aliases: ["db"],
  requires: (player) => getRole(player) == "admin"
});
root2.literal({
  name: "get"
}).string("table").string("key").executes((ctx, table, key) => {
  try {
    const data = TABLES[table].get(key);
    if (data) {
      ctx.reply(JSON.stringify(data));
    } else {
      ctx.reply(`No data could be found for key ${key}`);
    }
  } catch (error) {
    ctx.reply(error + error.stack);
  }
});
root2.literal({
  name: "set"
}).string("table").string("key").string("value").executes((ctx, table, key, value) => {
  try {
    TABLES[table].set(key, value);
    ctx.reply(`Set Key: "${key}", to value: "${value}" on table: "${table}"`);
  } catch (error) {
    ctx.reply(error + error.stack);
  }
});
root2.literal({
  name: "clear"
}).string("table").executes((ctx, table) => {
  try {
    TABLES[table].clear();
    ctx.reply(`Cleared Table ${table}`);
  } catch (error) {
    ctx.reply(error + error.stack);
  }
});
root2.literal({
  name: "keys",
  description: "Returns all keys on a database"
}).string("table").executes((ctx, table) => {
  try {
    const keys = TABLES[table].keys();
    ctx.reply(`Keys on database: ${table}: ${keys}`);
  } catch (error) {
    ctx.reply(error + error.stack);
  }
});
root2.literal({
  name: "values",
  description: "Returns all values on a database"
}).string("table").executes((ctx, table) => {
  try {
    const values = TABLES[table].values();
    ctx.reply(
      `Values on database: ${table}: ${JSON.stringify(values, null, 2)}`
    );
  } catch (error) {
    if (error instanceof TypeError) {
      ctx.reply(`No values on database ${table}`);
    } else {
      ctx.reply(error + error.stack);
    }
  }
});

// project/behavior/src/plugins/Anti-Cheat/modules/commands/ecwipe.ts
new Command({
  name: "ecwipe",
  description: "Clears a players ender chest",
  requires: (player) => getRole(player) == "admin"
}).argument(new ArgumentTypes.player("player")).executes((ctx, player) => {
  for (let i = 0; i < 27; i++) {
    player.runCommandAsync(`replaceitem entity @s slot.enderchest ${i} air`);
  }
  ctx.reply(`\xA7aCleared "${player.name}"'s Ender chest!`);
});

// project/behavior/src/plugins/Anti-Cheat/modules/models/Freeze.ts
var Freeze = class {
  constructor(player, reason = "No Reason") {
    const data = {
      playerName: player.name,
      key: player.id,
      reason,
      location: {
        x: player.location.x,
        y: player.location.y,
        z: player.location.z,
        dimension: player.dimension.id
      }
    };
    TABLES.freezes.set(player.id, data);
  }
};

// project/behavior/src/plugins/Anti-Cheat/modules/commands/freeze.ts
var root3 = new Command({
  name: "freeze",
  description: "Manage Freezes",
  requires: (player) => ["admin", "moderator"].includes(getRole(player))
});
root3.literal({
  name: "add",
  description: "Freezes a player"
}).argument(new ArgumentTypes.player("player")).string("reason").executes((ctx, player, reason) => {
  new Freeze(player, reason);
  ctx.reply(
    `\xA7cFroze \xA7f"\xA7a${player.name}\xA7f" Because: "${reason}" \xA7aSuccessfully`
  );
  ctx.sender.tell(
    `\xA7cYou have been frozen by \xA7f"\xA7a${ctx.sender.name}\xA7f" Because: "${reason}"`
  );
});
root3.literal({
  name: "remove",
  description: "unfreezes a player"
}).argument(new ArgumentTypes.playerName("playerName")).executes((ctx, playerName) => {
  const freeze = TABLES.freezes.values().find((freeze2) => freeze2.playerName == playerName);
  if (!freeze)
    return ctx.reply(`${playerName} is not frozen`);
  TABLES.freezes.delete(freeze.key);
  ctx.reply(`\xA7a${playerName}\xA7r has been UnFrozen!`);
});
root3.literal({
  name: "list",
  description: "Lists all freezes"
}).executes((ctx) => {
  const freezes = TABLES.freezes.values();
  if (freezes.length == 0)
    return ctx.sender.tell(`\xA7cNo one is frozen!`);
  ctx.sender.tell(`\xA72--- Showing Freezes (${freezes.length}) ---`);
  for (const freeze of freezes) {
    ctx.sender.tell(
      text["commands.freeze.list.player"](freeze.playerName, freeze.reason)
    );
  }
});

// project/behavior/src/plugins/Anti-Cheat/modules/commands/help.ts
var CommandNameArgumentType = class {
  constructor(name) {
    this.name = name;
    this.typeName = "CommandName";
  }
  matches(value) {
    return {
      success: Boolean(
        COMMANDS.find((c) => c.depth == 0 && c.data.name == value)
      ),
      value
    };
  }
  fail(value) {
    return `"${value}" is not a valid command`;
  }
};
function sendCommandType(baseCommand, args, player) {
  player.tell(
    `${PREFIX}${baseCommand.data.name} ${args.map(
      (a) => a.type.typeName == "literal" ? a.data.name : `<${a.type.name}: ${a.type.typeName}>`
    ).join(" ")}`
  );
}
function sendArguments(bc, c, args, p) {
  if (!c.data?.requires(p))
    return;
  if (c.callback) {
    sendCommandType(bc, c.depth == 0 ? args : args.concat(c), p);
  }
  if (c.children.length > 0) {
    for (const child of c.children) {
      sendArguments(bc, child, c.depth == 0 ? args : args.concat(c), p);
    }
  }
}
function sendPageHeader(player, p, maxPages) {
  player.tell(
    `\xA72--- Showing help page ${p} of ${maxPages} (${PREFIX}help <page: int>) ---`
  );
}
function getCommands(player) {
  return COMMANDS.filter((c) => {
    return c.depth == 0 && c.data?.requires(player);
  });
}
function getMaxPages(player) {
  const commands = getCommands(player);
  if (commands.length == 0)
    return 0;
  return Math.ceil(commands.length / 5);
}
var root4 = new Command({
  name: "help",
  description: "Provides help/list of commands.",
  aliases: ["?", "h"]
}).executes((ctx) => {
  const maxPages = getMaxPages(ctx.sender);
  const commands = getCommands(ctx.sender).slice(1 * 5 - 5, 1 * 5);
  sendPageHeader(ctx.sender, 1, maxPages);
  for (const cmd of commands) {
    sendArguments(cmd, cmd, [], ctx.sender);
  }
});
root4.int("page").executes((ctx, p) => {
  const maxPages = getMaxPages(ctx.sender);
  if (p > maxPages)
    p = maxPages;
  const commands = getCommands(ctx.sender).slice(p * 5 - 5, p * 5);
  sendPageHeader(ctx.sender, p, maxPages);
  for (const cmd of commands) {
    sendArguments(cmd, cmd, [], ctx.sender);
  }
});
root4.argument(new CommandNameArgumentType("command")).executes((ctx, command2) => {
  const cmd = COMMANDS.filter(
    (c) => c.depth == 0 && c.data.name == command2
  )[0];
  ctx.sender.tell(
    `\xA7e${cmd.data.name}: ${cmd.data.aliases ? `aliases (${cmd.data.aliases.join(", ")})` : ""}`
  );
  ctx.sender.tell(`\xA7e${cmd.data.description}`);
  ctx.sender.tell(`Usage:`);
  sendArguments(cmd, cmd, [], ctx.sender);
});

// project/behavior/src/plugins/Anti-Cheat/modules/commands/lockdown.ts
import { world as world7 } from "@minecraft/server";
new Command({
  name: "lockdown",
  description: "Toggles the servers lockdown, meaning no one can join",
  requires: (player) => getRole(player) == "admin"
}).executes((ctx) => {
  if (isLockedDown()) {
    setLockDown(false);
    ctx.sender.tell(`\xA7aUnlocked the server!`);
  } else {
    ctx.reply(`\xA7aClose chat to confirm lockdown`);
    confirmAction(ctx.sender, text["commands.lockdown.confirm"], () => {
      setLockDown(true);
      for (const player of world7.getPlayers()) {
        if (getRole(player) == "admin")
          continue;
        kick(player, text["lockdown.kick.message"]());
      }
      world7.say(`\xA7l\xA7cServer is now LOCKED!`);
    });
  }
});

// project/behavior/src/plugins/Anti-Cheat/modules/models/Mute.ts
var Mute = class {
  static getMuteData(player) {
    return TABLES.mutes.get(player.name);
  }
  constructor(player, duration, reason = "No Reason", by = "Rubedo Auto Mod") {
    const msLength = duration ? durationToMs(duration) : null;
    const data = {
      playerName: player.name,
      date: Date.now(),
      duration: msLength,
      expire: msLength ? msLength + Date.now() : null,
      reason,
      by
    };
    TABLES.mutes.set(player.name, data);
  }
};

// project/behavior/src/plugins/Anti-Cheat/modules/commands/mute.ts
var root5 = new Command({
  name: "mute",
  description: "Manage Mutes",
  requires: (player) => ["admin", "moderator"].includes(getRole(player))
});
root5.literal({
  name: "add",
  description: "Mutes a player"
}).argument(new ArgumentTypes.player("player")).argument(new ArgumentTypes.duration("duration")).string("reason").executes((ctx, player, duration, reason) => {
  new Mute(player, duration, reason, ctx.sender.name);
  ctx.reply(
    `\xA7cMuted \xA7f"\xA7a${player.name}\xA7f" \xA7cfor ${duration} Because: "${reason}" \xA7aSuccessfully`
  );
  player.tell(
    `\xA7cYou have been muted by \xA7f"${ctx.sender.name}" \xA7cfor ${duration} Because: "${reason}"`
  );
});
root5.literal({
  name: "remove",
  description: "un-mutes a player"
}).argument(new ArgumentTypes.playerName("playerName")).executes((ctx, playerName) => {
  const mute = TABLES.mutes.values().find((mute2) => mute2.playerName == playerName);
  if (!mute)
    return ctx.reply(`${playerName} is not muted!`);
  TABLES.mutes.delete(mute.playerName);
  try {
    ctx.sender.runCommandAsync(`ability "${playerName}" mute false`);
  } catch (error) {
  }
  ctx.reply(`\xA7a${playerName}\xA7r has been UnMuted!`);
});
root5.literal({
  name: "list",
  description: "Lists all freezes"
}).executes((ctx) => {
  const mutes = TABLES.mutes.values();
  if (mutes.length == 0)
    return ctx.sender.tell(`\xA7cNo one is muted!`);
  ctx.sender.tell(`\xA72--- Showing Mutes (${mutes.length}) ---`);
  for (const mute of mutes) {
    ctx.sender.tell(
      text["commands.mutes.list.player"](
        mute.playerName,
        mute.reason,
        mute.expire ? msToTime(mute.expire) : "Forever"
      )
    );
  }
});

// project/behavior/src/plugins/Anti-Cheat/modules/commands/npc.ts
import { Location as Location3 } from "@minecraft/server";

// project/behavior/src/plugins/Anti-Cheat/modules/models/Npc.ts
var Npc = class {
  static isValid(entity) {
    if (entity.typeId != "minecraft:npc")
      return false;
    if (NPC_LOCATIONS.find((l) => LocationEquals(l, entity.location)))
      return true;
    return TABLES.npcs.keys().find((key) => entity.id == key) ? true : false;
  }
  constructor(location, dimension) {
    NPC_LOCATIONS.push(location);
    const entity = dimension.spawnEntity("minecraft:npc", location);
    const data = {
      dimension: entity.dimension.id,
      x: entity.location.x,
      y: entity.location.y,
      z: entity.location.z
    };
    TABLES.npcs.set(entity.id, data);
    clearNpcLocations();
  }
};

// project/behavior/src/plugins/Anti-Cheat/modules/commands/npc.ts
new Command({
  name: "npc",
  description: "Spawns a npc at your coordinates",
  requires: (player) => getRole(player) == "admin"
}).executes((ctx) => {
  const { x, y, z } = ctx.sender.location;
  new Npc(new Location3(x, y, z), ctx.sender.dimension);
  ctx.reply(`Spawned a verified npc at your current location`);
});

// project/behavior/src/plugins/Anti-Cheat/modules/commands/ping.ts
import { system as system8 } from "@minecraft/server";
async function getServerTPS() {
  let startTime = Date.now();
  let ticks = 0;
  return new Promise((resolve) => {
    let s = system8.runSchedule(() => {
      if (Date.now() - startTime < 1e3) {
        ticks++;
      } else {
        system8.clearRunSchedule(s);
        resolve(ticks);
      }
    });
  });
}
new Command({
  name: "ping",
  description: "Returns the current Ticks Per Second of the servers ping"
}).executes(async (ctx) => {
  let ticks = await getServerTPS();
  ctx.reply(
    `\xA7aCurrent Ticks Per Second: ${ticks > 18 ? "\xA7f{ \xA7aGood" : ticks > 13 ? "\xA7f{ \xA7eOk" : "\xA7f{ \xA7cSevere"} ${ticks} \xA7f}`
  );
});

// project/behavior/src/plugins/Anti-Cheat/modules/commands/region.ts
import { BlockLocation as BlockLocation5 } from "@minecraft/server";
var command = new Command({
  name: "region",
  description: "Create a Region",
  requires: (player) => getRole(player) == "admin"
});
command.literal({
  name: "add",
  description: "Adds a new protection region"
}).int("from_x").int("from_z").int("to_x").int("to_z").executes((ctx, from_x, from_z, to_x, to_z) => {
  new Region(
    { x: from_x, z: from_z },
    { x: to_x, z: to_z },
    ctx.sender.dimension.id
  );
  ctx.reply(
    `Created Region From ${from_x} -64 ${from_z} ${to_x} 320 ${to_z}`
  );
});
command.literal({
  name: "remove",
  description: "Removes a region at the players current position"
}).executes((ctx) => {
  const loc = new BlockLocation5(
    ctx.sender.location.x,
    ctx.sender.location.y,
    ctx.sender.location.z
  );
  const r = Region.removeRegionAtBlockLocation(loc, ctx.sender.dimension.id);
  if (r) {
    ctx.reply(`Removed Region at ${loc.x} ${loc.y} ${loc.z}`);
  } else {
    ctx.reply(`Failed to find/remove region at ${loc.x} ${loc.y} ${loc.z}`);
  }
});
command.literal({
  name: "removeAll",
  description: "Removes all regions"
}).executes((ctx) => {
  Region.getAllRegions().forEach((r) => r.delete());
  ctx.reply(`Removed All regions`);
});
command.literal({
  name: "list",
  description: "Lists all regions and positions"
}).executes((ctx) => {
  const regions = Region.getAllRegions();
  for (const region of regions) {
    ctx.reply(
      `Region from ${region.from.x}, ${region.from.z} to ${region.to.x}, ${region.to.z} in dimension ${region.dimensionId}`
    );
  }
  if (regions.length == 0)
    return ctx.reply(`No regions have been made yet`);
});
var permission = command.literal({
  name: "permission",
  description: "Handles permissions for regions"
});
permission.literal({
  name: "set",
  description: "Sets a certain permission on the region the player is currently in to a value"
}).array("key", ["doorsAndSwitches", "openContainers", "pvp"]).boolean("value").executes((ctx, key, value) => {
  const region = Region.blockLocationInRegion(
    new BlockLocation5(
      ctx.sender.location.x,
      ctx.sender.location.y,
      ctx.sender.location.z
    ),
    ctx.sender.dimension.id
  );
  if (!region)
    return ctx.reply(`You are not in a region`);
  region.changePermission(key, value);
  ctx.reply(`Changed permission ${key} to ${value}`);
});
permission.literal({
  name: "list",
  description: "Lists the permissions for the current region"
}).executes((ctx) => {
  const region = Region.blockLocationInRegion(
    new BlockLocation5(
      ctx.sender.location.x,
      ctx.sender.location.y,
      ctx.sender.location.z
    ),
    ctx.sender.dimension.id
  );
  if (!region)
    return ctx.reply(`You are not in a region`);
  ctx.reply(
    `Current region permissions ${JSON.stringify(region.permissions)}`
  );
});
var entityCommands = permission.literal({
  name: "entities",
  description: "Holds the subCommands for adding or removing allowedEntities"
});
entityCommands.literal({
  name: "add",
  description: "Adds a entity to the allowed entities list"
}).string("entity").executes((ctx, entity) => {
  const region = Region.blockLocationInRegion(
    new BlockLocation5(
      ctx.sender.location.x,
      ctx.sender.location.y,
      ctx.sender.location.z
    ),
    ctx.sender.dimension.id
  );
  if (!region)
    return ctx.reply(`You are not in a region`);
  const currentAllowedEntities = region.permissions.allowedEntities;
  currentAllowedEntities.push(entity);
  region.changePermission("allowedEntities", currentAllowedEntities);
  ctx.reply(
    `Added entity ${entity} to the allowed entities of the region your currently standing in`
  );
});
entityCommands.literal({
  name: "remove",
  description: "Removes a entity from the allowed entities in the region"
}).string("entity").executes((ctx, entity) => {
  const region = Region.blockLocationInRegion(
    new BlockLocation5(
      ctx.sender.location.x,
      ctx.sender.location.y,
      ctx.sender.location.z
    ),
    ctx.sender.dimension.id
  );
  if (!region)
    return ctx.reply(`You are not in a region`);
  let currentAllowedEntities = region.permissions.allowedEntities;
  if (!currentAllowedEntities.includes(entity))
    return ctx.reply(
      `The entity ${entity} is not allowed to enter the region`
    );
  currentAllowedEntities = currentAllowedEntities.filter((v) => v != entity);
  region.changePermission("allowedEntities", currentAllowedEntities);
  ctx.reply(
    `Removed entity ${entity} to the allowed entities of the region your currently standing in`
  );
});

// project/behavior/src/types.ts
var ROLES = /* @__PURE__ */ ((ROLES2) => {
  ROLES2[ROLES2["member"] = 0] = "member";
  ROLES2[ROLES2["admin"] = 1] = "admin";
  ROLES2[ROLES2["moderator"] = 2] = "moderator";
  ROLES2[ROLES2["builder"] = 3] = "builder";
  return ROLES2;
})(ROLES || {});

// project/behavior/src/plugins/Anti-Cheat/modules/commands/role.ts
var StringIsNumber = (value) => isNaN(Number(value)) === false;
function ToArray(enumme) {
  return Object.keys(enumme).filter(StringIsNumber).map((key) => enumme[key]);
}
var root6 = new Command({
  name: "role",
  description: "Changes the role for a player",
  requires: (player) => getRole(player) == "admin" || isServerOwner(player)
});
root6.literal({
  name: "set",
  description: "Sets the role for a player"
}).argument(new ArgumentTypes.playerName("playerName")).argument(new ArgumentTypes.array("role", ToArray(ROLES))).executes((ctx, playerName, role) => {
  setRole(playerName, role);
  ctx.reply(`Changed role of ${playerName} to ${role}`);
});
root6.literal({
  name: "get",
  description: "Gets the role of a player"
}).argument(new ArgumentTypes.playerName("playerName")).executes((ctx, playerName) => {
  const role = getRole(playerName);
  ctx.reply(`${playerName} has role: ${role}`);
});
var ownerRoot = root6.literal({
  name: "owner",
  description: "Manages the owner"
});
ownerRoot.literal({
  name: "get",
  description: "Gets the owner of the world"
}).executes((ctx) => {
  const ownerId = getServerOwner();
  const ids = TABLES.ids.collection();
  const ownerName = Object.keys(ids).find((key) => ids[key] === ownerId);
  ctx.reply(`\xA7aServer Owner: ${ownerName} (id: ${ownerId})`);
});
ownerRoot.literal({
  name: "transfer",
  description: "Transfers the owner of the world",
  requires: (player) => isServerOwner(player)
}).argument(new ArgumentTypes.player()).executes((ctx, player) => {
  confirmAction(
    ctx.sender,
    `Are you sure you want to transfer the server ownership to ${player.name}, this action is not reversible!`,
    () => {
      setServerOwner(player);
      ctx.reply(
        `\xA7aSet the server Owner to: ${player.name} (id: ${player.id})`
      );
    }
  );
  ctx.reply(`\xA7aClose chat to confirm`);
});
ownerRoot.literal({
  name: "clear",
  description: "clear's the owner of the world",
  requires: (player) => isServerOwner(player)
}).executes((ctx) => {
  confirmAction(
    ctx.sender,
    "Are you sure you want to clear the server owner, this action is not reversible!",
    () => {
      setServerOwner(null);
      ctx.reply(
        `\xA7aCleared the server owner! run "/reload" or reload world to run "/function start" again!`
      );
    }
  );
  ctx.reply(`\xA7aClose chat to confirm`);
});

// project/behavior/src/lib/Form/Models/ActionForm.ts
import { ActionFormData } from "@minecraft/server-ui";
var ActionForm = class {
  constructor(title, body) {
    this.title = title;
    this.body = body;
    this.form = new ActionFormData();
    if (title)
      this.form.title(title);
    if (body)
      this.form.body(body);
    this.buttons = [];
    this.triedToShow = 0;
  }
  addButton(text2, iconPath = null, callback) {
    this.buttons.push({
      text: text2,
      iconPath,
      callback
    });
    this.form.button(text2, iconPath);
    return this;
  }
  show(player) {
    this.form.show(player).then((response) => {
      if (response.canceled) {
        if (response.cancelationReason == "userBusy") {
          if (this.triedToShow > TIMEOUT_THRESHOLD)
            return player.tell(
              `\xA7cForm Timeout: tried to show form, but you were busy (close chat after running command)`
            );
          this.triedToShow++;
          this.show(player);
        }
        return;
      }
      this.buttons[response.selection].callback?.();
    });
  }
};

// project/behavior/src/lib/Form/Models/ModelForm.ts
import { ModalFormData } from "@minecraft/server-ui";

// project/behavior/src/lib/Form/Models/FormCallback.ts
var FormCallback = class {
  constructor(form, player, callback) {
    this.form = form;
    this.player = player;
    this.callback = callback;
  }
  error(message) {
    new MessageForm("Error", message).setButton1("Return to form", () => {
      this.form.show(this.player, this.callback);
    }).setButton2("Cancel", null).show(this.player);
  }
};

// project/behavior/src/lib/Form/Models/ModelForm.ts
var ModalForm = class {
  constructor(title) {
    this.title = title;
    this.form = new ModalFormData();
    if (title)
      this.form.title(title);
    this.args = [];
  }
  addDropdown(label, options, defaultValueIndex) {
    this.args.push({ type: "dropdown", options });
    this.form.dropdown(label, options, defaultValueIndex);
    return this;
  }
  addSlider(label, minimumValue, maximumValue, valueStep, defaultValue) {
    this.args.push({ type: "slider" });
    this.form.slider(
      label,
      minimumValue,
      maximumValue,
      valueStep,
      defaultValue
    );
    return this;
  }
  addToggle(label, defaultValue) {
    this.args.push({ type: "toggle" });
    this.form.toggle(label, defaultValue);
    return this;
  }
  addTextField(label, placeholderText, defaultValue) {
    this.args.push({ type: "textField" });
    this.form.textField(label, placeholderText, defaultValue);
    return this;
  }
  async show(player, callback) {
    for (let i = 0; i < TIMEOUT_THRESHOLD; i++) {
      let response = await this.form.show(player);
      if (response.cancelationReason == "userBusy")
        continue;
      callback(
        new FormCallback(this, player, callback),
        ...response.formValues.map(
          (v, i2) => this.args[i2].type == "dropdown" ? this.args[i2].options[v] : v
        )
      );
      return;
    }
    return player.tell(
      `\xA7cForm Timeout: tried to show form, but you were busy (close chat after running command)`
    );
  }
};

// project/behavior/src/plugins/Anti-Cheat/modules/forms/settings.ts
function manageBannedItemsForm(player) {
  new ActionForm("Manage Banned Items").addButton("Remove a Banned Item", null, () => {
    removeBannedItemForm(player);
  }).addButton("Ban an item", null, () => {
    addBannedItemForm(player);
  }).show(player);
}
function removeBannedItemForm(player) {
  new ModalForm("Remove Banned Items").addDropdown("Select item to remove", getConfigId("banned_items")).show(player, (ctx, item) => {
    let items = getConfigId("banned_items");
    items = items.filter((p) => p != item);
    setConfigId("banned_items", items);
    player.tell(`Removed Banned item "${item}"`);
  });
}
function addBannedItemForm(player) {
  new ModalForm("Add Banned Item").addTextField("Item Id", "minecraft:string").show(player, (ctx, item) => {
    let items = getConfigId("banned_items");
    if (items.includes(item))
      return ctx.error(`\xA7cItem "${item}" is already banned`);
    items.push(item);
    setConfigId("banned_items", items);
    player.tell(`Banned the item "${item}"`);
  });
}
function manageBannedBlocksForm(player) {
  new ActionForm("Manage Banned Blocks").addButton("Remove a Banned Block", null, () => {
    removeBannedBlockForm(player);
  }).addButton("Ban an block", null, () => {
    addBannedBlockForm(player);
  }).show(player);
}
function removeBannedBlockForm(player) {
  new ModalForm("Remove Banned Block").addDropdown("Select block to remove", getConfigId("banned_blocks")).show(player, (ctx, block) => {
    let blocks = getConfigId("banned_blocks");
    blocks = blocks.filter((p) => p != block);
    setConfigId("banned_blocks", blocks);
    player.tell(`Removed Banned block "${block}"`);
  });
}
function addBannedBlockForm(player) {
  new ModalForm("Add Banned Block").addTextField("Block Id", "minecraft:barrier").show(player, (ctx, block) => {
    let blocks = getConfigId("banned_blocks");
    if (blocks.includes(block))
      return ctx.error(`\xA7cBlock "${block}" is already banned`);
    blocks.push(block);
    setConfigId("banned_blocks", blocks);
    player.tell(`Banned the block "${block}"`);
  });
}
function manageEnchantmentLevelsForm(player) {
  new ModalForm("Manage Enchantment Levels").addDropdown("Enchantment to change", Object.keys(ENCHANTMENTS), 0).addTextField("Level (number)", "5").show(player, (ctx, enchantment, levelString) => {
    if (isNaN(levelString))
      return ctx.error(
        `\xA7c"${levelString}" is not a number, please enter a value like, "3", "9", etc.`
      );
    const level = parseInt(levelString);
    let enchants = getConfigId("enchantments");
    enchants[enchantment] = level;
    setConfigId("enchantments", enchants);
    player.tell(`Set max level for ${enchantment} to ${level}`);
  });
}
function manageAppealLinkForm(player) {
  new ModalForm("Manage Appeal Link").addTextField("Appeal Link", APPEAL_LINK).show(player, (ctx, link) => {
    setConfigId("appealLink", link);
    player.tell(`Changed the servers appeal link to ${link}`);
  });
}

// project/behavior/src/plugins/Anti-Cheat/modules/forms/automod.ts
function showAutoModHomeForm(player) {
  const form = new ActionForm("Manage Protections");
  for (const protection6 of Object.values(PROTECTIONS)) {
    form.addButton(protection6.name, protection6.iconPath, () => {
      showProtectionConfig(protection6, player);
    });
  }
  form.addButton("Back", "textures/ui/arrow_dark_left_stretch.png", () => {
    showHomeForm(player);
  }).show(player);
}
function showProtectionConfig(protection6, player) {
  const data = protection6.getConfig();
  const form = new ModalForm(
    `Manage ${protection6.name} Protection Config`
  ).addToggle("Enabled", data["enabled"]);
  let keys = [];
  for (const [key, value] of Object.entries(protection6.configDefault)) {
    keys.push(key);
    if (typeof value.defaultValue == "boolean") {
      form.addToggle(value.description, data[key]);
    } else if (typeof value.defaultValue == "number") {
      form.addSlider(value.description, 0, 100, 1, data[key]);
    } else {
      form.addTextField(value.description, null, data[key]);
    }
  }
  form.show(player, (ctx, enabled, ...keys2) => {
    if (enabled != data["enabled"]) {
      if (enabled)
        protection6.enable();
      if (!enabled)
        protection6.disable();
    }
    let config = {
      enabled
    };
    for (const [i, key] of Object.keys(protection6.configDefault).entries()) {
      config[key] = keys2[i];
    }
    protection6.setConfig(config);
    player.tell(`Updated config for ${protection6.name}!`);
  });
}

// project/behavior/src/plugins/Anti-Cheat/modules/forms/home.ts
function showHomeForm(player) {
  new ActionForm("Rubedo Settings").addButton("Auto Mod", "textures/ui/permissions_op_crown.png", () => {
    showAutoModHomeForm(player);
  }).addButton("Banned items", "textures/blocks/sculk_shrieker_top.png", () => {
    manageBannedItemsForm(player);
  }).addButton("Banned blocks", "textures/blocks/barrier.png", () => {
    manageBannedBlocksForm(player);
  }).addButton("Enchantments", "textures/items/book_enchanted.png", () => {
    manageEnchantmentLevelsForm(player);
  }).addButton("Appeal Link", "textures/ui/Feedback.png", () => {
    manageAppealLinkForm(player);
  }).show(player);
}

// project/behavior/src/plugins/Anti-Cheat/modules/commands/settings.ts
new Command({
  name: "settings",
  description: "Opens up the settings menu for the player",
  requires: (player) => ["admin", "moderator"].includes(getRole(player))
}).executes((ctx) => {
  showHomeForm(ctx.sender);
  ctx.sender.tell(`\xA7aForm request sent, close chat to continue!`);
});

// project/behavior/src/plugins/Anti-Cheat/modules/commands/vanish.ts
import { world as world8 } from "@minecraft/server";
function vanish(player, say) {
  if (player.hasTag(`spectator`)) {
    player.runCommandAsync(`gamemode c`);
    player.triggerEvent(`removeSpectator`);
    player.removeTag(`spectator`);
    if (!say)
      return;
    world8.say({
      rawtext: [
        {
          translate: "multiplayer.player.joined",
          with: [`\xA7e${player.name}`]
        }
      ]
    });
  } else {
    player.runCommandAsync(`gamemode spectator`);
    player.triggerEvent(`addSpectator`);
    player.addTag(`spectator`);
    if (!say)
      return;
    world8.say({
      rawtext: [
        {
          translate: "multiplayer.player.left",
          with: [`\xA7e${player.name}`]
        }
      ]
    });
  }
}
new Command({
  name: "vanish",
  description: "Toggles Vanish Mode on the sender",
  requires: (player) => getRole(player) == "admin"
}).executes((ctx) => {
  vanish(ctx.sender, false);
}).boolean("say").executes((ctx, say) => {
  vanish(ctx.sender, say);
});

// project/behavior/src/plugins/Anti-Cheat/modules/commands/version.ts
new Command({
  name: "version",
  description: "Get Current Version",
  aliases: ["v"]
}).executes((ctx) => {
  ctx.reply(`Current Rubedo Version: ${VERSION}`);
});

// project/behavior/src/plugins/Anti-Cheat/modules/commands/kick.ts
new Command({
  name: "kick",
  description: "Kicks a player from the game",
  requires: (player) => getRole(player) == "admin"
}).argument(new ArgumentTypes.player()).string("reason").executes((ctx, player, reason) => {
  kick(player, [reason]);
  ctx.reply(`\xA7aKicked ${player.name} from world`);
});

// project/behavior/src/plugins/Anti-Cheat/modules/models/Log.ts
var Log = class {
  constructor(data) {
    this.data = data;
    console.warn(`[LOG]: ${data.message}`);
    TABLES.logs.set(Date.now().toString(), data);
  }
};

// project/behavior/src/plugins/Anti-Cheat/modules/commands/log.ts
function timeDifference(previous) {
  var msPerMinute = 60 * 1e3;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;
  var elapsed = Date.now() - previous;
  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1e3) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return "approximately " + Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return "approximately " + Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return "approximately " + Math.round(elapsed / msPerYear) + " years ago";
  }
}
var root7 = new Command({
  name: "log",
  description: "Manages the log command",
  requires: (player) => getRole(player) == "admin"
});
root7.literal({
  name: "add",
  description: "Adds a new log"
}).string("message").executes((ctx, message) => {
  new Log({ message });
  ctx.reply(`\xA7aAdded new log: ${message}`);
});
root7.literal({
  name: "getAll",
  description: "Gets all logs sorted in descending"
}).int("page").array("order", ["ascending", "descending"]).executes((ctx, page, order) => {
  const allLogs = Object.entries(TABLES.logs.collection()).sort(
    (a, b) => order == "ascending" ? parseInt(b[0]) - parseInt(a[0]) : parseInt(a[0]) - parseInt(b[0])
  );
  if (allLogs.length == 0)
    return ctx.reply(`\xA7cNo Logs have been made!`);
  const maxPages = Math.ceil(allLogs.length / 8);
  if (page > maxPages)
    page = maxPages;
  ctx.reply(
    `\xA72--- Showing logs page ${page} of ${maxPages} (${PREFIX}log getAll <page: int>) ---`
  );
  for (const [key, value] of allLogs.slice(page * 8 - 8, page * 8)) {
    ctx.reply(`${timeDifference(parseInt(key))}: ${value.message}`);
  }
});
root7.literal({
  name: "getPlayersLogs",
  description: "Gets all logs associated with a player"
}).argument(new ArgumentTypes.playerName()).int("page").array("order", ["ascending", "descending"]).executes((ctx, playerName, page, order) => {
  const allLogs = Object.entries(TABLES.logs.collection()).filter((v) => v[1].playerName == playerName).sort(
    (a, b) => order == "ascending" ? parseInt(b[0]) - parseInt(a[0]) : parseInt(a[0]) - parseInt(b[0])
  );
  if (allLogs.length == 0)
    return ctx.reply(`\xA7cNo Logs exists for "${playerName}"!`);
  const maxPages = Math.ceil(allLogs.length / 8);
  if (page > maxPages)
    page = maxPages;
  ctx.reply(
    `\xA72--- Showing logs for "${playerName}" page ${page} of ${maxPages} ---`
  );
  for (const [key, value] of allLogs.slice(page * 8 - 8, page * 8)) {
    ctx.reply(`${timeDifference(parseInt(key))}: ${value.message}`);
  }
});
root7.literal({
  name: "getProtectionLogs",
  description: "Gets all logs associated with a protection"
}).string("protection").int("page").array("order", ["ascending", "descending"]).executes((ctx, protection6, page, order) => {
  const allLogs = Object.entries(TABLES.logs.collection()).filter((v) => v[1].protection == protection6).sort(
    (a, b) => order == "ascending" ? parseInt(b[0]) - parseInt(a[0]) : parseInt(a[0]) - parseInt(b[0])
  );
  if (allLogs.length == 0)
    return ctx.reply(`\xA7cNo Logs exists for protection: "${protection6}"!`);
  const maxPages = Math.ceil(allLogs.length / 8);
  if (page > maxPages)
    page = maxPages;
  ctx.reply(
    `\xA72--- Showing logs for Protection: "${protection6}" page ${page} of ${maxPages} ---`
  );
  for (const [key, value] of allLogs.slice(page * 8 - 8, page * 8)) {
    ctx.reply(`${timeDifference(parseInt(key))}: ${value.message}`);
  }
});
root7.literal({
  name: "clearAll",
  description: "Clears all logs"
}).executes((ctx) => {
  TABLES.logs.clear();
  ctx.reply(`\xA7aCleared All logs!`);
});

// project/behavior/src/plugins/Anti-Cheat/modules/commands/teleport.ts
var root8 = new Command({
  name: "teleport",
  description: "Teleports entities (players, mobs, etc.).",
  aliases: ["tp"],
  requires: (player) => getRole(player) == "admin"
});
root8.argument(new ArgumentTypes.player()).location("destination").executes((ctx, player, destination) => {
  player.addTag("skip-movement-check");
  player.teleport(destination, player.dimension, 0, 0);
  ctx.reply(
    `Teleported ${player.name} to ${destination.x} ${destination.y} ${destination.z}`
  );
});

// project/behavior/src/plugins/Anti-Cheat/modules/managers/ban.ts
forEachValidPlayer((player) => {
  try {
    const banData = TABLES.bans.get(player.id);
    if (!banData)
      return;
    if (banData.expire && banData.expire < Date.now())
      return TABLES.bans.delete(player.id);
    kick(
      player,
      [
        `\xA7cYou have been banned!`,
        `\xA7aReason: \xA7f${banData.reason}`,
        `\xA7fExpiry: \xA7b${banData.expire ? msToTime(banData.expire - Date.now()) : "Forever"}`,
        `\xA7fAppeal at: \xA7b${getConfigId("appealLink")}`
      ],
      () => {
        console.warn(new Error("Failed to kick player"));
        TABLES.bans.delete(player.id);
      }
    );
  } catch (error) {
    console.warn(error + error.stack);
  }
}, 20);

// project/behavior/src/plugins/Anti-Cheat/modules/managers/freeze.ts
import { Location as Location4 } from "@minecraft/server";
forEachValidPlayer((player) => {
  try {
    const freezeData = TABLES.freezes.get(player.id);
    if (!freezeData)
      return player.getComponent("movement").resetToDefaultValue();
    player.getComponent("movement").setCurrent(0);
    player.teleport(
      new Location4(
        freezeData.location.x,
        freezeData.location.y,
        freezeData.location.z
      ),
      DIMENSIONS[freezeData.location.dimension],
      0,
      0
    );
  } catch (error) {
  }
}, 200);

// project/behavior/src/lib/Events/beforeChat.ts
import { world as world9 } from "@minecraft/server";
var CALLBACKS4 = {};
world9.events.beforeChat.subscribe((data) => {
  if (data.message.startsWith(PREFIX))
    return;
  for (const callback of Object.values(CALLBACKS4)) {
    callback.callback(data);
  }
});
var beforeChat = class {
  static subscribe(callback) {
    const key = Date.now();
    CALLBACKS4[key] = { callback };
    return key;
  }
  static unsubscribe(key) {
    delete CALLBACKS4[key];
  }
};

// project/behavior/src/plugins/Anti-Cheat/modules/managers/mute.ts
beforeChat.subscribe((data) => {
  const muteData = Mute.getMuteData(data.sender);
  if (!muteData)
    return;
  if (muteData.expire && muteData.expire < Date.now())
    return TABLES.mutes.delete(data.sender.name);
  data.cancel = true;
  data.sender.tell(text["modules.managers.mute.isMuted"]());
});

// project/behavior/src/plugins/Anti-Cheat/modules/managers/region.ts
import { BlockLocation as BlockLocation6, system as system9, world as world10 } from "@minecraft/server";
system9.runSchedule(() => {
  loadRegionDenys();
}, 6e3);
world10.events.beforeItemUseOn.subscribe((data) => {
  if (["moderator", "admin"].includes(getRole(data.source)))
    return;
  const region = Region.blockLocationInRegion(
    data.blockLocation,
    data.source.dimension.id
  );
  if (!region)
    return;
  const block = data.source.dimension.getBlock(data.blockLocation);
  if (DOORS_SWITCHES.includes(block.typeId) && region.permissions.doorsAndSwitches)
    return;
  if (BLOCK_CONTAINERS.includes(block.typeId) && region.permissions.openContainers)
    return;
  data.cancel = true;
});
world10.events.beforeExplosion.subscribe((data) => {
  for (let i = 0; i < data.impactedBlocks.length; i++) {
    const bL = data.impactedBlocks[i];
    let region = Region.blockLocationInRegion(bL, data.dimension.id);
    if (region)
      return data.cancel = true;
  }
});
world10.events.entityCreate.subscribe(async ({ entity }) => {
  const region = await Region.blockLocationInRegionSync(
    new BlockLocation6(entity.location.x, entity.location.y, entity.location.z),
    entity.dimension.id
  );
  if (!region)
    return;
  if (region.permissions.allowedEntities.includes(entity.typeId))
    return;
  entity.teleport({ x: 0, y: -64, z: 0 }, entity.dimension, 0, 0);
  entity.kill();
});
EntitiesLoad.subscribe(() => {
  system9.runSchedule(async () => {
    for (const region of await Region.getAllRegionsSync()) {
      for (const entity of DIMENSIONS[region.dimensionId].getEntities({ excludeTypes: region.permissions.allowedEntities })) {
        if (!region.entityInRegion(entity))
          continue;
        entity.teleport({ x: 0, y: -64, z: 0 }, entity.dimension, 0, 0);
        entity.kill();
      }
    }
  }, 100);
});
forEachValidPlayer((player) => {
  for (const region of Region.getAllRegions()) {
    if (region.entityInRegion(player)) {
      player.addTag(`inRegion`);
      if (!region.permissions.pvp)
        player.addTag(`region-protected`);
    } else {
      player.removeTag(`inRegion`);
      player.removeTag(`region-protected`);
    }
  }
}, 5);

// project/behavior/src/plugins/Anti-Cheat/modules/events/playerJoin.ts
import { world as world11 } from "@minecraft/server";
world11.events.playerJoin.subscribe(async ({ player }) => {
  await EntitiesLoad.awaitLoad();
  if (isLockedDown() && getRole(player) != "admin")
    return kick(player, text["lockdown.kick.message"]());
  if (Mute.getMuteData(player))
    player.runCommandAsync(`ability @s mute true`);
  if (!TABLES.ids.has(player.name)) {
    TABLES.ids.set(player.name, player.id);
  } else {
    player.addTag("old");
  }
  const roleToSet = ChangePlayerRoleTask.getPlayersRoleToSet(player.name);
  if (roleToSet)
    setRole(player, roleToSet);
});

// project/behavior/src/plugins/Anti-Cheat/modules/pages/see.ts
import {
  Items,
  MinecraftItemTypes as MinecraftItemTypes4,
  world as world12
} from "@minecraft/server";
var FILLABLE_SLOTS = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44
];
var FILLABLE_SLOTS_ENDERCHEST = [
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  37,
  38,
  39,
  40,
  41,
  42,
  43
];
function ViewPlayersFill(entity, page, extras) {
  const container = entity.getComponent(
    "minecraft:inventory"
  ).container;
  for (let i = 0; i < container.size; i++) {
    const slot = page.slots[i];
    if (!slot || !slot.item) {
      container.setItem(i, AIR);
      continue;
    }
    container.setItem(i, slot.item.itemStack);
  }
  for (const [i, player] of [...world12.getPlayers()].entries()) {
    const slot = FILLABLE_SLOTS[i];
    const item = new PageItem(MinecraftItemTypes4.skull, {
      nameTag: player.name,
      data: 3
    });
    container.setItem(slot, item.itemStack);
    page.slots[slot] = {
      item,
      action: (ctx) => {
        ctx.PageAction("moderation:see_inventory", { name: player.name });
      }
    };
  }
}
function ViewPlayerInventoryFill(entity, page, extras) {
  const container = entity.getComponent("minecraft:inventory").container;
  for (let i = 0; i < container.size; i++) {
    const slot = page.slots[i];
    if (!slot || !slot.item) {
      container.setItem(i, AIR);
      continue;
    }
    container.setItem(i, slot.item.itemStack);
  }
  const EnderChestItem = new PageItem(MinecraftItemTypes4.enderChest, {
    nameTag: `\xA7eView \xA7f${extras?.name}\xA7e Ender Chest
\xA7fNote: \xA7cThis will not grab \xA7lANY NBT!\xA7r`
  });
  container.setItem(49, EnderChestItem.itemStack);
  page.slots[49] = {
    item: EnderChestItem,
    action: (ctx) => {
      ctx.PageAction("moderation:see_ender_chest", { name: extras.name });
    }
  };
  const player = [...world12.getPlayers()].find((p) => p.name == extras.name);
  if (!player) {
    const gui = Object.values(CHESTGUIS).find((e2) => e2.entity.id == entity.id);
    gui.despawn();
    player.tell(`"${extras.name}" Could not be found, Gui Crashed`);
  }
  const inventory = player.getComponent("inventory").container;
  let used_slots = 0;
  for (let i = 0; i < inventory.size; i++) {
    const item = inventory.getItem(i);
    const slot = FILLABLE_SLOTS[used_slots];
    used_slots++;
    if (!item) {
      container.setItem(slot, AIR);
      continue;
    }
    container.setItem(slot, item);
    page.slots[slot] = {
      item: new PageItem(
        Items.get(item.typeId),
        { amount: item.amount, data: item.data },
        item
      ),
      action: (ctx) => {
        if (i < 9) {
          player.runCommandAsync(`replaceitem entity @s slot.hotbar ${i} air`);
        } else {
          player.runCommandAsync(
            `replaceitem entity @s slot.inventory ${i - 9} air`
          );
        }
        ctx.GiveAction();
        page.slots[slot] = {
          item: null,
          action: (ctx2) => {
            inventory.addItem(ctx2.getItemAdded());
          }
        };
      }
    };
  }
}
async function ViewPlayerEnderChestFill(entity, page, extras) {
  const container = entity.getComponent("minecraft:inventory").container;
  for (let i = 0; i < container.size; i++) {
    const slot = page.slots[i];
    if (!slot || !slot.item) {
      container.setItem(i, AIR);
      continue;
    }
    container.setItem(i, slot.item.itemStack);
  }
  const player = [...world12.getPlayers()].find((p) => p.name == extras?.name);
  if (!player) {
    const gui = Object.values(CHESTGUIS).find((e2) => e2.entity.id == entity.id);
    gui.despawn();
    player.tell(`"${extras.name}" Could not be found, Gui Crashed`);
  }
  let used_slots = 0;
  const ItemTypes = Object.values(MinecraftItemTypes4);
  for (const item of ItemTypes) {
    try {
      await player.runCommandAsync(
        `testfor @s[hasitem={item=${item.id},location=slot.enderchest}]`
      );
      const ChestGuiItem = new PageItem(item, {
        nameTag: "Note: \xA7l\xA7cThis is not the exact item"
      });
      const slot = FILLABLE_SLOTS_ENDERCHEST[used_slots];
      container.setItem(slot, ChestGuiItem.itemStack);
      page.slots[slot] = {
        item: ChestGuiItem,
        action: (ctx) => {
          ctx.GiveAction();
          page.slots[slot] = null;
        }
      };
      used_slots++;
    } catch (error) {
    }
  }
}
new Page("moderation:see", ViewPlayersFill).setSlots(
  [50],
  new PageItem(MinecraftItemTypes4.arrow, {
    nameTag: "\xA7fBack"
  }),
  (ctx) => {
    ctx.PageAction("home");
  }
).setSlots(
  [48],
  new PageItem(MinecraftItemTypes4.barrier, { nameTag: "\xA7cClose GUI" }),
  (ctx) => {
    ctx.CloseAction();
  }
);
new Page("moderation:see_inventory", ViewPlayerInventoryFill).setSlots(
  [50],
  new PageItem(MinecraftItemTypes4.arrow, {
    nameTag: "\xA7fBack"
  }),
  (ctx) => {
    ctx.PageAction("moderation:see");
  }
).setSlots(
  [48],
  new PageItem(MinecraftItemTypes4.barrier, { nameTag: "\xA7cClose GUI" }),
  (ctx) => {
    ctx.CloseAction();
  }
);
new Page("moderation:see_ender_chest", ViewPlayerEnderChestFill).setSlots(
  [50],
  new PageItem(MinecraftItemTypes4.arrow, {
    nameTag: "\xA7fBack"
  }),
  (ctx) => {
    ctx.PageAction("moderation:see");
  }
).setSlots(
  [48],
  new PageItem(MinecraftItemTypes4.barrier, { nameTag: "\xA7cClose GUI" }),
  (ctx) => {
    ctx.CloseAction();
  }
);

// project/behavior/src/plugins/Anti-Cheat/modules/protections/cbe.ts
import { Player as Player10, MinecraftBlockTypes as MinecraftBlockTypes4 } from "@minecraft/server";

// project/behavior/src/plugins/Anti-Cheat/modules/models/Protection.ts
import { system as system10, world as world13 } from "@minecraft/server";
var Protection = class {
  constructor(name, description, iconPath, isEnabledByDefault) {
    this.name = name;
    this.description = description;
    this.iconPath = iconPath;
    this.isEnabledByDefault = isEnabledByDefault;
    this.name = name;
    this.description = description;
    this.iconPath = iconPath;
    this.configDefault = {};
    this.isEnabled = false;
    this.isEnabledByDefault = isEnabledByDefault;
    this.events = {};
    this.schedules = [];
    this.forEachValidPlayers = [];
    PROTECTIONS[this.name] = this;
  }
  setConfigDefault(data) {
    this.configDefault = data;
    TABLES.protections.hasSync(this.name).then((v) => {
      if (v)
        return;
      let saveData = {
        enabled: true
      };
      for (const key of Object.keys(data)) {
        saveData[key] = data[key].defaultValue;
      }
      TABLES.protections.set(this.name, saveData);
    });
    return this;
  }
  getConfig() {
    let config = TABLES.protections.get(this.name);
    if (!config)
      config = { enabled: this.isEnabled };
    return config;
  }
  async setConfig(data) {
    return TABLES.protections.set(this.name, data);
  }
  triggerChange(enabled) {
    if (enabled) {
      this.isEnabled = true;
      this.onEnableCallback?.();
      for (const [key, value] of Object.entries(this.events)) {
        if (value.triggered)
          continue;
        let callback = world13.events[key].subscribe(
          value.callback
        );
        value.triggered = true;
        value.callback = callback;
      }
      for (const v of this.forEachValidPlayers) {
        if (v.key)
          continue;
        let key = forEachValidPlayer(v.callback, v.delay);
        v.key = key;
      }
      for (const v of this.schedules) {
        if (v.runScheduleId)
          continue;
        let runScheduleId = system10.runSchedule(v.callback);
        v.runScheduleId = runScheduleId;
      }
    } else {
      this.isEnabled = false;
      this.onDisableCallback?.();
      for (const [key, value] of Object.entries(this.events)) {
        if (!value.triggered)
          continue;
        world13.events[key].unsubscribe(value.callback);
        value.triggered = false;
      }
      for (const v of this.forEachValidPlayers) {
        if (!v.key)
          continue;
        clearForEachValidPlayer(v.key);
        v.key = null;
      }
      for (const v of this.schedules) {
        if (!v.runScheduleId)
          continue;
        system10.clearRunSchedule(v.runScheduleId);
        v.runScheduleId = null;
      }
    }
  }
  onEnable(callback) {
    this.onEnableCallback = callback;
    return this;
  }
  onDisable(callback) {
    this.onDisableCallback = callback;
    return this;
  }
  subscribe(id, callback) {
    this.events[id] = {
      callback,
      triggered: false
    };
    return this;
  }
  runSchedule(callback, tickInterval) {
    this.schedules.push({
      callback,
      tickInterval,
      runScheduleId: null
    });
    return this;
  }
  forEachValidPlayer(callback, delay = 0) {
    this.forEachValidPlayers.push({
      callback,
      delay,
      key: null
    });
    return this;
  }
  enable() {
    this.triggerChange(true);
  }
  disable() {
    this.triggerChange(false);
  }
};

// project/behavior/src/plugins/Anti-Cheat/modules/protections/cbe.ts
var CBE_ENTITIES = ["minecraft:command_block_minecart"];
var protection = new Protection(
  "cbe",
  "Stops CBE",
  "textures/blocks/command_block.png",
  true
).setConfigDefault({
  entityCreate: {
    description: "Adds NPC protection",
    defaultValue: true
  },
  banSpawnEggs: {
    description: "If spawn eggs should be banned",
    defaultValue: true
  }
});
protection.subscribe("entityCreate", ({ entity }) => {
  const config = protection.getConfig();
  if (!config.entityCreate)
    return;
  const kill = () => {
    try {
      entity.triggerEvent("despawn");
      entity.kill();
    } catch (error) {
      entity.kill();
    }
  };
  if (CBE_ENTITIES.includes(entity.typeId))
    return kill();
  if (entity.typeId == "minecraft:npc" && !Npc.isValid(entity))
    return kill();
});
protection.subscribe("beforeItemUseOn", (data) => {
  if (!(data.source instanceof Player10))
    return;
  if (["admin", "moderator"].includes(getRole(data.source)))
    return;
  const config = protection.getConfig();
  if (data.item.typeId.endsWith("spawn_egg")) {
    if (!config.banSpawnEggs)
      return;
    const block = data.source.dimension.getBlock(data.blockLocation);
    if (block.typeId == MinecraftBlockTypes4.mobSpawner.id)
      return;
    data.cancel = true;
    data.source.tell(`\xA7c[Rubedo]: You cannot place spawnEggs on the floor!`);
    data.source.playSound(`note.bass`);
  } else {
    if (FORBIDDEN_BLOCKS.includes(data.item.typeId)) {
      data.cancel = true;
      return;
    }
    const BANNED_BLOCKS2 = getConfigId("banned_blocks");
    if (!BANNED_BLOCKS2.includes(data.item.typeId))
      return;
    data.cancel = true;
    new Ban(data.source, null, "Placing Banned Blocks");
  }
});

// project/behavior/src/plugins/Anti-Cheat/modules/protections/crasher.ts
var DISTANCE = 32e4;
new Protection(
  "crasher",
  "Protection against type 1 crasher",
  "textures/ui/servers.png",
  true
).forEachValidPlayer((player) => {
  if (Math.abs(player.location.x) > DISTANCE || Math.abs(player.location.y) > DISTANCE || Math.abs(player.location.z) > DISTANCE) {
    new Ban(player, null, "Crasher detected");
  }
});

// project/behavior/src/plugins/Anti-Cheat/modules/protections/gamemode.ts
import { GameMode as GameMode2, world as world15 } from "@minecraft/server";

// project/behavior/src/plugins/Anti-Cheat/modules/models/PlayerLog.ts
import { world as world14 } from "@minecraft/server";
var PlayerLog = class {
  constructor() {
    this.data = /* @__PURE__ */ new Map();
    this.events = {
      playerLeave: world14.events.playerLeave.subscribe(
        (data) => this.data.delete(data.playerName)
      )
    };
  }
  set(player, value) {
    this.data.set(player.name, value);
  }
  get(player) {
    return this.data.get(player.name);
  }
  delete(player) {
    this.data.delete(player.name);
  }
  clear() {
    this.data.clear();
  }
  playerNames() {
    return [...this.data.keys()];
  }
  includes(player) {
    return this.playerNames().includes(player.name);
  }
};

// project/behavior/src/plugins/Anti-Cheat/modules/protections/gamemode.ts
var ILLEGAL_GAMEMODE = GameMode2.creative;
var ViolationCount = new PlayerLog();
var protection2 = new Protection(
  "gamemode",
  "Blocks illegal gamemode",
  "textures/ui/creative_icon.png",
  true
).setConfigDefault({
  clearPlayer: {
    description: "Whether to clear players inventory.",
    defaultValue: true
  },
  setToSurvival: {
    description: "If player should be set to survival after being flagged.",
    defaultValue: true
  },
  banPlayer: {
    description: "If player should be banned after violation count is met.",
    defaultValue: false
  },
  violationCount: {
    description: "The amount of violations before ban.",
    defaultValue: 0
  }
});
protection2.runSchedule(() => {
  const config = protection2.getConfig();
  for (const player of world15.getPlayers({ gameMode: ILLEGAL_GAMEMODE })) {
    if (["moderator", "admin", "builder"].includes(getRole(player)))
      continue;
    try {
      if (config.setToSurvival)
        player.runCommandAsync(`gamemode s`);
      if (config.clearPlayer)
        player.runCommandAsync(`clear @s`);
    } catch (error) {
    }
    new Log({
      playerName: player.name,
      protection: "Gamemode",
      message: `${player.name} has entered into a illegal gamemode!`
    });
    const count = (ViolationCount.get(player) ?? 0) + 1;
    ViolationCount.set(player, count);
    if (config.banPlayer && count >= config.violationCount)
      new Ban(player, null, "Illegal Gamemode");
  }
}, 20);

// project/behavior/src/lib/Events/beforeBlockBreak.ts
import {
  world as world17,
  Location as Location5,
  system as system12
} from "@minecraft/server";

// project/behavior/src/plugins/Anti-Cheat/modules/managers/containers.ts
import { system as system11, world as world16 } from "@minecraft/server";

// project/behavior/src/plugins/Anti-Cheat/modules/models/BlockInventory.ts
var BlockInventory = class {
  constructor(inventory) {
    this.emptySlotsCount = inventory.emptySlotsCount;
    this.size = inventory.size;
    this.items = [];
    for (let i = 0; i < this.size; i++) {
      this.items[i] = inventory.getItem(i);
    }
  }
  load(block) {
    for (let i = 0; i < block.size; i++) {
      if (!this.items[i])
        continue;
      block.setItem(i, this.items[i]);
    }
  }
};

// project/behavior/src/plugins/Anti-Cheat/modules/managers/containers.ts
var CONTAINER_LOCATIONS = {};
system11.runSchedule(() => {
  CONTAINER_LOCATIONS = {};
  for (const player of world16.getPlayers()) {
    if (player.dimension.id != "minecraft:overworld")
      continue;
    const blockLoc = vector3ToBlockLocation(player.location);
    const pos1 = blockLoc.offset(CHECK_SIZE.x, CHECK_SIZE.y, CHECK_SIZE.z);
    const pos2 = blockLoc.offset(-CHECK_SIZE.x, -CHECK_SIZE.y, -CHECK_SIZE.z);
    for (const location of pos1.blocksBetween(pos2)) {
      if (location.y < -64)
        continue;
      const block = player.dimension.getBlock(location);
      if (!block)
        continue;
      if (!API_CONTAINERS.includes(block.typeId))
        continue;
      CONTAINER_LOCATIONS[JSON.stringify(location)] = new BlockInventory(
        block.getComponent("inventory").container
      );
    }
  }
}, 100);

// project/behavior/src/lib/Events/beforeBlockBreak.ts
var CALLBACKS5 = {};
world17.events.blockBreak.subscribe((data) => {
  for (const callback of Object.values(CALLBACKS5)) {
    callback.callback(
      new BeforeBlockBreakEvent(
        data.block,
        data.brokenBlockPermutation,
        data.dimension,
        data.player
      )
    );
  }
});
var beforeBlockBreak = class {
  static subscribe(callback) {
    const key = Date.now();
    CALLBACKS5[key] = { callback };
    return key;
  }
  static unsubscribe(key) {
    delete CALLBACKS5[key];
  }
};
var BeforeBlockBreakEvent = class {
  constructor(block, brokenBlockPermutation, dimension, player) {
    this.block = block;
    this.brokenBlockPermutation = brokenBlockPermutation;
    this.dimension = dimension;
    this.player = player;
    this.block = block;
    this.brokenBlockPermutation = brokenBlockPermutation;
    this.dimension = dimension;
    this.player = player;
  }
  set cancel(value) {
    this.dimension.getBlock(this.block.location).setPermutation(this.brokenBlockPermutation.clone());
    if (API_CONTAINERS.includes(this.brokenBlockPermutation.type.id)) {
      const OLD_INVENTORY = CONTAINER_LOCATIONS[JSON.stringify(this.block.location)];
      if (OLD_INVENTORY) {
        OLD_INVENTORY.load(this.block.getComponent("inventory").container);
      }
    }
    system12.run(() => {
      [
        ...this.dimension.getEntities({
          maxDistance: 2,
          type: "minecraft:item",
          location: new Location5(
            this.block.location.x,
            this.block.location.y,
            this.block.location.z
          )
        })
      ].forEach((e2) => e2.kill());
    });
  }
};

// project/behavior/src/plugins/Anti-Cheat/modules/protections/nuker.ts
var log = new PlayerLog();
var IMPOSSIBLE_BREAK_TIME = 15;
var VALID_BLOCK_TAGS = [
  "snow",
  "lush_plants_replaceable",
  "azalea_log_replaceable",
  "minecraft:crop",
  "fertilize_area"
];
var IMPOSSIBLE_BREAKS = [
  "minecraft:water",
  "minecraft:flowing_water",
  "minecraft:lava",
  "minecraft:flowing_lava",
  "minecraft:bedrock"
];
var ViolationCount2 = new PlayerLog();
var beforeBlockBreakKey = null;
var protection3 = new Protection(
  "nuker",
  "Blocks block breaking too fast",
  "textures/blocks/dirt.png",
  true
).setConfigDefault({
  banPlayer: {
    description: "If the player should be banned once violation count is met",
    defaultValue: false
  },
  violationCount: {
    description: "Violations before ban",
    defaultValue: 0
  }
});
protection3.onEnable(() => {
  const config = protection3.getConfig();
  beforeBlockBreakKey = beforeBlockBreak.subscribe((data) => {
    if (["moderator", "admin"].includes(getRole(data.player)))
      return;
    if (data.block.getTags().some((tag) => VALID_BLOCK_TAGS.includes(tag)))
      return;
    const old = log.get(data.player);
    log.set(data.player, Date.now());
    if (!old)
      return;
    if (!IMPOSSIBLE_BREAKS.includes(data.block.typeId)) {
      if (old < Date.now() - IMPOSSIBLE_BREAK_TIME)
        return;
      const count = (ViolationCount2.get(data.player) ?? 0) + 1;
      ViolationCount2.set(data.player, count);
      if (config.banPlayer && count >= config.violationCount)
        new Ban(data.player, null, "Using Nuker");
    }
    data.cancel = true;
  });
}).onDisable(() => {
  beforeBlockBreak.unsubscribe(beforeBlockBreakKey);
});

// project/behavior/src/plugins/Anti-Cheat/modules/protections/spam.ts
var previousMessage = new PlayerLog();
var ViolationCount3 = new PlayerLog();
var protection4 = new Protection(
  "spam",
  "Blocks spam in chat",
  "textures/ui/mute_on.png",
  true
).setConfigDefault({
  permMutePlayer: {
    description: "If player should be permanently muted once violation count is met.",
    defaultValue: false
  },
  violationCount: {
    description: "Violation count before permanent mute",
    defaultValue: 0
  },
  repeatedMessages: {
    description: "Blocks repeated messages",
    defaultValue: true
  },
  zalgo: {
    description: "Blocks zalgo",
    defaultValue: true
  }
});
protection4.subscribe("beforeChat", (data) => {
  try {
    if (data.message.startsWith(PREFIX))
      return;
    if (["admin", "moderator"].includes(getRole(data.sender)))
      return;
    const config = protection4.getConfig();
    const isSpam = () => {
      const count = (ViolationCount3.get(data.sender) ?? 0) + 1;
      ViolationCount3.set(data.sender, count);
      if (config.permMutePlayer && count >= config.violationCount)
        new Mute(data.sender, null, "Spamming");
    };
    if (config.repeatedMessages && previousMessage.get(data.sender) == data.message) {
      data.cancel = true;
      isSpam();
      return data.sender.tell(`\xA7cRepeated message detected!`);
    }
    if (config.zalgo && /%CC%/g.test(encodeURIComponent(data.message))) {
      data.cancel = true;
      isSpam();
      return data.sender.tell(
        `\xA7cYou message contains some type of zalgo and cannot be sent!`
      );
    }
    previousMessage.set(data.sender, data.message);
  } catch (error) {
    console.warn(error + error.stack);
  }
});

// project/behavior/src/plugins/Anti-Cheat/modules/protections/unobtainable.ts
var ViolationCount4 = new PlayerLog();
function flag(player, index) {
  const inventory = player.getComponent("inventory").container;
  const item = inventory.getItem(index);
  const data = getConfigId("cbe_config");
  if (data.clearItem)
    inventory.setItem(index, AIR);
  new Log({
    playerName: player.name,
    message: `${player.name} Has obtained a unobtainable item: ${item.typeId}`,
    protection: "unobtainable"
  });
  if (!data.banPlayer)
    return;
  const violations2 = (ViolationCount4.get(player) ?? 0) + 1;
  ViolationCount4.set(player, violations2);
  if (violations2 < data.violationCount)
    return;
  new Ban(player, null, "Possession of Unobtainable item");
}
new Protection(
  "unobtainable",
  "Blocks unobtainable items",
  "textures/blocks/end_portal.png",
  true
).forEachValidPlayer((player) => {
  console.warn(`unobtainable`);
  const BANNED_ITEMS2 = getConfigId("banned_items");
  const inventory = player.getComponent("inventory").container;
  for (let i = 0; i < inventory.size; i++) {
    const item = inventory.getItem(i);
    if (!item)
      continue;
    if (BANNED_ITEMS2.includes(item.typeId))
      return flag(player, i);
    if (FORBIDDEN_ITEMS.includes(item.typeId)) {
      new Log({
        playerName: player.name,
        message: `${player.name} Has obtained a Forbidden item: ${item.typeId}`,
        protection: "unobtainable"
      });
      return inventory.setItem(i, AIR);
    }
    let enchantments = [];
    for (const enchantment of item.getComponent("enchantments").enchantments) {
      const MAX_LEVEL = getMaxEnchantmentLevel(enchantment);
      if (enchantment.level > MAX_LEVEL)
        return flag(player, i);
      if (enchantment.level < 1)
        return flag(player, i);
      if (enchantments.includes(enchantment.type.id))
        return flag(player, i);
      enchantments.push(enchantment.type.id);
    }
  }
});

// project/behavior/src/plugins/Anti-Cheat/modules/protections/nbt.ts
import {
  MinecraftBlockTypes as MinecraftBlockTypes5,
  MinecraftEntityTypes,
  MinecraftItemTypes as MinecraftItemTypes5,
  Player as Player13
} from "@minecraft/server";
var BLOCKS = [
  MinecraftBlockTypes5.chest.id,
  MinecraftBlockTypes5.trappedChest.id,
  MinecraftBlockTypes5.barrel.id,
  MinecraftBlockTypes5.dispenser.id,
  MinecraftBlockTypes5.dropper.id,
  MinecraftBlockTypes5.furnace.id,
  MinecraftBlockTypes5.litFurnace.id,
  MinecraftBlockTypes5.blastFurnace.id,
  MinecraftBlockTypes5.litBlastFurnace.id,
  MinecraftBlockTypes5.smoker.id,
  MinecraftBlockTypes5.litSmoker.id,
  MinecraftBlockTypes5.hopper.id,
  MinecraftBlockTypes5.beehive.id,
  MinecraftBlockTypes5.beeNest.id,
  MinecraftBlockTypes5.mobSpawner.id
];
var CHEST_BOATS = [
  MinecraftItemTypes5.chestBoat.id,
  MinecraftItemTypes5.oakChestBoat.id,
  MinecraftItemTypes5.birchChestBoat.id,
  MinecraftItemTypes5.acaciaChestBoat.id,
  MinecraftItemTypes5.jungleChestBoat.id,
  MinecraftItemTypes5.spruceChestBoat.id,
  MinecraftItemTypes5.darkOakChestBoat.id,
  MinecraftItemTypes5.mangroveChestBoat.id
];
new Protection(
  "nbt",
  "Blocks illegal nbt on items",
  "textures/ui/icon_random.png",
  true
).subscribe("blockPlace", async ({ block }) => {
  if (!BLOCKS.includes(block.typeId))
    return;
  const permutation = block.permutation;
  await block.dimension.runCommandAsync(
    `setblock ${block.x} ${block.y} ${block.z} ${block.typeId}`
  );
  block.setPermutation(permutation);
}).subscribe("beforeItemUseOn", (data) => {
  if (!(data.source instanceof Player13))
    return;
  if (!CHEST_BOATS.includes(data.item.typeId))
    return;
  data.cancel = true;
  data.source.dimension.spawnEntity(
    MinecraftEntityTypes.chestBoat.id,
    data.blockLocation.above()
  );
  if (getGamemode(data.source) == "creative")
    return;
  data.source.getComponent("inventory").container.setItem(data.source.selectedSlot, AIR);
});

// project/behavior/src/plugins/Anti-Cheat/modules/protections/movement.ts
import {
  MinecraftEffectTypes,
  MinecraftItemTypes as MinecraftItemTypes6,
  Player as Player15
} from "@minecraft/server";

// project/behavior/src/lib/Events/onPlayerMove.ts
import { system as system13, world as world18 } from "@minecraft/server";
var CALLBACKS6 = {};
function vector3Equals(from, to) {
  if (from.x != to.x)
    return false;
  if (from.y != to.y)
    return false;
  if (from.z != to.z)
    return false;
  return true;
}
var playerLocation = new PlayerLog();
system13.runSchedule(() => {
  const sendCallback2 = (player, data) => {
    for (const callback of Object.values(CALLBACKS6)) {
      callback.callback(player, data);
    }
  };
  for (const player of world18.getPlayers()) {
    const oldLocation = playerLocation.get(player);
    if (oldLocation) {
      if (vector3Equals(player.location, oldLocation.location)) {
        continue;
      }
    }
    playerLocation.set(player, {
      location: player.location,
      dimension: player.dimension
    });
    if (!oldLocation)
      continue;
    sendCallback2(player, oldLocation);
  }
});
var onPlayerMove = class {
  static subscribe(callback) {
    const key = Date.now();
    CALLBACKS6[key] = { callback };
    return key;
  }
  static unsubscribe(key) {
    delete CALLBACKS6[key];
  }
  static delete(player) {
    playerLocation.delete(player);
  }
};

// project/behavior/src/plugins/Anti-Cheat/config/movement.ts
var MOVEMENT_DISTANCE_THRESHOLD = 0.8;
var MOVEMENT_CONSTANTS = {
  walk: {
    velocity: 0.17,
    distance: 0.23
  },
  run: {
    velocity: 0.19,
    distance: 0.35
  }
};
var SPEED_EFFECT_INCREASE = 0.056;
var ANTI_TP_DISTANCE_THRESHOLD = 10;
var TAGS = ["gliding", "riding"];

// project/behavior/src/plugins/Anti-Cheat/modules/protections/movement.ts
var violations = new PlayerLog();
function distanceBetween(loc1, loc2) {
  return Math.hypot(loc2.x - loc1.x, loc2.z - loc1.z);
}
function getSpeedOffset(player) {
  const speed = player.getEffect(MinecraftEffectTypes.speed)?.amplifier ?? 0;
  return speed * SPEED_EFFECT_INCREASE;
}
function isDistanceFlag(distance, player) {
  const speedIntensity = getSpeedOffset(player);
  const offset = MOVEMENT_CONSTANTS.run.distance + MOVEMENT_DISTANCE_THRESHOLD;
  return distance > speedIntensity + offset;
}
function flag2(player, old) {
  const violationCount = (violations.get(player) ?? 0) + 1;
  violations.set(player, violationCount);
  onPlayerMove.delete(player);
  if (violationCount < 3)
    return;
  player.teleport(
    old.location,
    old.dimension,
    player.rotation.x,
    player.rotation.y
  );
}
var onPlayerMoveSubKey = null;
var protection5 = new Protection(
  "movement",
  "Blocks illegal movements on players",
  "textures/ui/move.png",
  true
).setConfigDefault({
  tpCheck: {
    description: "If teleports should be flagged",
    defaultValue: true
  }
});
protection5.onEnable(() => {
  const config = protection5.getConfig();
  onPlayerMoveSubKey = onPlayerMove.subscribe((player, old) => {
    if (getRole(player) == "admin")
      return;
    if (player.dimension.id != old.dimension.id)
      return;
    if (player.getTags().some((tag) => TAGS.includes(tag)))
      return;
    const distance = distanceBetween(player.location, old.location);
    if (player.hasTag(`skip-movement-check`))
      return player.removeTag(`skip-movement-check`);
    if (distance > ANTI_TP_DISTANCE_THRESHOLD) {
      if (!config.tpCheck)
        return;
      flag2(player, old);
    } else {
      if (!isDistanceFlag(distance, player))
        return;
      flag2(player, old);
    }
  });
}).onDisable(() => {
  onPlayerMove.unsubscribe(onPlayerMoveSubKey);
});
protection5.subscribe("dataDrivenEntityTriggerEvent", (data) => {
  if (!(data.entity instanceof Player15))
    return;
  if (data.id != "on_death")
    return;
  onPlayerMove.delete(data.entity);
});
protection5.subscribe("projectileHit", ({ projectile, source }) => {
  if (projectile.typeId != MinecraftItemTypes6.enderPearl.id)
    return;
  if (!(source instanceof Player15))
    return;
  onPlayerMove.delete(source);
});
protection5.subscribe("itemCompleteCharge", ({ itemStack, source }) => {
  if (itemStack.typeId != MinecraftItemTypes6.chorusFruit.id)
    return;
  if (!(source instanceof Player15))
    return;
  onPlayerMove.delete(source);
});

// project/behavior/src/plugins/Anti-Cheat/modules/events/beforeDataDrivenEntityTriggerEvent.ts
import { MinecraftEffectTypes as MinecraftEffectTypes2, Player as Player16, world as world19 } from "@minecraft/server";
var e = world19.events.beforeDataDrivenEntityTriggerEvent.subscribe((data) => {
  if (!(data.entity instanceof Player16))
    return;
  if (data.id != "rubedo:becomeAdmin")
    return;
  data.entity.removeTag("CHECK_PACK");
  const serverOwnerName = getServerOwnerName();
  if (serverOwnerName) {
    data.entity.playSound("note.bass");
    data.entity.tell(
      `\xA7cFailed to give server owner: "${serverOwnerName}" is already owner!`
    );
    return world19.events.beforeDataDrivenEntityTriggerEvent.unsubscribe(e);
  }
  setRole(data.entity, "admin");
  setServerOwner(data.entity);
  data.entity.addEffect(MinecraftEffectTypes2.blindness, 3, 255, true);
  data.entity.tell(
    `\xA7aYou have now been set as the "owner" of this server. The command "/function start" will not do anything anymore, type "-help" for more information!`
  );
});

// project/behavior/src/plugins/Anti-Cheat/modules/events/worldInitialize.ts
import {
  DynamicPropertiesDefinition,
  MinecraftEntityTypes as MinecraftEntityTypes2,
  world as world20
} from "@minecraft/server";

// project/behavior/src/config/objectives.ts
var OBJECTIVES = [];

// project/behavior/src/plugins/Anti-Cheat/modules/events/worldInitialize.ts
world20.events.worldInitialize.subscribe(({ propertyRegistry }) => {
  let def2 = new DynamicPropertiesDefinition();
  def2.defineString("role", 30);
  propertyRegistry.registerEntityTypeDynamicProperties(
    def2,
    MinecraftEntityTypes2.player
  );
  let def3 = new DynamicPropertiesDefinition();
  def3.defineString("worldsOwner", 100);
  def3.defineBoolean("isLockDown");
  propertyRegistry.registerWorldDynamicProperties(def3);
  for (const obj of OBJECTIVES) {
    world20.scoreboard.addObjective(obj.objective, obj.displayName ?? "");
  }
});

// project/behavior/src/plugins/Anti-Cheat/index.ts
var NPC_LOCATIONS = [];
function clearNpcLocations() {
  NPC_LOCATIONS = [];
}

// project/behavior/src/plugins/import.ts
console.warn(`----- Importing Plugins -----`);

// project/behavior/src/database/index.ts
import {
  DynamicPropertiesDefinition as DynamicPropertiesDefinition2,
  EntityTypes,
  world as world21
} from "@minecraft/server";
world21.events.worldInitialize.subscribe(({ propertyRegistry }) => {
  DIMENSIONS.overworld.runCommandAsync(
    `tickingarea add ${ENTITY_LOCATION.x} ${ENTITY_LOCATION.y} ${ENTITY_LOCATION.z} ${ENTITY_LOCATION.x} ${ENTITY_LOCATION.y} ${ENTITY_LOCATION.z} db true`
  );
  let def = new DynamicPropertiesDefinition2();
  def.defineString("tableName", 30);
  def.defineNumber("index");
  propertyRegistry.registerEntityTypeDynamicProperties(
    def,
    EntityTypes.get(ENTITY_IDENTIFIER)
  );
});

// project/behavior/src/index.ts
console.warn(`---- STARTING RUBEDO ----`);
system14.events.beforeWatchdogTerminate.subscribe((data) => {
  data.cancel = true;
  console.warn(`WATCHDOG TRIED TO CRASH = ${data.terminateReason}`);
});
var AIR = new ItemStack5(MinecraftItemTypes7.stick, 0);
export {
  AIR
};
