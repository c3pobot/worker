'use strict'
const Cmds = {}
const { calcRosterStats, setGameData } = require('./statCalc')
Cmds.apiFetch = require('./apiFetch')
Cmds.fetchGuild = require('./fetchGuild')
Cmds.fetchPlayer = require('./getPlayer')
Cmds.getGuildId = require('./getGuildId')
Cmds.getPlayer = require('./getPlayer')
Cmds.getStatus = require('./getStatus')
Cmds.queryPlayer = require('./queryPlayer')
Cmds.queryPlayerArena = require('./queryPlayerArena')
Cmds.setGameData = setGameData
Cmds.calcRosterStats = calcRosterStats
module.exports = Cmds
