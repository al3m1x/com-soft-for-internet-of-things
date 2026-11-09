# Lab 1: Unicast communication over IPv4

TCP and UDP echo servers and clients in Python (standard library only). The server sends back whatever it
receives. Python's `socket` module wraps the same BSD / WinSock2 calls used in the course:

| | TCP (`SOCK_STREAM`) | UDP (`SOCK_DGRAM`) |
|---|---|---|
| server | `socket` → `bind` → `listen` → `accept` → `recv`/`sendall` | `socket` → `bind` → `recvfrom`/`sendto` |
| client | `socket` → `connect` → `sendall`/`recv` | `socket` → `sendto`/`recvfrom` |

## Files

| File | Default address |
|---|---|
| `tcp_server.py [port]` | `127.0.0.1:5000`, serves one client at a time |
| `tcp_client.py [message] [port]` | sends the message, prints the echo |
| `udp_server.py [port]` | `127.0.0.1:5001` |
| `udp_client.py [message] [port]` | sends one datagram, prints the echo or "no reply" |

## Run

Start each server in its own terminal:

```bash
python tcp_server.py
```

```bash
python udp_server.py
```

Then, in a third terminal:

```bash
python tcp_client.py hello
python udp_client.py hello
```

Stop a server with Ctrl+C (on Windows, if it does not react while waiting, use Ctrl+Break).

## Notes

- TCP is a byte stream: the client half-closes its sending side (`shutdown`) and reads until the server
  closes, so replies of any length arrive in full. UDP keeps message boundaries: one datagram in, one out.
- UDP is unreliable, so the client waits at most 2 seconds for the reply.
- On Windows, sending a datagram to a port nobody listens on makes the next `recvfrom` raise
  `ConnectionResetError` (10054); both UDP programs handle it.
- The task description for this lab was not available when this was written; echo is the simplest reading
  of "a TCP and a UDP server".
