'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const { dataList } = require('src/helpers/dataList')
const { getUnitCheck, verifyUnit } = require('./helper')


module.exports = async(obj = {}, opt = {})=>{
  let allyCode = opt.allycode?.value?.toString()?.trim()?.replace(/-/g, '')
  if(!allyCode) return { content: 'You did not provide an allyCode'}
  allyCode = +allyCode
  let dObj = (await mongo.find('discordId', { _id: obj.member?.user?.id}))[0]
  if(dObj?.allyCodes?.filter(x=>x.allyCode === allyCode)?.length > 0) return { content: '**'+allyCode+'** is already linked to your account' }
  if(dObj?.allyCodes?.length >= 5) return { content: 'You can not link more than 5 allyCodes...' }

  let pObj = await swgohClient.post('queryPlayer', {allyCode: allyCode.toString()}, null)
  if(!pObj?.allyCode) return { content: `**${allyCode}** is not a valid allyCode` }

  let exists = (await mongo.find('discordId', {'allyCodes.allyCode': allyCode}))[0]
  if(exists?._id == obj.member.user.id) return { content: '**'+allyCode+'** for player **'+pObj.name+'** is already linked to your account'}
  if(!exists){
    await mongo.push('discordId', { _id: obj.member.user.id }, { allyCodes: { allyCode: allyCode, playerId: pObj.playerId, name: pObj.name } })
    return { content :'allyCode **'+allyCode+'** for player **'+pObj.name+'** has been linked to your discordId' }
  }

  let auth = await verifyUnit(pObj.playerId, pObj.rosterUnit.filter(x=>x.relic && x.currentLevel > 50))
  if(auth === 2){
    await mongo.pull('discordId', {'allyCodes.allyCode': allyCode}, { allyCodes: { allyCode: allyCode } })
    await mongo.del('acVerify', {_id: pObj.playerId})
    await mongo.push('discordId', {_id: obj.member.user.id}, {allyCodes: {allyCode: allyCode, playerId: pObj.playerId, name: pObj.name}})
    return { content: 'allyCode **'+allyCode+'** for player **'+pObj.name+'** has been linked to your discordId' }
  }

  let msg2send = { content: 'allyCode **'+allyCode+'** for player **'+pObj.name+'** is already linked to another discordId' }
  let unit = getUnitCheck(pObj.rosterUnit.filter(x=>x.relic && x.currentLevel > 50))
  if(unit){
    let baseId = unit.definitionId.split(':')[0]
    let unitNameKey = dataList?.unitList[baseId]?.name || baseId
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
