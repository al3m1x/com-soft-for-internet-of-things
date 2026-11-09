import socket
import sys

HOST = "127.0.0.1"
message = sys.argv[1] if len(sys.argv) > 1 else "hello"
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 5001

client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
client.settimeout(2)
client.sendto(message.encode(), (HOST, PORT))

try:
    reply, _ = client.recvfrom(65535)
    print(f"Sent: {message!r}, received: {reply.decode()!r}")
except (socket.timeout, ConnectionResetError):
    print(f"Sent: {message!r}, no reply")
client.close()
