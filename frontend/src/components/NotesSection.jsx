import React, { useState, useRef } from "react";

const NotesSection = ({ notes, setNotes, labels, setNotesImage }) => {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith("image/"));

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result]);
        setNotesImage(reader.result);
        console.log("notesImage set:", reader.result);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="flex flex-col h-full w-full border border-gray-300 rounded-xl shadow-lg p-6">
      {/* Top section that grows */}
      <div className="flex flex-col gap-6 flex-grow">
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4">
          {labels.notes}
        </h2>

        <textarea
          rows={6}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="flex-grow w-full px-4 py-3 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 resize-none"
          placeholder={labels.notesPlaceholder}
        />

        <div>
          <button
            onClick={() => fileInputRef.current.click()}
            className="px-5 py-2 bg-sky-500 text-white text-sm rounded-md font-medium hover:bg-sky-600 transition"
          >
            {labels.uploadImage}
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            multiple
            className="hidden"
          />
        </div>
      </div>

      {/* Fixed-size preview grid at the bottom */}
      {images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative group overflow-hidden rounded-md border border-gray-300"
            >
              <img
                src={img}
                alt={`note-${index}`}
                className="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesSection;