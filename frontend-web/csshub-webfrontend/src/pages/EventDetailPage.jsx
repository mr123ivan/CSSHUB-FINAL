import React from 'react';
import { useParams, Link } from 'react-router-dom';

const mockEvents = [
  {
    id: 1,
    title: 'CSS Orientation 2025',
    description: 'Welcoming new members and presenting plans for the school year.',
    date: '2025-05-01',
    image: 'https://source.unsplash.com/featured/?orientation,event',
    price: 100
  },
  {
    id: 2,
    title: 'Tech Talk: AI in 2025',
    description: 'A seminar on emerging AI trends.',
    date: '2025-05-10',
    image: 'https://source.unsplash.com/featured/?technology,ai',
    price: 150
  },
  // ... other events
];

const EventDetailPage = () => {
  const { id } = useParams();
  const event = mockEvents.find((e) => e.id === parseInt(id));

  if (!event) {
    return <div className="p-6 text-red-600">Event not found</div>;
  }

  return (
    <div className="min-h-screen bg-yellow-100 p-6">
      <Link to="/eventpage" className="text-blue-600 underline mb-4 inline-block">
        Back to Events
      </Link>

      <div className="bg-white rounded-lg shadow p-6 flex gap-6">
        <img src={event.image} alt={event.title} className="w-64 h-64 object-cover rounded" />
        <div>
          <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
          <p className="text-gray-600 mb-2">{event.description}</p>
          <p className="text-gray-500 mb-4">Date: {event.date}</p>
          <p className="text-lg font-semibold mb-4">Price: ₱{event.price}</p>
          <button className="px-6 py-2 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-600 transition">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
