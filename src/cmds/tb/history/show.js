'use strict'
const mongo = require('mongoclient')
const { getPlayerAC, getGuildId, replyComponent, getImg } = require('src/helpers')

const getMsg = require('./getMsg')

module.exports = async(obj = {}, opt = {})=>{
    return { content: 'Coming soon' }
    let gObj = await getGuildId({ dId: obj.member?.user?.id }, {}, opt)
    if(!gObj?.guildId) return { content: 'Your allyCode is not linked to discordId' }
    
    let tbHistory = (await mongo.find('tbHistory', { _id: gObj.guildId }))[0]
    if(!tbHistory?.results || tbHistory?.results?.length === 0) return { content: 'There is no TB history stored. You must update the history using `/tb history update` which requires android or ea_connect auth linked to the bot.' }

    return await getMsg(obj, opt, tbHistory)
}