'use client';

import { Instances, Instance, Html } from '@react-three/drei';
import { useMemo, useState, useRef } from 'react';
import * as THREE from 'three';
import { mergeBufferGeometries } from 'three-stdlib';
import { type Seat3DData } from '@/utils/seatMapping';
import { useBookingStore } from '@/store/useBookingStore';

interface SeatGroupProps {
  seats: Seat3DData[];
  onSeatClick?: (seatId: number) => void;
}

export function SeatGroup({ seats, onSeatClick }: SeatGroupProps) {
  const { selectedSeatIds, toggleSeatSelection, viewMode, setViewMode, setViewingSeatId, isComparing, addCompareSeat } = useBookingStore();
  const [hoveredSeat, setHoveredSeat] = useState<Seat3DData | null>(null);

  // Define visually distinct materials
  const availableMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.5, metalness: 0.1 }), []); // Emerald
  const bookedMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1f2937', roughness: 0.9, metalness: 0.8 }), []);   // Dark Gray Matte
  const heldMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.6, metalness: 0.2 }), []);     // Amber
  const blockedMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: '#9ca3af', wireframe: true }), []); // Grey wireframe
  
  // Emissive glowing material for selected
  const selectedMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: '#1e3a8a', // Dark Blue
    emissive: '#1e40af', 
    emissiveIntensity: 0.8,
    roughness: 0.2 
  }), []);

  // Merge geometries to create a single complete seat geometry (like football-stadium architecture)
  const completeSeatGeometry = useMemo(() => {
    const back = new THREE.BoxGeometry(0.5, 0.6, 0.1);
    back.translate(0, 0.3, 0.2); // Shifted +0.2 Z to face AWAY from screen

    const bottom = new THREE.BoxGeometry(0.5, 0.1, 0.5);
    // bottom is at 0,0,0

    const armL = new THREE.BoxGeometry(0.1, 0.3, 0.4);
    armL.translate(-0.3, 0.2, 0);

    const armR = new THREE.BoxGeometry(0.1, 0.3, 0.4);
    armR.translate(0.3, 0.2, 0);

    return mergeBufferGeometries([back, bottom, armL, armR]) || new THREE.BoxGeometry();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePointerOver = (e: any, seat: Seat3DData) => {
    e.stopPropagation();
    // eslint-disable-next-line react-hooks/immutability
    document.body.style.cursor = seat.status === 'AVAILABLE' ? 'pointer' : 'default';
    setHoveredSeat(seat);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    // eslint-disable-next-line react-hooks/immutability
    document.body.style.cursor = 'default';
    setHoveredSeat(null);
  };

  const handleClick = (e: any, seat: Seat3DData) => {
    e.stopPropagation();
    if (seat.status === 'AVAILABLE' || selectedSeatIds.includes(seat.id)) {
      if (isComparing) {
        addCompareSeat(seat.id);
      } else {
        const isCurrentlySelected = selectedSeatIds.includes(seat.id);
        
        // Always toggle the seat hold first
        if (onSeatClick) onSeatClick(seat.id);
        else toggleSeatSelection(seat.id);

        // Then jump into the seat preview only if we are selecting it
        if (!isCurrentlySelected) {
          setViewingSeatId(seat.id);
          setViewMode('SEAT');
        }
      }
    }
  };

  // Group seats by material status for InstancedMesh rendering
  const selectedSeats = useMemo(() => seats.filter(s => selectedSeatIds.includes(s.id)), [seats, selectedSeatIds]);
  const availableSeats = useMemo(() => seats.filter(s => s.status === 'AVAILABLE' && !selectedSeatIds.includes(s.id)), [seats, selectedSeatIds]);
  const bookedSeats = useMemo(() => seats.filter(s => s.status === 'BOOKED' && !selectedSeatIds.includes(s.id)), [seats, selectedSeatIds]);
  const heldSeats = useMemo(() => seats.filter(s => s.status === 'HELD' && !selectedSeatIds.includes(s.id)), [seats, selectedSeatIds]);
  const blockedSeats = useMemo(() => seats.filter(s => s.status === 'BLOCKED' && !selectedSeatIds.includes(s.id)), [seats, selectedSeatIds]);

  const pointerDownTime = useRef<number>(0);

  const renderInstances = (seatGroup: Seat3DData[], material: THREE.Material) => {
    if (seatGroup.length === 0) return null;
    return (
      <Instances geometry={completeSeatGeometry} material={material} castShadow receiveShadow>
        {seatGroup.map((seat) => (
          <Instance
            key={`inst-${seat.id}`}
            position={seat.position}
            rotation={seat.rotation}
            color={hoveredSeat?.id === seat.id && seat.status === 'AVAILABLE' ? '#6ee7b7' : undefined}
            onPointerOver={(e) => handlePointerOver(e, seat)}
            onPointerOut={handlePointerOut}
            onPointerDown={(e) => {
              e.stopPropagation();
              pointerDownTime.current = Date.now();
            }}
            onPointerUp={(e) => {
              // A real click is quick (< 250ms) and has low net movement (delta <= 10px)
              // This prevents accidental clicks when dragging to look around and returning to the same spot
              if (e.delta <= 10 && Date.now() - pointerDownTime.current < 250) {
                handleClick(e, seat);
              }
            }}
          />
        ))}
      </Instances>
    );
  };

  return (
    <group>
      {renderInstances(selectedSeats, selectedMaterial)}
      {renderInstances(availableSeats, availableMaterial)}
      {renderInstances(bookedSeats, bookedMaterial)}
      {renderInstances(heldSeats, heldMaterial)}
      {renderInstances(blockedSeats, blockedMaterial)}

      {/* TOOLTIP overlay */}
      {hoveredSeat && (
        <Html 
          position={[hoveredSeat.position[0], hoveredSeat.position[1] + 0.5, hoveredSeat.position[2]]}
          center
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-black/90 text-white p-3 rounded-lg border border-gray-700 shadow-xl min-w-[150px] pointer-events-none select-none backdrop-blur-sm transform translate-x-24 -translate-y-4">
            <div className="font-bold border-b border-gray-700 pb-1 mb-1">
              {hoveredSeat.row_identifier}{hoveredSeat.seat_number}
            </div>
            <div className="text-sm text-gray-300 flex justify-between gap-4">
              <span>Status:</span> 
              <span className={
                hoveredSeat.status === 'AVAILABLE' ? 'text-emerald-400' :
                hoveredSeat.status === 'HELD' ? 'text-amber-400' : 'text-gray-400'
              }>
                {hoveredSeat.status}
              </span>
            </div>
            <div className="text-sm text-gray-300 flex justify-between gap-4">
              <span>Price:</span>
              <span className="text-white">${hoveredSeat.price.toFixed(2)}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
