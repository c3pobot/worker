'use strict'
module.exports = async(res)=>{
  try{
    if(res){
      if (res?.status?.toString().startsWith('5')) {
        throw('Bad status code '+res.status)
      }
      let body

      if (res?.status === 204) {
        body = null
      } else if (res?.headers?.get('Content-Type')?.includes('application/json')) {
        body = await res?.json()
      } else {
        body = await res?.text()
      }
      return {
        status: res?.status,
        body: body
      }
    }
  }catch(e){
    console.error(e);
  }
}
