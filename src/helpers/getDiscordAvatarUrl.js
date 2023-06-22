'use strict'
const path = require('path')
const baseUrl = 'https://cdn.discordapp.com'
module.exports = (id, icon, type = 'avatars')=>{
  try{
    if(!icon || !id) return;
    let res = baseUrl+'/'+type+'/'+id+'/'+icon
    if(icon.startsWith('a_')){
      res += '.gif'
    }else{
      res += '.webp'
    }
    res += '?size=256'
    return res
  }catch(e){
    console.error(e);
  }
}
