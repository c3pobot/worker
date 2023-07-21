'use strict'
const Cmds = {}
const MongoCmd = require('./mongo')
const RedisCmd = require('./redis')
const JobCache = require('./jobCache')
Cmds.AddJob = JobCache.addJob
Cmds.apiFetch = require('./apiFetch')
Cmds.AdminNotAuth = require('./adminNotAuth')

Cmds.ButtonPick = require('./buttonPick')

Cmds.CheckBotOwner = require('./checkBotOwner')
Cmds.CheckGuide = require('./checkGuide')
Cmds.CheckGuildAdmin = require('./checkGuildAdmin')
Cmds.CheckServerAdmin = require('./checkServerAdmin')
Cmds.ConfirmButton = require('./confirmButton')

Cmds.DeepCopy = require('./deepCopy')
Cmds.DiscordQuery = require('./discordQuery')
Cmds.EnumPerms = require('./enumPerms')

Cmds.FindUnit = require('./findUnit')

Cmds.GetAllyCodeObj = require('./getAllyCodeObj')
Cmds.GetAllyCodeFromDiscordId = require('./getAllyCodeFromDiscordId')
Cmds.GetBotPerms = require('./getBotPerms')
Cmds.getDiscordAvatarUrl = require('./getDiscordAvatarUrl')
Cmds.GetFakeUnit = require('./getFakeUnit')
Cmds.GetGearParts = require('./getGearParts')
Cmds.GetGuildId = require('./getGuildId')
Cmds.GetGuildName = require('./getGuildName')
Cmds.GetNeededGear = require('./getNeededGear')
Cmds.GetNeededRelicMats = require('./getNeededRelicMats')
Cmds.GetOptValue = require('./getOptValue')
Cmds.GetScreenShot = require('./getScreenShot')

Cmds.log = require('logger')

Cmds.ModifyUnit = require('./modifyUnit')
Cmds.mongo = MongoCmd.mongo
Cmds.mongoStatus = MongoCmd.mongoStatus

Cmds.redis = RedisCmd.redis
Cmds.redisStatus = RedisCmd.redisStatus
Cmds.RemoveJob = JobCache.removeJob
Cmds.ReplyButton = require('./replyButton')
Cmds.ReplyError = require('./replyError')
Cmds.ReplyMsg = require('./replyMsg')
Cmds.ReplyTokenError = require('./replyTokenError')
Cmds.SendMsg = require('./sendMsg')
Cmds.StatCalc = require('statcalc')

Cmds.TruncateString = require('./truncateString')

module.exports = Cmds
