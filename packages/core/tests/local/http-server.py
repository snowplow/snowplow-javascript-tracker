import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from http.client import NO_CONTENT
from pprint import pprint


gif_string = b'GIF87a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\xff\xff\xff,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
file_path = os.path.dirname(__file__)

def get_serve(file):
    return os.path.join(file_path, 'serve', file)

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):

    def do_HEAD(self):
        self.send_response(200)
        if (self.path == '/integration.html'):
            self.send_header("Content-type", "text/html")
            self.end_headers()
        else:
            self.send_header("Content-type", "image/gif")
            self.end_headers()


    def do_GET(self):
        """Respond to a GET request."""
        self.send_response(200)
        if (self.path == '/integration.html'):
            self.send_header("Content-type", "text/html")
            self.end_headers()
            f = open(get_serve('integration.html'), "rb")
            body = f.read()
            f.close()
            self.wfile.write(body)
        elif (self.path == '/snowplow.js'):
            self.send_header("Content-type", "text/html")
            self.end_headers()
            f = open(get_serve('snowplow.js'), "rb")
            body = f.read()
            f.close()
            self.wfile.write(body)
        else:
            self.send_header("Content-type", "image/gif")
            self.end_headers()
            self.wfile.write(gif_string)

    def do_POST(self):
        self.send_response(200)
        self.send_header("Content-type", "image/gif")
        self.end_headers()
        self.wfile.write(''.encode())
        #content_len = int(self.headers.get('content-length', 0))
        #post_body = self.rfile.read(content_len)
        #pprint(post_body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', 'null')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()


httpd = HTTPServer(('127.0.0.1', 8000), SimpleHTTPRequestHandler)
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print('User closed server with Ctrl-c')
    sys.exit(0)
