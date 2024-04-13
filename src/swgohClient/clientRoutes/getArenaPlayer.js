'use strict'
const queryArenaPlayer = require('./queryArenaPlayer')
const formatArenaPlayer = require('./format/formatArenaPlayer')
module.exports = async(opt = {})=>{
  try{
    let data = await queryArenaPlayer(opt)
    if(data?.allyCode) return await formatArenaPlayer(data)
  }catch(e){
    throw(e)
  }
}
