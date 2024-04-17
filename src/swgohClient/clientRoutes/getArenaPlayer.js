'use strict'
const queryArenaPlayer = require('./queryArenaPlayer')
const { formatArenaPlayer } = require('src/format')
module.exports = async(opt = {})=>{
  let data = await queryArenaPlayer(opt)
  if(data?.allyCode) return formatArenaPlayer(data)
}
