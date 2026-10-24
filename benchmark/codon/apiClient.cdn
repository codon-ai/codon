NB. export
class. ApiClient do.
constructor. baseUrl,defaultHeaders=O'' do.
(this.baseUrl = baseUrl)
(this.defaultHeaders = defaultHeaders)
end.
async_method. request endpoint,options=O'' do.
{params,headers,...rest} =: options
url =: (new URL endpoint this.baseUrl)
if. params do.
for_of. [key,value] : (Object.entries params) do.
(url.searchParams.set key (String value))
end.
end.
response =: (await (fetch url.toString() O('...';rest;'headers';O('Content-Type';'application/json';'...';this.defaultHeaders;'...';headers))))
if. (! response.ok) do.
throw. (new Error `HTTP Error ${response.status}: ${response.statusText}`)
end.
return. response.json()
end.
method. get endpoint,params do.
return. (this.request endpoint O('method';'GET';'params';params))
end.
method. post endpoint,body do.
return. (this.request endpoint O('method';'POST';'body';(JSON.stringify body)))
end.
end.