'use strict'
const Cmds = {}
Cmds.apiFetch = require('./apiFetch')
Cmds.fetchGuild = require('./fetchGuild')
Cmds.fetchPlayer = require('./getPlayer')
Cmds.fetchTwGuild = require('./fetchTwGuild')
Cmds.getGuildId = require('./getGuildId')
Cmds.getPlayer = require('./getPlayer')
Cmds.getRawGuild = require('./getRawGuild')
Cmds.getStatus = require('./getStatus')
Cmds.queryPlayer = require('./queryPlayer')
Cmds.queryGuild = require('./queryGuild')
Cmds.queryPlayerArena = require('./queryPlayerArena')
module.exports = Cmds
