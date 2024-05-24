'use strict'
const { botSettings } = require('src/helpers/botSettings')
module.exports = (opt = {}, default_relic = 5, default_gear = 13)=>{
  let gLevel = +(opt.gear_level?.value || default_gear), rLevel = opt.relic_level?.value || default_relic
  if(rLevel > 0) gLevel = 13
  if(gLevel < 13) rLevel = 0
  if(gLevel > 13) gLevel = 13
  if(rLevel + 2 > (botSettings.maxRelic || 11)) rLevel = (botSettings.maxRelic || 11) - 2
  return { gLevel: gLevel, rLevel: rLevel }
}
