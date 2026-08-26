# 3D Subsystem Architecture

## Separation of Concerns
The 3D subsystem is purely a visualization and interaction layer. It listens to state (Zustand) and dispatches intent (e.g., "SeatClicked"), but does not contain business logic.

## Core Components

### 1. Canvas Context
- Wraps the 3D application. Handles lighting, environment, and post-processing.

### 2. Auditorium Manager
- Fetches layout data (seats, coordinates) and renders the structural environment.
- Uses `InstancedMesh` for rendering hundreds of seats efficiently with a single draw call.

### 3. Camera Controls
- Integrates `@react-three/drei` CameraControls.
- Allows global orbit view.
- Provides animated transitions to move the camera to a selected seat's viewpoint (simulating the view of the screen).

### 4. Seat Entity
- Visual representation changes based on state (Available, Held, Booked).
- Booked seats display a 3D avatar.
- Triggers onClick events to Zustand.

### 5. Avatar / Occupants
- Low-poly human models loaded dynamically for booked seats to simulate a crowded theatre.

## State Management Bridge
- A Zustand store (`useSceneStore`) manages the currently selected seat, camera target, and hover states.
- The 3D components reactively update based on this store without triggering expensive React re-renders for the whole app.
