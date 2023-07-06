'use strict'
const { ReplyError } = require('helpers')
const Cmds = {}
Cmds.show = require('./show')
module.exports = async(obj)=>{
  try{
    let tempCmd = 'show'
    await Cmds[tempCmd](obj, obj.data.options)
  }catch(e){
    console.log(e)
    ReplyError(obj)
  }
}
