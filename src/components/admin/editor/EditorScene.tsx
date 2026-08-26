'use client';

import { Canvas } from '@react-three/fiber';
import { useEditorStore } from '@/store/useEditorStore';
import { EditorControls } from './EditorControls';
import { EditorRoom } from './EditorRoom';
import { EditorSeat } from './EditorSeat';
import { Preload } from '@react-three/drei';

export function EditorScene() {
  const { seats, roomConfig, mode, clearSelection } = useEditorStore();

  return (
    <Canvas 
      camera={{ position: [0, 25, 25], fov: 50 }} 
      className="w-full h-full bg-gray-900"
      onPointerMissed={(e) => {
        if (e.type === 'click') clearSelection();
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1} castShadow />
      
      <EditorRoom config={roomConfig} />

      {seats.map((seat) => (
        <EditorSeat key={seat.id} seat={seat} />
      ))}

      <EditorControls />
      <Preload all />
      <gridHelper args={[100, 100, '#444', '#222']} position={[0, -0.19, 0]} />
    </Canvas>
  );
}
