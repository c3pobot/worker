'use strict'
const mongo = require('mongoclient')
const swgohClient = require('src/swgohClient')
const { getDiscordAC, replyTokenError } = require('src/helpers')
const sorter = require('json-array-sorter')

const getDate = (timestamp)=>{
    let date = new Date(+timestamp)
    return `${+(date.getUTCMonth() || 0) + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`
}
module.exports = async(obj = {}, opt = {}, pObj = {})=>{
    return { content: 'Coming soon' }
    let dObj = await getDiscordAC(obj.member.user.id, opt)
    if(!dObj?.uId || !dObj?.type) return { content: 'You do not have android or ea connect auth linked to your discordId' }

    let gObj = await swgohClient.oauth(obj, 'guild', dObj, {})
    if(gObj === 'GETTING_CONFIRMATION') return
    if(gObj?.error) return await replyTokenError(obj, dObj.allyCode, gObj.error)
    if(!gObj?.data?.guild) return { content: 'Error getting guild data' }

    gObj = gObj.data.guild
    let data = { guildId: gObj.profile?.id, member: {}, name: gObj.profile?.name, results: [] }
    gObj.member?.map(x=>{ data.member[x.playerId] = { playerId: x.playerId, name: x.playerName, gp: +(x.galacticPower || 0), gpShip: +(x.shipGalacticPower || 0), gpChar: +(x.characterGalacticPower || 0) }})
    gObj.territoryBattleResult?.map(x=>{ data.results.push({ defId: x.definitionId, endTime: x.endTime, stats: x.finalStat, stars: x.totalStars, date: getDate(x.endTime) })})
    data.results = sorter([{ column: 'endTime', order: 'descending' }], data.results || [])
    await mongo.set('tbHistory', { _id: data.guildId }, data)
    return { content: 'done' }
}