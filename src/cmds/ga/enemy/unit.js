'use strict'
const swgohClient = require('src/swgohClient')
const getImg = require('src/cmds/p/unit/basic/getImg')

const { getDiscordAC, findUnit } = require('src/helpers')

module.exports = async(obj = {}, opt = {})=>{
  if(obj.confirm?.cancel) return { content: 'command canceled...', components: [] }
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  let allyCode = dObj?.allyCode
  if(!allyCode) return { content: 'Your allyCode is not linked to your discord id' }

  let gaInfo = (await mongo.find('ga', {_id: allyCode.toString()}))[0]
  if(!gaInfo?.currentEnemy) return { content: 'You do not have a GA opponent configured' }

  let unit = opt.unit?.value?.toString()?.trim()
  if(!unit) return { content: 'you did not provide a unit' }

  let uInfo = await findUnit(obj, unit)
  if(uInfo === 'GETTING_CONFIRMATION') return
  if(uInfo?.msg2send) return uInfo.msg2send
  if(!uInfo?.baseId) return { content: `error finding ${unit}`}

  let eObj = await swgohClient.post('fetchGAPlayer', { playerId: gaInfo.currentEnemy, opponent: +allyCode } )
  if(!eObj?.rosterUnit) return { content: 'error getting player data' }

  return await getImg(uInfo, eObj)
}
