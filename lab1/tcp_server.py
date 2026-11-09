import socket
import sys

HOST = "127.0.0.1"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5000

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind((HOST, PORT))
server.listen()
print(f"TCP server listening on {HOST}:{PORT}")

while True:
    conn, addr = server.accept()
    print(f"Connected: {addr}")
    try:
        while True:
            data = conn.recv(1024)
            if not data:
                break
            print(f"Received: {data!r}")
            conn.sendall(data)
    except ConnectionError:
        print(f"Connection lost: {addr}")
    conn.close()
    print(f"Disconnected: {addr}")
