import socket
import sys

HOST = "127.0.0.1"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5001

server = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
server.bind((HOST, PORT))
print(f"UDP server listening on {HOST}:{PORT}")

while True:
    try:
        data, addr = server.recvfrom(65535)
    except ConnectionResetError:
        continue
    print(f"Received from {addr}: {data!r}")
    server.sendto(data, addr)
