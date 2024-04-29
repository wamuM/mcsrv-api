*This Project has been abandoned*<br>
As far as I know the code still works and there are no bugs so you can still use it, but I won't be working on it anymore. There aren't any important features missing but some parts could have a better design.
# mcsrv-api
An **NPM** module that receives data from the ``api.mcsrvstat.us`` API.  

## isOnline(``serverIp``)-->``{Promise}:bool``
The isOnline function allows you to know if a minecraft server is online by using a the status codes of simple http response without any body.
```js
//prints a custom message depending if the server is or is not online
mcsrv.isOnline("jongames.com").then((bool)=>{
  console.log("The server is"+(bool?"":"not")+" online")
})
```
## fetchData(``serverIp``)-->``{Promise}:{ApiData:Object}``
The fetchData function allows you to get the api's information as a response that resolves in an ApiData Object.
```js
//prints the usernames of the online players
mcsrv.fetchData("jongames.com").then((data)=>{
  data.players.list.forEach((username)=>{
      console.log(username);
  });
})
```
## Cache
The module also has a Cache object that lets you easily cache fetchData. 
```js
let cache = new Cache("jongames.com", 5*60*60*1000, true, true); 
let online = cache.getData().players.online; // Gets the cached data
console.log(`There were ${online} player${online==1?'':'s'} online in the last 5 minutes`);
online = cache.forceFetch().players.online; // Ignores the cache time to live and gets new data from the api
console.log(`There are ${online} player${online==1?'':'s'} online right now`);
```

## doHTTPRequest()
An internal function used for HTTP requests that for some reason my previous self decided to expose.

## More Info
You can find and generate more documentation thanks to JSDocs by looking at the source code
