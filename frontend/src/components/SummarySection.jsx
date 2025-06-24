import React, { useState } from "react";

const SummarySection = ({ subtotal, taxRate, setTaxRate }) => {
  const [showDiscount, setShowDiscount] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);

  const taxAmount = (subtotal * taxRate) / 100;
  const total =
    subtotal - (showDiscount ? discount : 0) + taxAmount + (showShipping ? shipping : 0);

  return (
    <div className="h-full w-full border border-gray-200 rounded-xl shadow-lg p-8 flex flex-col justify-between bg-gradient-to-br from-white to-gray-50">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-blue-800 border-b pb-4">
           Invoice Summary
        </h2>

        <div className="space-y-5 text-sm text-gray-700">
          <SummaryRow label="Subtotal" value={`₹${subtotal.toFixed(2)}`} />

          <SummaryRow
            label="Tax (%)"
            input={
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-24 text-right px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            }
          />

          <SummaryRow label="Tax Amount" value={`₹${taxAmount.toFixed(2)}`} />

          {/* Discount Section */}
          {showDiscount ? (
            <SummaryRow
              label="Discount (₹)"
              input={
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-24 text-right px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                  <button
                    onClick={() => {
                      setShowDiscount(false);
                      setDiscount(0);
                    }}
                    className="text-red-500 hover:text-red-700 text-xl font-bold leading-none"
                    title="Remove Discount"
                  >
                    ×
                  </button>
                </div>
              }
            />
          ) : null}

          {/* Shipping Section */}
          {showShipping ? (
            <SummaryRow
              label="Shipping (₹)"
              input={
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={shipping}
                    onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                    className="w-24 text-right px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                  <button
                    onClick={() => {
                      setShowShipping(false);
                      setShipping(0);
                    }}
                    className="text-red-500 hover:text-red-700 text-xl font-bold leading-none"
                    title="Remove Shipping"
                  >
                    ×
                  </button>
                </div>
              }
            />
          ) : null}

          {/* Combined Button Row */}
          {!showDiscount || !showShipping ? (
            <div className="flex gap-4">
              {!showDiscount && (
                <AddOptionButton onClick={() => setShowDiscount(true)} label="+ Add Discount" />
              )}
              {!showShipping && (
                <AddOptionButton onClick={() => setShowShipping(true)} label="+ Add Shipping" />
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Total Section */}
      <div className="pt-6 mt-6 border-t border-gray-300 flex justify-between items-center text-lg font-semibold text-gray-900">
        <span>Total:</span>
        <span>₹{total.toFixed(2)}</span>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value, input }) => (
  <div className="flex justify-between items-center">
    <span className="font-medium text-gray-700">{label}:</span>
    {input || <span>{value}</span>}
  </div>
);

const AddOptionButton = ({ onClick, label }) => (
  <button
    onClick={onClick}
    className="text-sm text-sky-600 font-medium px-4 py-2 border border-sky-500 rounded-md hover:bg-sky-50 transition"
  >
    {label}
  </button>
);

export default SummarySection;
