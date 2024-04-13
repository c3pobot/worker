'use strict'
const mongo = require('mongoclient')
const { geOptValue, getUnitName } = require('src/helpers')
const { getUnitCheck, verifyUnit } = require('./helper')
const swgohClient = require('src/swgohClient')

module.exports = async(obj = {}, opt = [])=>{
  let allyCode, msg2send = {content: 'You did not provide an allyCode'}
  allyCode = geOptValue(opt, 'allycode')
  if(!allyCode) return msg2send
  allyCode = +(allyCode.trim().replace(/-/g, ''))
  msg2send.content = '**'+allyCode+'** is not a valid allyCode'
  let pObj = await swgohClient.post('queryPlayer', {allyCode: allyCode.toString()}, null)
  if(!pObj?.allyCode) return msg2send
  let exists = (await mongo.find('discordId', {'allyCodes.allyCode': allyCode}))[0]
  if(exists?._id == obj.member.user.id) return { content: '**'+allyCode+'** for player **'+pObj.name+'** is already linked to your account'}
  if(!exists){
    await mongo.push('discordId', {_id: obj.member.user.id}, {allyCodes: {allyCode: allyCode, playerId: pObj.playerId, name: pObj.name}})
    return { content :'allyCode **'+allyCode+'** for player **'+pObj.name+'** has been linked to your discordId' }
  }
  let auth = await verifyUnit(pObj.playerId, pObj.rosterUnit.filter(x=>x.relic && x.currentLevel > 50))
  if(auth === 2){
    await mongo.pull('discordId', {'allyCodes.allyCode': allyCode}, {allyCodes:{allyCode: allyCode}})
    await mongo.del('acVerify', {_id: pObj.playerId})
    await mongo.push('discordId', {_id: obj.member.user.id}, {allyCodes: {allyCode: allyCode, playerId: pObj.playerId, name: pObj.name}})
    return { content: 'allyCode **'+allyCode+'** for player **'+pObj.name+'** has been linked to your discordId' }
  }
  msg2send.content = 'allyCode **'+allyCode+'** for player **'+pObj.name+'** is already linked to another discordId'
  let unit = getUnitCheck(pObj.rosterUnit.filter(x=>x.relic && x.currentLevel > 50))
  if(unit){
    let baseId = unit.definitionId.split(':')[0]
    let unitNameKey = getUnitName(baseId)
    let tempObj = {
      defId: unit.definitionId,
      mods: unit.equippedStatMod,
      verify: 'add'
    }
    if(tempObj.mods.length > 0) tempObj.verify = 'remove'
    await mongo.set('acVerify', {_id: pObj.playerId}, tempObj)
    msg2send.content += '\nYou can verify you have access to this account by **'+tempObj.verify+'ing** a square and a diamond mod '+(tempObj.verify == 'add' ? 'to':'from')+' **'+(unitNameKey ? unitNameKey:baseId)+'**'
    msg2send.content += ' and then running  this command again.\n'
    msg2send.content +='**Note: This verification expires in ~5 minutes**'
  }
  return msg2send
}
