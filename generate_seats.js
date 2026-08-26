const fs = require('fs');

const fullRow = Array.from({length: 21}, (_, i) => i + 1);

const rows = {
  'A': { type: 1, seats: [1,2,3,4,5, 8,9,10,11,12,13, 17,18,19,20,21] },
  'B': { type: 2, seats: [...fullRow] },
  'C': { type: 2, seats: [...fullRow] },
  'D': { type: 2, seats: [...fullRow] },
  'E': { type: 2, seats: [...fullRow] },
  'F': { type: 2, seats: [...fullRow] },
  'G': { type: 2, seats: [...fullRow] },
  'H': { type: 2, seats: [...fullRow] },
  'I': { type: 2, seats: [...fullRow] },
  'J': { type: 2, seats: [...fullRow] },
  'K': { type: 2, seats: [...fullRow] },
  'L': { type: 2, seats: [...fullRow] },
  'M': { type: 2, seats: [...fullRow] },
  'N': { type: 2, seats: [...fullRow] },
  'O': { type: 3, seats: [...fullRow] },
};

let sql = `-- Seed Data

-- 1. Create a dummy theatre owner
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, is_super_admin)
VALUES 
('d5d9c72e-0f0e-4340-81f7-e4620f4c2c62', '00000000-0000-0000-0000-000000000000', 'owner@example.com', 'dummy_hash', now(), '{"provider": "email", "providers": ["email"]}', '{}', now(), now(), 'authenticated', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, role, full_name)
VALUES ('d5d9c72e-0f0e-4340-81f7-e4620f4c2c62', 'theatre_owner', 'Alice Owner')
ON CONFLICT (id) DO NOTHING;

-- 2. Theatre
INSERT INTO theatres (id, name, location, owner_id)
VALUES ('11111111-1111-1111-1111-111111111111', 'Starlight Cinema', 'Downtown', 'd5d9c72e-0f0e-4340-81f7-e4620f4c2c62')
ON CONFLICT (id) DO NOTHING;

-- 3. Auditorium
INSERT INTO auditoriums (id, theatre_id, name) OVERRIDING SYSTEM VALUE
VALUES (1, '11111111-1111-1111-1111-111111111111', 'Auditorium 1')
ON CONFLICT (id) DO NOTHING;

-- 4. Seat Types
INSERT INTO seat_types (id, name, base_price) OVERRIDING SYSTEM VALUE VALUES 
(1, 'Recliner', 400.00),
(2, 'Sofa', 160.00),
(3, 'Sofa Bed', 105.00)
ON CONFLICT (id) DO NOTHING;

-- 5. Seat Rows
`;

let rowId = 1;
const rowIds = {};
for (const row of Object.keys(rows)) {
  sql += `INSERT INTO seat_rows (id, auditorium_id, row_name) OVERRIDING SYSTEM VALUE VALUES (${rowId}, 1, '${row}') ON CONFLICT (id) DO NOTHING;\n`;
  rowIds[row] = rowId;
  rowId++;
}

sql += `\n-- 6. Seats\n`;
sql += `INSERT INTO seats (id, row_id, seat_number, seat_type_id, pos_x, pos_y, pos_z) OVERRIDING SYSTEM VALUE VALUES \n`;

let seatId = 1;
const seatValues = [];
for (const [rowName, data] of Object.entries(rows)) {
  for (const num of data.seats) {
    seatValues.push(`(${seatId}, ${rowIds[rowName]}, '${num}', ${data.type}, 0, 0, 0)`);
    seatId++;
  }
}

sql += seatValues.join(',\n') + `\nON CONFLICT (id) DO NOTHING;\n`;

sql += `
-- 7. Movie
INSERT INTO movies (id, title, duration_mins)
VALUES ('22222222-2222-2222-2222-222222222222', 'Inception', 148)
ON CONFLICT (id) DO NOTHING;

-- 8. Show
INSERT INTO shows (id, movie_id, auditorium_id, start_time, end_time, base_price_multiplier)
VALUES ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 1, now() + interval '1 day', now() + interval '1 day 2 hours 28 minutes', 1.0)
ON CONFLICT (id) DO NOTHING;

-- 9. Show Seats
INSERT INTO show_seats (show_id, seat_id, status)
SELECT '33333333-3333-3333-3333-333333333333', id, 'AVAILABLE' FROM seats
ON CONFLICT DO NOTHING;

-- Update sequences
SELECT setval('auditoriums_id_seq', (SELECT MAX(id) FROM auditoriums));
SELECT setval('seat_types_id_seq', (SELECT MAX(id) FROM seat_types));
SELECT setval('seat_rows_id_seq', (SELECT MAX(id) FROM seat_rows));
SELECT setval('seats_id_seq', (SELECT MAX(id) FROM seats));
SELECT setval('show_seats_id_seq', (SELECT MAX(id) FROM show_seats));
`;

fs.writeFileSync('supabase/migrations/20260825000004_seed_data.sql', sql);
console.log('Done generating seed data!');
