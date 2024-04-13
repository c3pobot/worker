'use strict'
const Cmds = {}
Cmds.embedField = require('./embedField')

Cmds.formatGAMods = = require('./formatGAMods')
Cmds.formatGAOverview = require('./formatGAOverview')
Cmds.formatGAQuality = require('./formatGAQuality')
Cmds.formatGARelics = require('./formatGARelics')
Cmds.formatGAUnitBasic  = require('./formatGAUnitBasic')
Cmds.formatPlayerStat = require('./formatPlayerStat')
Cmds.formatPlayerStats = require('./formatPlayerStats')
Cmds.formatReportGP = require('./formatReportGP')
Cmds.formatReportGuild = require('./formatReportGuild')
Cmds.formatTWRecord  = require('./formatTWRecord')
Cmds.formatReportUnit = require('./formatReportUnit')
Cmds.formatUnit = require('./formatUnit')
Cmds.formatWebUnit = require('./formatWebUnit')
Cmds.formatWebUnitStats = require('./formatWebUnitStats')

Cmds.getIncModsets  = require('./getIncModsets')
Cmds.getLowModPips = require('./getLowModPips')
Cmds.getMissingModLevel = require('./getMissingModLevel')
Cmds.getMissingMods = require('./getMissingMods')
Cmds.getNoMods = require('./getNoMods')

module.exports = Cmds
