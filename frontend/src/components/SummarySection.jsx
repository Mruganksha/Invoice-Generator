import React, { useState } from "react";
import { currencySymbols } from "../utils/currency";

const SummarySection = ({ subtotal, taxRate, setTaxRate, currency, cgst = 0, sgst = 0, igst = 0, labels }) => {
  const [showDiscount, setShowDiscount] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);

  const symbol = currencySymbols[currency] || currency;

  const total =
    subtotal - (showDiscount ? discount : 0) + cgst + sgst + igst + (showShipping ? shipping : 0);

  return (
    <div className="h-full w-full border border-gray-200 rounded-xl shadow-lg p-8 flex flex-col justify-between bg-gradient-to-br from-white to-gray-50">
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-blue-800 border-b pb-4">
          {labels.invoiceSummary}
        </h2>

        <div className="space-y-5 text-sm text-gray-700">
          <SummaryRow label={labels.subtotal} value={`${symbol}${subtotal.toFixed(2)}`} />

          <SummaryRow
            label={labels.tax}
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

          {cgst > 0 && sgst > 0 ? (
            <>
              <SummaryRow label={`CGST (${(taxRate / 2).toFixed(1)}%)`} value={`${symbol}${cgst.toFixed(2)}`} />
              <SummaryRow label={`SGST (${(taxRate / 2).toFixed(1)}%)`} value={`${symbol}${sgst.toFixed(2)}`} />
            </>
          ) : (
            <SummaryRow label={`IGST (${taxRate}%)`} value={`${symbol}${igst.toFixed(2)}`} />
          )}

          {showDiscount && (
            <SummaryRow
              label={labels.discount}
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
          )}

          {showShipping && (
            <SummaryRow
              label={labels.shipping}
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
          )}

          {!showDiscount || !showShipping ? (
            <div className="flex gap-4">
              {!showDiscount && (
                <AddOptionButton onClick={() => setShowDiscount(true)} label={labels.addDiscount} />
              )}
              {!showShipping && (
                <AddOptionButton onClick={() => setShowShipping(true)} label={labels.addShipping} />
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-gray-300 flex justify-between items-center text-lg font-semibold text-gray-900">
        <span>{labels.total}</span>
        <span>{symbol}{total.toFixed(2)}</span>
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
