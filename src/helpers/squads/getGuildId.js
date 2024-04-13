'use strict'
const getDiscordAC = require('../getDiscordAC')
const getGuildId = require('../getGuildId')
module.exports = async(obj, opt)=>{
  let dObj = await getDiscordAC(obj.member.user.id, opt)
  if(dObj?.allyCode) return await getGuildId({}, {allyCode: dObj.allyCode})
}
