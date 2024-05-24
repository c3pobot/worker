'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const gaReport = require('src/cmds/ga/report')

const { getDiscordAC  } = require('src/helpers')

const getPlayerId = async(allyCode)=>{
  if(!allyCode) return
  let data = (await mongo.find('playerIdCache', { allyCode: +allyCode }))[0]
  if(!data?.playerId) data = await swgohClient.post('playerArena', { allyCode : allyCode.toString(), playerDetailsOnly: true })
  return data
}
const getPlayerIds = async(allyCodes = [])=>{
  let i = allyCodes.length, array = []
  while(i--) array.push(getPlayerId(allyCodes[i]))
  let res = await Promise.allSettled(array)
  return res?.filter(x=>x?.value?.playerId)?.map(x=>x.value.playerId)
}
module.exports = async(obj = {}, opt = {})=>{
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  let allyCode = dObj?.allyCode
  if(!allyCode) return { content: 'Your allyCode is not linked to your discord id' }

  let gaInfo = (await mongo.find('ga', {_id: allyCode.toString()}))[0]
  if(!gaInfo) gaInfo = { units: [], enemies: [] }
  if(!gaInfo.units) gaInfo.units = [];
  if(!gaInfo.enemies) gaInfo.enemies = [];
  if(!gaInfo.playerId && dObj.playerId) gaInfo.playerId = dObj.playerId
  let allyCodes = opt.allycodes?.value?.toString()?.trim()?.replace(/-/g, '')?.split(' ')
  if(!allyCodes || allyCodes?.length == 0) return { content: `you did not provide any opponent allyCodes` }

  let availableSpace = 7 - +gaInfo?.enemies?.length
  if(availableSpace == 0 || allyCodes?.length > availableSpace) return { content: `You can only have 7 opponents registered. You currently have **${gaInfo.enemies.length}** and tried to add **${allyCodes.length}**` }

  let playerIds = await getPlayerIds(allyCodes)
  if(!playerIds || playerIds?.length == 0) return { content: `Error getting playerIds from allyCodes ${JSON.stringify(allyCodes)}`}

  let enemies = await swgohClient.post('fetchGAPlayers', { players: playerIds, opponent: dObj.allyCode })
  gaInfo.enemies = enemies?.map(x=>{
    return Object.assign({}, {
      playerId: x.playerId,
      allyCode: x.allyCode,
      name: x.name
    })
  })
  if(!gaInfo?.enemies || gaInfo?.enemies?.length == 0) return { content: 'Error getting ga opponents' }

  gaInfo.currentEnemy = gaInfo.enemies[(gaInfo.enemies.length - 1)].playerId;
  await mongo.set('ga', {_id: dObj.allyCode.toString()}, gaInfo);
  return await gaReport(obj, opt, dObj, gaInfo)
}
