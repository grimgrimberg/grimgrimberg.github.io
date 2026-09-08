"""Serve the static site locally with consistent module MIME types on Windows."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class SiteHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".js": "text/javascript",
        ".mjs": "text/javascript",
    }


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 8000), SiteHandler).serve_forever()
