'use strict'
const { configMaps } = require('helpers/configMaps')
const { mongo, GetOptValue, ReplyMsg } = require('helpers')
const { GetUnitCheck, VerifyUnit } = require('./helper')
const swgohClient = require('swgohClient')
module.exports = async(obj = {}, opt = [])=>{
  try{
    let auth, pOb, exists, unit, msg2send = {content: 'You did not provide an allyCode'}
    let allyCode = GetOptValue(opt, 'allycode')
    let dObj = (await mongo.find('discordId', {_id: obj.member.user.id}))[0]
    if(dObj?.allyCodes?.length > 9){
      await ReplyMsg(obj, { content: 'You already have '+dObj?.allyCodes?.length+'linked to your discordId. You are probably trying to link other guild members which you cannot do.'})
      return
    }
    if(allyCode){
      allyCode = +(allyCode.trim().replace(/-/g, ''))
      msg2send.content = '**'+allyCode+'** is not a valid allyCode'
      pObj = await swgohClient('queryPlayer', { allyCode: allyCode.toString() })
    }
    if(pObj?.playerId){
      exists = (await mongo.find('discordId', {'allyCodes.allyCode': allyCode}))[0]
    }
    if(pObj?.playerId && !exists){
      await mongo.push('discordId', {_id: obj.member.user.id}, {allyCodes: {allyCode: allyCode, playerId: pObj.playerId, name: pObj.name}})
      msg2send.content = 'allyCode **'+allyCode+'** for player **'+pObj.name+'** has been linked to your discordId'
    }
    if(pObj?.playerId && exists?._id == obj.member.user.id){
      await ReplyMsg(obj, { content: '**'+allyCode+'** for player **'+pObj?.name+'** is already linked to your account'})
      return
    }
    if(pObj?.playerId && exists){
      auth = await VerifyUnit(pObj.playerId, pObj.rosterUnit.filter(x=>x.relic && x.currentLevel > 50))
    }
    if(auth === 2){
      await mongo.pull('discordId', {'allyCodes.allyCode': allyCode}, {allyCodes:{allyCode: allyCode}})
      await mongo.del('acVerify', {_id: pObj.playerId})
      await mongo.push('discordId', {_id: obj.member.user.id}, {allyCodes: {allyCode: allyCode, playerId: pObj.playerId, name: pObj.name}})
      msg2send.content = 'allyCode **'+allyCode+'** for player **'+pObj.name+'** has been linked to your discordId'
    }
    if(pObj?.playerId && exists && !auth){
      msg2send.content = 'allyCode **'+allyCode+'** for player **'+pObj.name+'** is already linked to another discordId'
      unit = await GetUnitCheck(pObj.rosterUnit.filter(x=>x.relic && x.currentLevel > 50))
    }
    if(unit){
      let baseId = unit.definitionId.split(':')[0]
      let unitNameKey = configMaps.UnitMap[leader].nameKey
      const tempObj = {
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
    await ReplyMsg(obj, msg2send)
  }catch(e){
    throw(e)
  }
}
