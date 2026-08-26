import { describe, it, expect } from 'vitest';
import { createTheatre, createAuditorium, createMovie, createShow } from './admin.service';

describe('Admin Service', () => {
  let theatreId: string;
  let auditoriumId: number;
  let movieId: string;

  it('should create a theatre', async () => {
    const ownerId = 'd5d9c72e-0f0e-4340-81f7-e4620f4c2c62'; // existing user from seed
    theatreId = await createTheatre('Test Theatre', 'Test Location', ownerId);
    expect(theatreId).toBeDefined();
    expect(typeof theatreId).toBe('string');
  });

  it('should create an auditorium', async () => {
    expect(theatreId).toBeDefined();
    auditoriumId = await createAuditorium(theatreId, 'Test Auditorium');
    expect(auditoriumId).toBeDefined();
    expect(typeof auditoriumId).toBe('number');
  });

  it('should create a movie', async () => {
    movieId = await createMovie('Test Movie', 120, 'A great test movie');
    expect(movieId).toBeDefined();
  });

  it('should create a show', async () => {
    expect(movieId).toBeDefined();
    expect(auditoriumId).toBeDefined();
    
    const startTime = new Date();
    startTime.setDate(startTime.getDate() + 2); // 2 days from now
    
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 2);
    
    const showId = await createShow(movieId, auditoriumId, startTime.toISOString(), endTime.toISOString(), 1.0);
    expect(showId).toBeDefined();
  });
});
