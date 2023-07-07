'use strict'
const Cmds = {}
const MongoCmd = require('./mongo')
const RedisCmd = require('./redis')
const LocalQueCmd = require('./localQue')
const JobCache = require('./jobCache')
Cmds.AddJob = JobCache.addJob
Cmds.apiFetch = require('./apiFetch')
Cmds.AdminNotAuth = require('./adminNotAuth')

Cmds.ButtonPick = require('./buttonPick')

Cmds.CheckBotOwner = require('./checkBotOwner')
Cmds.CheckServerAdmin = require('./checkServerAdmin')
Cmds.ConfirmButton = require('./confirmButton')

Cmds.EnumPerms = require('./enumPerms')

Cmds.FindUnit = require('./findUnit')

Cmds.GetAllyCodeObj = require('./getAllyCodeObj')
Cmds.GetAllyCodeFromDiscordId = require('./getAllyCodeFromDiscordId')
Cmds.GetBotPerms = require('./getBotPerms')
Cmds.GetChannel = DiscordMsg.GetChannel
Cmds.GetGuild = DiscordMsg.GetGuild
Cmds.GetGuildMember = DiscordMsg.GetGuildMember
Cmds.GetScreenShot = require('./getScreenShot')
Cmds.getDiscordAvatarUrl = require('./getDiscordAvatarUrl')
Cmds.GetOptValue = require('./getOptValue')

Cmds.localQue = LocalQueCmd.localQue
Cmds.localQueStatus = LocalQueCmd.localQueStatus

Cmds.mongo = MongoCmd.mongo
Cmds.mongoStatus = MongoCmd.mongoStatus

Cmds.redis = RedisCmd.redis
Cmds.redisStatus = RedisCmd.redisStatus
Cmds.RemoveJob = JobCache.removeJob
Cmds.ReplyButton = require('./replyButton')
Cmds.ReplyError = require('./replyError')
Cmds.ReplyMsg = require('./replyMsg')

Cmds.SendMsg = require('./sendMsg')
Cmds.StatCalc = require('statcalc')

Cmds.TruncateString = require('./truncateString')

module.exports = Cmds
