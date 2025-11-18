"use client";

import getCalender from "@/app/lib/server/calenderServer";
import { useEffect, useState } from "react";

export default function presentCalender() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await getCalender()
      const data = await res.json();
      setEvents(data);
    }

    load();
  }, []);

  return (
    <div>
      <h2>Google Calendar Events</h2>

      {events.length === 0 && <p>No events found</p>}

      {events.map(event => (
        <div key={event.id}>
          <strong>{event.summary}</strong>
          <br />
          {event.start?.dateTime || event.start?.date}
        </div>
      ))}
    </div>
  );
}
