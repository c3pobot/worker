'use strict'

global.numeral = require('numeral')
global.sorter = require('json-array-sorter')

global.basicCmdAllowedServers = []
global.botSettings = {}
global.debugMsg = +process.env.DEBUG || 0
global.gameData = {}
global.gameDataReady = 0
global.gameVersion = ''
global.poServerList = []
global.syncGuilds = []

global.mongo = require('mongoclient')

global.redis = require('redisclient')
global.webBrowser = 0
global.HP = require('./helpers')
global.Client = require('client-stub');
global.MSG = require('discordmsg')
global.statEnum = require('./statEnum')
