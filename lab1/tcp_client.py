import socket
import sys

HOST = "127.0.0.1"
message = sys.argv[1] if len(sys.argv) > 1 else "hello"
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 5000

client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client.connect((HOST, PORT))
client.sendall(message.encode())
client.shutdown(socket.SHUT_WR)

reply = b""
while True:
    chunk = client.recv(1024)
    if not chunk:
        break
    reply += chunk
client.close()

print(f"Sent: {message!r}, received: {reply.decode()!r}")
