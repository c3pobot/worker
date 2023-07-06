'use strict'
const Cmds = {}
Cmds.translate = require('./translate')
module.exports = async(obj = {})=>{
  try{
    if(Cmds[obj.type]) return await Cmds[obj.type](obj)
  }catch(e){
    console.error(e);
  }
}
