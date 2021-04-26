//! IMPORTANT
//todo Change all the promise JSDoc comments


/**
* It tells you if the server is online (if you are going to request more data afterwards use {@link ApiData}'s .online attribute instead)
* @param {String} ip The server's ip or domain name
* @returns {Promise}
* @resolve {Boolean} if the server is offline or the API is not accesible it will be false
* @see api.mcsrv.us
*/

function isOnline(ip){
   return new Promise((resolve,reject)=>{
          request(ip).then((data)=>{
                resolve(data.status.code==200)
          }).catch((err)=>{
                resolve(false)
          });
   }));   
}
/**
* It gives you a {@link ApiData} Object with the information of the specified MC server
* @param {String} ip The server's ip or domain name
* @returns {Promise}
* @resolve {ApiData} The data from the api 
* @reject {Error<"Network Error">} The promise will throw a Network Error if there is a network problem 
* @reject {Error<404>} The api couldn't find the server
* @reject {Error<500>} The api failed 
* @see api.mcsrv.us
*/
function fetchData(ip){
    return Promise((resolve,reject)=>{
         request("api.mcsrv.us/2/"+ip).then(response=>{//todo check if the link is correct
               switch(response.status.code){
                     case 500:
                     case 404:
                           resolve(new Error(response.status.code)
                     break;
                     default:
                           resolve(response.body) //todo Parse data
                     break;
               }
         }).catch((err)=>{
             reject(err)
         })
    });
}
/**
* A cache is an object that is going to cache the request data
* @param {String} ip The server's ip or domain name
* @param {Number} ttlInMs The Time-To-Live in MS
* @param {Boolean} [loadBackup] if a back up needs to be loaded when having an error at getting data (default is true)
* @param {Boolean} [restartTTLWhenError] if the ttl countdown needs to be restarted when having an error at getting data
* @see api.mcsrv.us
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
    * Gets the data from the cache or fetchs it from the server if the ttl countdown end 
    * @returns {Promise} 
    * @resolve {ApiData} The data from the API
    * @rejects {Error} If there is a network error the promise will throw this error, if there is a server side error check the status.code
    */
    getData(){
       if(Date.now()>=(this.lastTime+this.ttl)){
            return new Promise((resolve,reject)=>{
                fetchData(this.ip).then((data)=>{
                    this.data = data;
                    this.lastTime = Date.now();
                    resolve(data)
                }).catch((err)=>{
                    if(!this.loadBackup)this.data = err;
                    if(this.restart)this.lastTime = Date.now();
                    reject(err)
                });
            })
       }
       else return Promise.resolve(this.data);
    }
    /**
    * Forces the cache to fetch data, restarting the ttl countdown 
    * @param {Number} [ip] A new ip the overwrittes the current one
    * @returns {Promise} 
    * @resolve {ApiResponse} The response of the API
    * @rejects {Error} If there is a network error the promis will throw this error, if there is a server side error check the status.code
    */
    forceFetch(ip=this.ip){
         this.ip = ip
         return new Promise((resolve,reject)=>{
                fetchData(this.ip).then((data)=>{
                    this.data = data;
                    this.lastTime = Date.now();
                    resolve(data)
                }).catch((err)=>{
                    if(!this.loadBackup)this.data = err;
                    this.lastTime = Date.now();
                    reject(err)
                });
         });
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
               body:xhr.response,
               headers:{}
           }
           xhr.getAllHeaders().split("\r\n").forEach((h)=>{
               var header = h.split(":")
               response.headers[header[0]] = header[1]
           })
           resolve(response)
        }
        xhr.onerror = ()=>{
           reject(new Error("Network Error"))
        }
        xhr.send(null)
    })
}
/**
* @typedef {Object} ApiResponse
* @attribute {Number} status.code The HTTP Status Code
* @attribute {String} status.text The HTTP Status Text
* @attribute {String} body The requested {@link ApiData} without parsing
* @attribute {Object} headers The HTTP headers
*/

/**
* @typedef {Object} ApiData
*/

module.exports = {Cache:MyCache, isOnline, fetchData, doHTTPRequest:request}
