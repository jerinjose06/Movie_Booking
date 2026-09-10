const fs = require('fs');

function update() {
  let content = fs.readFileSync('src/app/booking/[showId]/BookingClient.tsx', 'utf8');

  // Add upcomingShows to props
  content = content.replace(
    'export function BookingClient({ show, initialSeats, userProfile }: any) {',
    'export function BookingClient({ show, initialSeats, userProfile, upcomingShows = [] }: any) {'
  );

  // Add useEffect for clearing selection and date grouping logic
  const dateLogic = `
  const { selectedSeatIds, startTimer, clearSelection } = useBookingStore();
  
  React.useEffect(() => {
    // Clear selection when show ID changes
    clearSelection();
  }, [show.id]);

  // Date and Time Grouping
  const showDatesMap = new Map();
  upcomingShows.forEach((s) => {
    const d = new Date(s.start_time);
    const dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    if (!showDatesMap.has(dateStr)) showDatesMap.set(dateStr, []);
    showDatesMap.get(dateStr).push(s);
  });
  const showDates = Array.from(showDatesMap.keys()).sort();
  
  const activeDateObj = new Date(show.start_time);
  const activeDateStr = new Date(activeDateObj.getTime() - activeDateObj.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(activeDateStr);
  
  const timesForSelectedDate = showDatesMap.get(selectedDate) || [];
`;
  content = content.replace('const { selectedSeatIds, startTimer } = useBookingStore();', dateLogic);

  // Replace the Header section
  const headerRegex = /\{\/\* Header \*\/\}[\s\S]*?<\/div>\s*<\/div>/;
  const newHeader = `{/* Header & Date/Time Selectors */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center gap-4">
          <Link href={\`/movies/\${show.movie_id}\`} className="w-10 h-10 border border-gray-700/50 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors shrink-0">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h1 className="text-2xl font-serif font-bold text-white">{show.movies?.title}</h1>
        </div>
        
        {/* Date Carousel */}
        {showDates.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {showDates.map(dateStr => {
              const [year, month, day] = dateStr.split('-');
              const d = new Date(Number(year), Number(month) - 1, Number(day));
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
              const dayNum = d.toLocaleDateString('en-US', { day: '2-digit' });
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={\`flex flex-col items-center justify-center shrink-0 w-16 h-20 rounded-2xl transition-all font-medium \${isSelected ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'bg-white/10 border border-white/5 text-gray-400 hover:bg-white/20'}\`}
                >
                  <span className="text-[10px] mb-1 uppercase tracking-wider">{dayName}</span>
                  <span className="text-xl font-bold">{dayNum}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Time Pills */}
        {timesForSelectedDate.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {timesForSelectedDate.map((s: any) => {
              const isSelectedShow = s.id === show.id;
              const timeStr = new Date(s.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
              return (
                <button
                  key={s.id}
                  onClick={() => router.push(\`/booking/\${s.id}\`)}
                  className={\`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all text-sm font-medium \${isSelectedShow ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'bg-white/10 border border-white/5 text-gray-300 hover:bg-white/20'}\`}
                >
                  <span>{timeStr}</span>
                  <span className="text-[10px] opacity-75 bg-black/20 px-2 py-0.5 rounded-full">{s.auditoriums?.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>`;
  content = content.replace(headerRegex, newHeader);

  fs.writeFileSync('src/app/booking/[showId]/BookingClient.tsx', content);
  console.log('BookingClient updated');
}
update();
