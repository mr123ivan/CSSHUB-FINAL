import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';

const GcashPayment = () => {
  const [receipt, setReceipt] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  
  const { merch, event } = location.state || {}; // Now we handle both merch and event
  const item = merch || event; // Choose whichever exists (either merch or event)
  const isMerch = !!merch; // Check if it's merch (true) or event (false)

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceipt(file);
      
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!receipt) {
      setError("Please upload your GCash receipt.");
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      // Convert image to base64 for transmission
      const base64Receipt = await fileToBase64(receipt);
      
      // Pass the item data and receipt to the invoice page
      navigate('/invoice', { 
        state: { 
          item, 
          receiptData: base64Receipt,
          userEmail: activeAccount?.username || 'anonymous@example.com',
          userName: activeAccount?.name || 'Anonymous User'
        } 
      });
    } catch (err) {
      console.error('Error processing receipt:', err);
      setError("Failed to process receipt. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  
  // Helper function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Extract the base64 data part from the data URL
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
    });
  };

  return (
    <div className="min-h-screen bg-yellow-500 flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold text-black mb-2">{item.title || item.name}</h2>

      <div className="bg-black p-6 rounded-lg shadow-md w-full max-w-xs flex flex-col items-center">
        <img
          src="./public/QrcodeCSS.png"
          alt="GCash QR Code"
          className="w-full rounded mb-4"
        />

        <label className="text-white mb-2">Upload GCash Receipt</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4 bg-white p-1 rounded w-full text-sm"
        />
        
        {receiptPreview && (
          <div className="mb-4 w-full">
            <p className="text-white text-sm mb-1">Receipt Preview:</p>
            <img 
              src={receiptPreview} 
              alt="Receipt Preview" 
              className="w-full h-auto max-h-40 object-contain rounded border border-yellow-500"
            />
          </div>
        )}
        
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={isUploading}
          className={`bg-white text-black px-6 py-2 rounded transition font-semibold ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
        >
          {isUploading ? 'Processing...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default GcashPayment;