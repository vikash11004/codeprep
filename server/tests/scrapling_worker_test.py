"""Exercise the real Scrapling adapter offline; only the network call is mocked."""
import base64
from pathlib import Path
import runpy
import unittest
from unittest.mock import patch
from curl_cffi import CurlOpt, CurlError
from curl_cffi.requests import Response

worker = runpy.run_path(str(Path(__file__).resolve().parents[1] / "scripts" / "scrapling-worker.py"))
payload = {"url": "https://problem.example/task", "addresses": ["8.8.8.8"]}


class WorkerTests(unittest.TestCase):
    def test_private_and_mismatched_addresses(self):
        for address in ("127.0.0.1", "10.0.0.1", "169.254.169.254", "::1", "::ffff:127.0.0.1", "224.0.0.1"):
            with self.subTest(address=address), self.assertRaises(ValueError):
                worker["connection_options"]({**payload, "addresses": [address]})
        with self.assertRaises(ValueError):
            worker["connection_options"]({"url": "http://127.0.0.1", "addresses": ["8.8.8.8"]})

    def test_ipv6_resolver_syntax(self):
        options = worker["connection_options"]({**payload, "addresses": ["2001:4860:4860::8888", "8.8.8.8"]})
        self.assertEqual(options[CurlOpt.RESOLVE], ["problem.example:443:[2001:4860:4860::8888],8.8.8.8"])

    def test_actual_scrapling_session_preserves_security_options_and_body(self):
        def request(session, method, **kwargs):
            self.assertEqual(method, "GET")
            self.assertEqual(session.curl_options[CurlOpt.RESOLVE], ["problem.example:443:8.8.8.8"])
            self.assertEqual(session.curl_options[CurlOpt.PROXY], "")
            self.assertEqual(session.curl_options[CurlOpt.NOPROXY], "*")
            self.assertEqual(session.curl_options[CurlOpt.FOLLOWLOCATION], 0)
            self.assertEqual(session.curl_options[CurlOpt.PROTOCOLS_STR], "http,https")
            self.assertFalse(session.trust_env)
            self.assertFalse(kwargs["allow_redirects"])
            self.assertTrue(kwargs["verify"])
            self.assertEqual(kwargs["impersonate"], "chrome")
            self.assertLessEqual(kwargs["timeout"], 10)
            kwargs["content_callback"](b"<h1>A problem</h1>")
            response = Response()
            response.status_code = 302
            response.url = payload["url"]
            response.headers = {"Location": "/next", "Content-Type": "text/html; charset=utf-8"}
            return response
        with patch("scrapling.engines.static.CurlSession.request", autospec=True, side_effect=request) as mock:
            result = worker["fetch"](payload)
        self.assertEqual(mock.call_count, 1)
        self.assertEqual(result["status"], 302)
        self.assertEqual(result["location"], "/next")
        self.assertEqual(base64.b64decode(result["body"]), b"<h1>A problem</h1>")

    def test_chunked_or_decompressed_response_stops_at_limit(self):
        def request(_session, _method, **kwargs):
            callback = kwargs["content_callback"]
            self.assertEqual(callback(b"x" * 3_000_000), 3_000_000)
            self.assertEqual(callback(b"x"), 0)
            raise CurlError("write error")
        with patch("scrapling.engines.static.CurlSession.request", autospec=True, side_effect=request) as mock:
            with self.assertRaisesRegex(ValueError, "3 MB"):
                worker["fetch"](payload)
        self.assertEqual(mock.call_count, 1)


if __name__ == "__main__":
    unittest.main()
