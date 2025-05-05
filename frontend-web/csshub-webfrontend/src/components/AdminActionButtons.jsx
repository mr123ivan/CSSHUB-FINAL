import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AddEventModal from './AddEventModal';
import AddMerchModal from './AddMerchModal';
import { FaCalendarPlus, FaTshirt } from 'react-icons/fa';

const AdminActionButtons = ({ onEventAdded, onMerchAdded }) => {
  const navigate = useNavigate();
  const [showEventModal, setShowEventModal] = useState(false);
  const [showMerchModal, setShowMerchModal] = useState(false);
  
  return (
    <>
      <div className="flex flex-wrap gap-6 mb-8">
        <button 
          onClick={() => setShowEventModal(true)} 
          className="flex flex-col items-center justify-center w-48 h-32 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors group"
        >
          <FaCalendarPlus className="text-yellow-500 text-3xl mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-white">Add Event</span>
        </button>
        <button 
          onClick={() => setShowMerchModal(true)} 
          className="flex flex-col items-center justify-center w-48 h-32 bg-gray-800 rounded-lg shadow hover:bg-gray-700 transition-colors group"
        >
          <FaTshirt className="text-yellow-500 text-3xl mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-semibold text-white">Add Merchandise</span>
        </button>
      </div>
      
      {/* Add Event Modal */}
      <AddEventModal 
        isOpen={showEventModal} 
        onClose={() => setShowEventModal(false)} 
        onSuccess={(newEvent) => {
          setShowEventModal(false);
          if (onEventAdded) onEventAdded(newEvent);
          alert('Event added successfully!');
        }} 
      />
      
      {/* Add Merchandise Modal */}
      <AddMerchModal 
        isOpen={showMerchModal} 
        onClose={() => setShowMerchModal(false)} 
        onSuccess={(newMerch) => {
          setShowMerchModal(false);
          if (onMerchAdded) onMerchAdded(newMerch);
          alert('Merchandise added successfully!');
        }} 
      />
    </>  
  );
};

export default AdminActionButtons;
