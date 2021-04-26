function isOnline(server){
      
}
function fetchData(server){

}
/**
* A cache is an object that is going to cache the request data
* @param {String} ip The host's ip or domain 
* @param {Number} ttlInMs The Time-To-Live in MS
* @param {Boolean} [loadBackup] if a back up needs to be loaded when having an error at getting data (default is true)
* @param {Boolean} [restartTTLWhenError] if the ttl countdown needs to be restarted when having an error at getting data
*/
class MyCache{
    constructor(ip,ttlInMs,loadBackup,restartTTLWhenError){
        this.ip = ip;
        this.ttl = ttlInMs
        this.loadBackup = loadBackup || true;
        this.restart  = restartTTLWhenError || true;
        this.lastTime = Date.now()
        try{
            this.data = await fetchData(this.ip)
        }catch(e){
            this.data = e;
        }
    }
    /**
    * gets the data from the cache or fetchs it from the server if the ttl countdown end 
    * @returns {Promise} 
    * @resolves 
    * @rejects 
    */
    getData(){
       if(Date.now()>=(this.lastTime+this.ttl)){
            return new Promise((resolve,reject)=>{
                fetchData(this.ip).then((data)=>{
                    resolve(data)
                    this.data = data;
                }).catch((err)=>{
                    if(!this.loadBackup)this.data = err;
                    if(this.restart)this.lastTime = Date.now();
                    reject(err)
                });
            })
       }
       else return Promise.resolve(this.data)
    }
    forceFetch(ip=this.ip){
            
    }
}
function request(ip){
    return Promise((resolve,reject)=>{
        let xhr = new XMlHttpRequest()
        xhr.open("GET",ip,true)
        xhr.onload = ()=>{
           var response = {
               status:{
                  code:xhr.status,
                  text:xhr.statusText
               },
               body:xhr.response
               headers:xhr.getAllHeaders().split("\r\n")
           }
           resolve(response)
        }
        xhr.onerror = ()=>{
           reject(new Error("Network Error"))
        }
        xhr.send(null)
    })
}

module.exports = {Cache:MyCache, isOnline, fetchData}
