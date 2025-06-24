import React, { useEffect, useState, useRef } from "react";
import InvoiceHeader from "../components/InvoiceHeader";
import BillingSection from "../components/BillingSection";
import ItemTable from "../components/ItemTable";
import SummarySection from "../components/SummarySection";
import NotesSection from "../components/NotesSection";
import html2pdf from "html2pdf.js";


const InvoiceForm = () => {
  const [invoiceDate, setInvoiceDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [billTo, setBillTo] = useState({ name: "", email: "", address: "" });
  const [billFrom, setBillFrom] = useState({ name: "", email: "", address: "" });
  const [items, setItems] = useState([{ name: "", quantity: 1, rate: 0, total: 0 }]);
  const [taxRate, setTaxRate] = useState(18);
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [language, setLanguage] = useState("en");
  const invoiceRef = useRef();

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setInvoiceDate(today);

    const due = new Date();
    due.setDate(due.getDate() + 7);
    setDueDate(due.toISOString().split("T")[0]);

    const invoiceID = `INV-${Date.now().toString().slice(-5)}`;
    setInvoiceNumber(invoiceID);
  }, []);

  const handleSavePDF = () => {
    
  // Validate required fields
  if (!billFrom.name || !billFrom.email || !billFrom.address) {
    alert("Please fill in all 'Bill From' fields.");
    return;
  }

  if (!billTo.name || !billTo.email || !billTo.address) {
    alert("Please fill in all 'Bill To' fields.");
    return;
  }

  if (items.length === 0 || items.some(item => !item.name || item.quantity <= 0 || item.rate < 0)) {
    alert("Please ensure all items are filled correctly.");
    return;
  }

  if (!invoiceNumber || !invoiceDate || !dueDate) {
    alert("Invoice date, due date, and invoice number are required.");
    return;
  }

  // Proceed to download PDF
  const element = invoiceRef.current;
  const opt = {
    margin: 0.5,
    filename: `${invoiceNumber}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  };

  html2pdf().from(element).set(opt).save();
};


const isFormValid =
  billFrom.name && billFrom.email && billFrom.address &&
  billTo.name && billTo.email && billTo.address &&
  invoiceNumber && invoiceDate && dueDate &&
  items.length > 0 && items.every(item => item.name && item.quantity > 0 && item.rate >= 0);

 const handlePreview = () => {
  const element = invoiceRef.current.cloneNode(true);
  const previewWindow = window.open("", "_blank");
  previewWindow.document.write(`
    <html>
      <head><title>Invoice Preview</title></head>
      <body>${element.outerHTML}</body>
    </html>
  `);
  previewWindow.document.close();
};

  return (
    
    <div className="max-w-7xl mx-auto  pl-8 pr-8 pt-4 pb-4 space-y-8">
      {/* Top Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-8">
  {/* Currency & Language Dropdowns */}
  <div className="flex gap-4 ">
    <div>
      <label className="text-sm font-medium block mb-1 text-gray-700">Currency</label>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="w-40 border border-gray-300 px-3 py-2 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="INR">INR ₹</option>
        <option value="USD">USD $</option>
        <option value="EUR">EUR €</option>
        <option value="GBP">GBP £</option>
      </select>
    </div>

    <div>
      <label className="text-sm font-medium block mb-1 text-gray-700">Language</label>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="w-40 border border-gray-300 px-3 py-2 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="en">English</option>
        <option value="hi">Hindi</option>
        <option value="fr">French</option>
        <option value="de">German</option>
      </select>
    </div>
  </div>

  {/* Action Buttons */}
  <div className="flex flex-wrap gap-3">
    <button
      onClick={handlePreview}
      className="bg-gray-100 text-gray-800 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition"
    >
      Preview
    </button>
    <button
      onClick={handleSavePDF}
       disabled={!isFormValid}
      className={`bg-sky-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-sky-800 text-white transition  transition ${
    isFormValid
      ? "bg-sky-600 text-white hover:bg-sky-800"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
    >
      Save as PDF
    </button>
    <button
      onClick={() => alert("Sending email...")}
      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition"
    >
      Send Email
    </button>
  </div>
</div>
        <div ref={invoiceRef}>
      {/* Invoice Details */}
      <InvoiceHeader
        invoiceDate={invoiceDate}
        setInvoiceDate={setInvoiceDate}
        dueDate={dueDate}
        setDueDate={setDueDate}
        invoiceNumber={invoiceNumber}
        setInvoiceNumber={setInvoiceNumber}
      />

      <BillingSection
        billTo={billTo}
        setBillTo={setBillTo}
        billFrom={billFrom}
        setBillFrom={setBillFrom}
      />

      <ItemTable items={items} setItems={setItems} />

      {/* Notes + Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch  pl-8 pr-8 pt-4 pb-4 ">
        <div className="h-full">
          <NotesSection notes={notes} setNotes={setNotes} />
        </div>
        <div className="h-full">
          <SummarySection
            subtotal={subtotal}
            taxRate={taxRate}
            setTaxRate={setTaxRate}
            currency={currency}
          />
        </div>
      </div>
    </div>
    </div>
  );
};

export default InvoiceForm;
