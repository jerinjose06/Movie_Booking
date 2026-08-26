# Decision Log

## Trial Implementation Constraints
- **Date**: 2026-08-25
- **Decision**: The system will initially be built as a trial implementation.
- **Details**: 
  - We will procedurally generate or manually create a single test theatre with a capacity of precisely 350 seats.
  - The theatre will feature a standard large screen setup.
- **Impact**: Reduces the immediate need for a complex admin layout builder. We can generate the 350 coordinates using a script or basic grid math during the database seeding phase.

## 3D Asset Fidelity
- **Date**: 2026-08-25
- **Decision**: Extremely low-poly placeholder models for human avatars.
- **Details**: 
  - To ensure high 3D performance without complex optimizations, the avatars occupying booked seats will just be simple, abstract shapes resembling a human (e.g., combined basic Three.js primitives like spheres and cylinders) rather than high-fidelity models.
- **Impact**: Eliminates performance bottlenecks related to high polygon counts and heavy texture loading. Instanced meshes of basic shapes will easily maintain 60 FPS even on mobile devices.
