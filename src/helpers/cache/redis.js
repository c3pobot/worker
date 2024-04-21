'use strict'
const log = require('logger')
const { createCluster } = require('redis')
let NUM_NODES = +process.env.NUM_REDIS_CLUSTER_NODES || 2, PORT_NUM = process.env.REDIS_CLUSTER_PORT_NUM || 6379, SET_NAME = process.env.REDIS_CLUSTER_SET_NAME || 'redis-cluster', NAME_SPACE = process.env.REDIS_CLUSTER_NAME_SPACE || 'datastore'
let rootNodes = [], clusterReady
for(let i = 0;i<NUM_NODES;i++) rootNodes.push({ url: `redis://${SET_NAME}-${i}.${NAME_SPACE}:${PORT_NUM}` });
const cluster = createCluster({ rootNodes: rootNodes})
cluster.on('error', (err) => console.log('Redis Cluster Error', err));
const startCluster = async()=>{
  try{
    await cluster.connect();
    checkCluster()
  }catch(e){
    log.error(e)
    setTimeout(startCluster, 5000)
  }
}
const checkCluster = async()=>{
  try{
    await cluster.set('test-key', 'test-value')
    let data = await cluster.get('test-key')
    if(data === 'test-value'){
      clusterReady = true
      log.info(`Redis cluster connection succesful...`)
      await cluster.del('test-key')
      return
    }
    setTimeout(checkCluster, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkCluster, 5000)
  }
}
startCluster()
module.exports.status = ()=>{
  return clusterReady
}
module.exports.set = async(key, value, TTL = 600)=>{
  if(!key || !value || !clusterReady) return
  return await cluster.SET(key, value, { EX: TTL })
}
module.exports.get = async(key)=>{
  if(!key || !clusterReady) return
  return await cluster.GET(key)
}
module.exports.setJSON = async(key, value, TTL = 600)=>{
  if(!key || !value || !clusterReady) return
  return await cluster.SET(key, JSON.stringify(value), { EX: TTL })
}
module.exports.getJSON = async(key)=>{
  if(!key || !clusterReady) return
  let data = await cluster.get(key)
  if(data) return JSON.parse(data)
}
