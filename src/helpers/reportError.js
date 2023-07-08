'use strict'
module.exports = (err, lines = 3)=>{
  try{
    let msg
    if(err.stack){
      msg = ''
      let stack = err.stack?.split('\n')
      for(let i = 0;i<lines;i++) msg += stack[i]+'\n'
    }
    if(msg){
      console.error(msg)
    }else{
      console.error(err)
    }
  }catch(e){
    console.error(e);
  }
}
