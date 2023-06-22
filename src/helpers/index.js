'use strict'
const Cmds = {}
const JobCache = require('./jobCache')
Cmds.AddJob = JobCache.addJob
Cmds.apiFetch = require('./apiFetch')
Cmds.AdminNotAuth = require('./adminNotAuth')
Cmds.ButtonPick = require('./buttonPick')
Cmds.CheckBotOwner = require('./checkBotOwner')
Cmds.CheckServerAdmin = require('./checkServerAdmin')
Cmds.ConfirmButton = require('./confirmButton')
Cmds.DiscordQuery = require('./discordQuery')
Cmds.getDiscordAvatarUrl = require('./getDiscordAvatarUrl')
Cmds.GetOptValue = require('./getOptValue')
Cmds.RemoveJob = JobCache.removeJob
Cmds.ReplyButton = require('./replyButton')
Cmds.ReplyError = require('./replyError')
Cmds.ReplyMsg = require('./replyMsg')
module.exports = Cmds
