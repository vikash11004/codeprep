"""One bounded, DNS-pinned public GET. Node owns redirect validation and parsing."""
import base64
import ipaddress
import json
import sys
from urllib.parse import urlsplit

from curl_cffi import CurlOpt
from scrapling.fetchers import FetcherSession

MAX_BYTES = 3_000_000


def connection_options(payload):
    url = urlsplit(payload["url"])
    if (url.scheme not in ("http", "https") or not url.hostname
            or url.username is not None or url.password is not None
            or url.port not in (None, 80, 443)):
        raise ValueError("Only public HTTP(S) links on standard ports are supported.")
    addresses = [ipaddress.ip_address(value) for value in payload["addresses"]]
    if not addresses or any(not ip.is_global or ip.is_multicast for ip in addresses):
        raise ValueError("Private or reserved addresses are not allowed.")
    # Literal-IP URLs bypass curl's resolver; verify they match the checked address.
    try:
        literal = ipaddress.ip_address(url.hostname)
    except ValueError:
        literal = None
    if literal is not None and literal not in addresses:
        raise ValueError("Address does not match the URL.")
    port = url.port or (443 if url.scheme == "https" else 80)
    hosts = ",".join(f"[{ip}]" if ip.version == 6 else str(ip) for ip in addresses)
    return {
        CurlOpt.RESOLVE: [] if literal else [f"{url.hostname}:{port}:{hosts}"],
        CurlOpt.PROXY: "", CurlOpt.NOPROXY: "*",
        CurlOpt.FOLLOWLOCATION: 0,
        CurlOpt.PROTOCOLS_STR: "http,https",
        CurlOpt.MAXFILESIZE_LARGE: MAX_BYTES,
    }


class PinnedSession(FetcherSession):
    """Scrapling 0.5.1 exposes no public curl-session configuration hook.

    Keep this version-pinned adapter small: install options before the first
    request, and fail closed if upstream changes its session implementation.
    """
    def __init__(self, options):
        super().__init__(impersonate="chrome", stealthy_headers=False,
                         follow_redirects=False, retries=1, verify=True)
        self.connection_options = options

    def __enter__(self):
        client = super().__enter__()
        try:
            client._curl_session.curl_options = self.connection_options
            client._curl_session.trust_env = False
            return client
        except Exception:
            super().__exit__(None, None, None)
            raise


def fetch(payload):
    options = connection_options(payload)
    chunks = []
    length = 0
    overflow = False

    def collect(chunk):
        nonlocal length, overflow
        length += len(chunk)
        if length > MAX_BYTES:
            overflow = True
            return 0  # Abort curl immediately, including decompressed/chunked bodies.
        chunks.append(chunk)
        return len(chunk)

    try:
        with PinnedSession(options) as session:
            response = session.get(payload["url"], timeout=min(10, max(0.1, float(payload.get("timeout", 10)))),
                                   content_callback=collect)
    except Exception:
        if overflow:
            raise ValueError("Page exceeds the 3 MB import limit.") from None
        raise
    headers = {key.lower(): value for key, value in response.headers.items()}
    return {"status": response.status, "body": base64.b64encode(b"".join(chunks)).decode("ascii"),
            "location": headers.get("location", ""), "contentType": headers.get("content-type", ""),
            "encoding": response.encoding}


if __name__ == "__main__":
    try:
        print(json.dumps(fetch(json.loads(sys.stdin.read(65536)))))
    except Exception:
        print(json.dumps({"error": "Scrapling request failed."}))
        sys.exit(1)
