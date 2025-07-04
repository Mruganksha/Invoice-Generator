import React, { useState, useRef } from "react";

const InvoiceHeader = ({
  invoiceDate,
  setInvoiceDate,
  dueDate,
  setDueDate,
  invoiceNumber,
  setInvoiceNumber,
  invoiceType,
  labels,
  logo,
  setLogo,
  invoiceTitle,
  setInvoiceTitle,
}) => {
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "image/png") {
      setError("Only PNG images are allowed.");
      return;
    }

    if (file.size > 500 * 1024) {
      setError("File size must be under 500KB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result); // Base64 image string
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const formatDateToDisplay = (isoDate) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
};

const parseDisplayToISO = (displayDate) => {
  const [day, month, year] = displayDate.split("-");
  return `${year}-${month}-${day}`;
};

  return (
    <div className="pl-8 pr-8 pt-4 pb-4 rounded-xl">
      {/* Top Row: Invoice Title & Logo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        {/* Editable Invoice Title */}
        <input
          type="text"
          value={invoiceTitle}
          onChange={(e) => setInvoiceTitle(e.target.value)}
          className="text-4xl font-bold tracking-tight text-blue-800 bg-transparent focus:outline-none border-b-2 border-blue-400 max-w-xs transition-all"
        />

        {/* Logo Upload */}
        <div className="flex flex-col items-center space-y-2">
          <div
            className="w-44 h-24 flex items-center justify-center border-2 border-dashed border-blue-300 rounded-md cursor-pointer overflow-hidden bg-white hover:bg-blue-50 transition"
            onClick={handleClick}
            title="Click to upload PNG logo"
          >
            {logo ? (
              <img
                src={logo}
                alt="Uploaded Logo"
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-blue-500 text-sm">
                <label className="mb-1 font-medium">{labels.uploadLogo}</label>
              </span>
            )}
          </div>
          <input
            type="file"
            accept="image/png"
            ref={fileInputRef}
            onChange={handleLogoChange}
            className="hidden"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
      </div>

      {/* Metadata Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
        <div className="flex flex-col">
           <label className="mb-1 font-medium">{labels.invoiceDate}</label>
  <input
    type="date"
    value={invoiceDate}
    onChange={(e) => setInvoiceDate(e.target.value)}
    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  {invoiceDate && (
    <span className="text-sm text-gray-500 mt-1">
      {new Date(invoiceDate).toLocaleDateString("en-GB")}
    </span>
  )}
        </div>

        <div className="flex flex-col">
           <label className="mb-1 font-medium">{labels.dueDate}</label>
  <input
    type="date"
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  {dueDate && (
    <span className="text-sm text-gray-500 mt-1">
      {new Date(dueDate).toLocaleDateString("en-GB")}
    </span>
  )}
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">{labels.invoiceNumber}</label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="e.g. INV-00123"
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceHeader;
