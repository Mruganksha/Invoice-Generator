import React from "react";
import { currencySymbols } from "../utils/currency";

const PDFPreview = ({ onClose, data }) => {
  const {
    invoiceNumber,
    invoiceDate,
    dueDate,
    billFrom,
    billTo,
    items,
    subtotal,
    taxRate,
    cgst,
    sgst,
    igst,
    notes,
    currency,
    logo,
    invoiceTitle,
     
  notesImage,
  } = data;

  const totalTax = cgst + sgst + igst;
  const total = subtotal + totalTax;
  const currencySymbol = currencySymbols[currency] || currency;

  console.log("PDFPreview notesImage:", notesImage);
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center overflow-y-auto px-4 ">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl p-8 relative font-sans text-sm">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
        >
          &times;
        </button>

       {/* Header Section with Side-by-Side Addresses */}
<div className="flex justify-between items-start mb-8 border-b pb-4">
  <div className="flex-1">
 <h1 className="text-3xl font-extrabold tracking-tight text-gray-800">{invoiceTitle || "INVOICE"}</h1>

    <p className="text-gray-600">Invoice #: {invoiceNumber}</p>
    <p className="text-gray-600">Date: {invoiceDate}</p>
    <p className="text-gray-600">Due: {dueDate}</p>
  </div>

  <div className="flex-1 text-right">
    {logo && (
      <img
        src={logo}
        alt="Company Logo"
        className="h-20 w-auto object-contain ml-auto mb-2"
      />
    )}
  </div>
</div>

<div className="flex justify-between mb-6 space-x-8">
  {/* Bill To on the left */}
  <div className="w-1/2">
    <h3 className="text-md font-semibold text-gray-700 mb-1">Bill To:</h3>
    <div className="text-gray-700 leading-snug">
      <p>{billTo.name}</p>
      <p>{billTo.address}</p>
      <p>{billTo.state} - {billTo.pincode}</p>
      <p>{billTo.email}</p>
    </div>
  </div>

  {/* From on the right */}
  <div className="w-1/2 text-right">
    <h3 className="text-md font-semibold text-gray-700 mb-1">From:</h3>
    <div className="text-gray-700 leading-snug">
      <p>{billFrom.name}</p>
      <p>{billFrom.address}</p>
      <p>{billFrom.state} - {billFrom.pincode}</p>
      <p>{billFrom.email}</p>
    </div>
  </div>
</div>


        {/* Items Table */}
        <div className="mb-4 border rounded-lg overflow-hidden">
          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wide">
              <tr>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-right">Qty</th>
                <th className="p-3 text-right">Rate ({currency})</th>  
                <th className="p-3 text-right">Amount ({currency})</th>  
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3 text-right">{item.quantity}</td>
                  <td className="p-3 text-right">{item.rate.toFixed(2)}</td>
                  <td className="p-3 text-right">{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary */}
        <div className="flex justify-end">
          <table className="w-full max-w-sm text-sm">
            <tbody>
              <tr>
                <td className="py-1 text-gray-600">Subtotal:</td>
                <td className="py-1 text-right">{currency} {subtotal.toFixed(2)} → {currencySymbol}{subtotal.toFixed(2)}</td>
              </tr>
              {cgst > 0 && (
                <tr>
                  <td className="py-1 text-gray-600">CGST ({taxRate / 2}%):</td>
                  <td className="py-1 text-right">{currency} {cgst.toFixed(2)}</td>
                </tr>
              )}
              {sgst > 0 && (
                <tr>
                  <td className="py-1 text-gray-600">SGST ({taxRate / 2}%):</td>
                  <td className="py-1 text-right">{currency} {sgst.toFixed(2)}</td>
                </tr>
              )}
              {igst > 0 && (
                <tr>
                  <td className="py-1 text-gray-600">IGST ({taxRate}%):</td>
                  <td className="py-1 text-right">{currency} {igst.toFixed(2)}</td>
                </tr>
              )}
              <tr className="font-semibold border-t border-gray-300">
                <td className="py-2">Total:</td>
                <td className="py-2 text-right">{currency} {total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {data.notesImage && (
  <img src={data.notesImage} alt="Notes Attachment" style={{ maxWidth: 200, marginTop: 3 }} />
)}
        {notes && (
          <div className=" text-gray-700">
            <h4 className="font-semibold mb-1">Additional Notes:</h4>
            <p>{notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t text-center text-xs text-gray-500">
          <p>Thank you for your business.</p>
          <p>Generated on: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;
