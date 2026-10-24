NB. export
class. TtlCache do.
store =: (new Map)
constructor. defaultTtlMs=60000 do.
(this.defaultTtlMs = defaultTtlMs)
end.
method. set key,value,ttlMs=this.defaultTtlMs do.
expiresAt =: (Date.now() + ttlMs)
(this.store.set key O('value';value;'expiresAt';expiresAt))
end.
method. get key do.
entry =: (this.store.get key)
if. (! entry) do.
return. undefined
end.
if. (Date.now() > entry.expiresAt) do.
(this.store.delete key)
return. undefined
end.
return. entry.value
end.
method. has key do.
return. ((this.get key) !== undefined)
end.
method. prune  do.
now =: Date.now()
removed =: 0
for_of. [key,entry] : this.store.entries() do.
if. (now > entry.expiresAt) do.
(this.store.delete key)
(removed++)
end.
end.
return. removed
end.
get. size do.
return. this.store.size
end.
end.