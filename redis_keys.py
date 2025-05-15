import redis

r = redis.from_url("redis://default:U33ZssX0bGou9O7aP2ZZydWN7KVc5ZsV@redis-15815.c322.us-east-1-2.ec2.redns.redis-cloud.com:15815", decode_responses=True)

# List all keys
keys = r.keys('*')
print("All keys:", keys)

# Print each key's contents
for key in keys:
    data_type = r.type(key)
    print(f"\nKey: {key} (type: {data_type})")
    
    if data_type == 'string':
        print("Value:", r.get(key))
    elif data_type == 'hash':
        print("Hash contents:", r.hgetall(key))
    elif data_type == 'set':
        print("Set members:", r.smembers(key))
    elif data_type == 'list':
        print("List elements:", r.lrange(key, 0, -1))
    else:
        print("Unhandled type")