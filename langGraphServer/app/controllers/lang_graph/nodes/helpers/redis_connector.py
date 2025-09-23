from __future__ import annotations
import asyncio
import re
from typing import TYPE_CHECKING, Any, List, Optional, Pattern
from urllib.parse import urlparse

if TYPE_CHECKING:
    from redis.asyncio.client import Redis as RedisType

class TokenEscaper:
    
    DEFAULT_ESCAPED_CHARS: str = r"[,.<>{}\[\]\\\"\':;!@#$%^&*()\-+=~\/ ]"

    def __init__(self, escape_chars_re: Optional[Pattern] = None):
        if escape_chars_re:
            self.escaped_chars_re = escape_chars_re
        else:
            self.escaped_chars_re = re.compile(self.DEFAULT_ESCAPED_CHARS)

    def escape(self, value: str) -> str:
        if not isinstance(value, str):
            raise TypeError(
                "Value must be a string object for token escaping."
                f"Got type {type(value)}"
            )

        def escape_symbol(match: re.Match) -> str:
            value = match.group(0)
            return f"\\{value}"

        return self.escaped_chars_re.sub(escape_symbol, value)


async def acheck_redis_module_exist(client: RedisType, required_modules: List[dict]) -> None:

    installed_modules = await client.module_list()
    installed_modules = {
        module[b"name"].decode("utf-8"): module for module in installed_modules
    }
    for module in required_modules:
        if module["name"] in installed_modules and int(
            installed_modules[module["name"]][b"ver"]
        ) >= int(module["ver"]):
            return

    error_message = (
        "Redis cannot be used as a vector database without RediSearch >=2.4"
        "Please head to https://redis.io/docs/stack/search/quick_start/"
        "to know more about installing the RediSearch module within Redis Stack."
    )
    raise ValueError(error_message)


async def aget_client(redis_url: str, **kwargs: Any) -> RedisType:
    
    try:
        import redis.asyncio as redis
    except ImportError:
        raise ImportError(
            "Could not import redis python package. "
            "Please install it with `pip install redis>=4.1.0`."
        )

    if redis_url.startswith("redis+sentinel"):
        redis_client = await a_redis_sentinel_client(redis_url, **kwargs)
    elif redis_url.startswith("rediss+sentinel"): 
        kwargs["ssl"] = True
        if "ssl_cert_reqs" not in kwargs:
            kwargs["ssl_cert_reqs"] = "none"
        redis_client = await a_redis_sentinel_client(redis_url, **kwargs)
    else:
        redis_client = redis.from_url(redis_url, **kwargs)
        if await a_check_for_cluster(redis_client):
            await redis_client.close()
            redis_client = await a_redis_cluster_client(redis_url, **kwargs)
    return redis_client


async def a_redis_sentinel_client(redis_url: str, **kwargs: Any) -> RedisType:
  
    import redis.asyncio as redis

    parsed_url = urlparse(redis_url)
    sentinel_list = [(parsed_url.hostname or "localhost", parsed_url.port or 26379)]
    if parsed_url.path:
        path_parts = parsed_url.path.split("/")
        service_name = path_parts[1] or "mymaster"
        if len(path_parts) > 2:
            kwargs["db"] = path_parts[2]
    else:
        service_name = "mymaster"

    sentinel_args = {}
    if parsed_url.password:
        sentinel_args["password"] = parsed_url.password
        kwargs["password"] = parsed_url.password
    if parsed_url.username:
        sentinel_args["username"] = parsed_url.username
        kwargs["username"] = parsed_url.username

    for arg in kwargs:
        if arg.startswith("ssl") or arg == "client_name":
            sentinel_args[arg] = kwargs[arg]

    sentinel_client = redis.Sentinel(
        sentinel_list, sentinel_kwargs=sentinel_args, **kwargs
    )


    try:
        await sentinel_client.execute_command("ping")
    except redis.AuthenticationError as ae:
        if "no password is set" in ae.args[0]:
            sentinel_client = redis.Sentinel(sentinel_list, **kwargs)
        else:
            raise ae

    return sentinel_client.master_for(service_name)


async def a_check_for_cluster(redis_client: RedisType) -> bool:
    import redis.asyncio as redis

    try:
        cluster_info = await redis_client.info("cluster")
        return cluster_info["cluster_enabled"] == 1
    except redis.RedisError:
        return False



if TYPE_CHECKING:
    from redis.client import Redis as RedisType


class TokenEscaper:
    """
    Escape punctuation within an input string.
    """

    # Characters that RediSearch requires us to escape during queries.
    # Source: https://redis.io/docs/stack/search/reference/escaping/#the-rules-of-text-field-tokenization
    DEFAULT_ESCAPED_CHARS: str = r"[,.<>{}\[\]\\\"\':;!@#$%^&*()\-+=~\/ ]"

    def __init__(self, escape_chars_re: Optional[Pattern] = None):
        if escape_chars_re:
            self.escaped_chars_re = escape_chars_re
        else:
            self.escaped_chars_re = re.compile(self.DEFAULT_ESCAPED_CHARS)

    def escape(self, value: str) -> str:
        if not isinstance(value, str):
            raise TypeError(
                "Value must be a string object for token escaping."
                f"Got type {type(value)}"
            )

        def escape_symbol(match: re.Match) -> str:
            value = match.group(0)
            return f"\\{value}"

        return self.escaped_chars_re.sub(escape_symbol, value)


def check_redis_module_exist(client: RedisType, required_modules: List[dict]) -> None:
    """Check if the correct Redis modules are installed."""
    installed_modules = client.module_list()
    installed_modules = {
        module[b"name"].decode("utf-8"): module for module in installed_modules
    }
    for module in required_modules:
        if module["name"] in installed_modules and int(
            installed_modules[module["name"]][b"ver"]
        ) >= int(module["ver"]):
            return
    # otherwise raise error
    error_message = (
        "Redis cannot be used as a vector database without RediSearch >=2.4"
        "Please head to https://redis.io/docs/stack/search/quick_start/"
        "to know more about installing the RediSearch module within Redis Stack."
    )
    raise ValueError(error_message)

def a_redis_cluster_client(redis_url: str, **kwargs: Any) -> RedisType:
    from redis.asyncio.cluster import RedisCluster

    return RedisCluster.from_url(redis_url, **kwargs)  


async def async_redis_client_provider():
    async_client = await aget_client("redis://localhost:6380/0")
    
    return async_client
    
    