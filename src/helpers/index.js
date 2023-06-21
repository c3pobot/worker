'use strict'
const Cmds = {}
const JobCache = require('./jobCache')
Cmds.AddJob = JobCache.addJob
Cmds.GetOptValue = require('./getOptValue')
Cmds.RemoveJob = JobCache.removeJob
Cmds.ReplyError = require('./replyError')
Cmds.ReplyMsg = require('./replyMsg')
module.exports = Cmds
