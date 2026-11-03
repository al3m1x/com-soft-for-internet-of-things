# Communication Software for the Internet of Things

Coursework for *Oprogramowanie komunikacyjne dla Internetu Rzeczy* (Communication Software for the
Internet of Things), Gdańsk University of Technology, Faculty of Electronics, Telecommunications and
Informatics, Department of Teleinformatics. Winter semester 2026/27.

## About the course

The course teaches how to write communication software for networked (IoT) devices:

- BSD / WinSock2 sockets: unicast communication over IPv4 and IPv6,
- group communication protocols and multicast with sockets (IPv4 and IPv6),
- formal specification of communicating processes in **SDL** (Specification and Description Language,
  ITU-T Z.100): processes, signals, states, timers.

Grading has three parts of equal weight: lectures (test), labs (four socket-programming tasks) and an
individual project.

## The project: Parcel Locker protocol

The project is an SDL-style specification of a human–machine communication protocol: three
communicating processes, their signal lists and constraints.

**Scenario.** A **Courier** deposits a parcel in a **Parcel Locker**, which sends the **Recipient** an SMS
with a one-time pickup code. The Recipient enters the code and collects the parcel.

| Process | Type | Role |
|---|---|---|
| Courier (`KURIER`) | human | identifies with a courier code, picks a parcel size, closes the locker box |
| Parcel Locker (`PACZKOMAT`) | machine | verifies the courier, assigns a box, issues the pickup code, enforces limits |
| Recipient (`ODBIORCA`) | human | receives the SMS code, enters it, collects the parcel |

**Constraints:** the pickup code is single-use; 3 wrong codes block pickup; the parcel must be collected
within T = 48 h; parcel sizes are S/M/L, and no free box of that size means rejection.

Diagram text, signal names and state names are in Polish, as the course is taught in Polish.

## Repository layout

```
project/   deliverables
  parcel-locker-protocol.pptx / .pdf   2-slide presentation (system diagram + process definitions)
  parcel-locker-system.svg / .jpg      system diagram: processes, signal lists, constraints
  parcel-locker-process.puml / .png    activity diagram of the Parcel Locker process (PlantUML)
src/       generators
  build.js        builds the .pptx (pptxgenjs)
  apply-theme.js  writes the colour palette into the .pptx theme
  make_diagram.py generates the system diagram (SVG, plus PNG/JPG via headless Edge/Chrome)
tools/     local toolchain, not tracked (plantuml.jar, optional portable JRE)
```

The deliverables in `project/` are committed, so you only need the steps below if you want to
regenerate them.

## Setup on a new machine

**1. Clone the repository**

```bash
git clone https://github.com/al3m1x/com-soft-for-internet-of-things.git
cd com-soft-for-internet-of-things
```

**2. Install the prerequisites**

| Tool | Needed for |
|---|---|
| [Node.js](https://nodejs.org) 18+ | building the `.pptx` |
| Python 3 with Pillow (`pip install pillow`) | generating the system diagram |
| Microsoft Edge or Google Chrome | rendering the SVG to PNG/JPG (headless) |
| [LibreOffice](https://www.libreoffice.org) | exporting the `.pptx` to `.pdf` |
| Java 17+ | running PlantUML |

If Java is not installed system-wide, unpack a portable JRE (e.g. Eclipse Temurin from
<https://adoptium.net>) into `tools/jre/` and call its `bin/java` instead of `java` below.

**3. Download PlantUML into `tools/`** (the folder is git-ignored)

```bash
mkdir -p tools && curl -L -o tools/plantuml.jar https://github.com/plantuml/plantuml/releases/latest/download/plantuml.jar
```

On Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force tools; Invoke-WebRequest https://github.com/plantuml/plantuml/releases/latest/download/plantuml.jar -OutFile tools/plantuml.jar
```

**4. Install the JavaScript dependencies**

```bash
npm --prefix src install
```

## Running

Run everything from the repository root.

```bash
# 1. system diagram -> project/parcel-locker-system.svg/.jpg, src/diagram-slide.svg/.png
python src/make_diagram.py

# 2. presentation -> project/parcel-locker-protocol.pptx
node src/build.js

# 3. PDF export (on Windows use "C:\Program Files\LibreOffice\program\soffice.exe" if soffice is not on PATH)
soffice --headless --convert-to pdf --outdir project project/parcel-locker-protocol.pptx

# 4. process diagram -> project/parcel-locker-process.png
java -jar tools/plantuml.jar -charset UTF-8 -tpng project/parcel-locker-process.puml
```

Step 2 uses `src/diagram-slide.png`, which is committed, so step 1 only needs re-running after you change
the diagram. To edit the process diagram interactively, open
`project/parcel-locker-process.puml` in VS Code with the PlantUML extension (it also needs Java).
