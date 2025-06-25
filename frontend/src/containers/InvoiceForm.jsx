import React, { useEffect, useState, useRef } from "react";
import InvoiceHeader from "../components/InvoiceHeader";
import BillingSection from "../components/BillingSection";
import ItemTable from "../components/ItemTable";
import SummarySection from "../components/SummarySection";
import NotesSection from "../components/NotesSection";
import html2pdf from "html2pdf.js";
import { createInvoice, sendInvoiceEmail } from "../services/api";
import { translations } from "../utils/translations";
import PDFPreview from "../components/PDFpreview";

const InvoiceForm = () => {
  const [invoiceDate, setInvoiceDate] = useState("");
  const [logo, setLogo] = useState(null); // base64 PNG data
  const [dueDate, setDueDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [billTo, setBillTo] = useState({ name: "", email: "", address: "", pincode: "", state: "" });
  const [billFrom, setBillFrom] = useState({ name: "", email: "", address: "", pincode: "", state: ""});
  const [items, setItems] = useState([{ name: "", quantity: 1, rate: 0, total: 0 }]);
  const [taxRate, setTaxRate] = useState(18);
  const [notes, setNotes] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [language, setLanguage] = useState("en");
  const currentLang = translations[language];
  const invoiceRef = useRef();
  const [invoiceTitle, setInvoiceTitle] = useState("INVOICE");
  const [notesImage, setNotesImage] = useState(null); // base64 or file



  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
   
  const [cgst, setCgst] = useState(0);
const [sgst, setSgst] = useState(0);
const [igst, setIgst] = useState(0);
 const [showPDFPreview, setShowPDFPreview] = useState(false);
 
  const pdfPreviewRef = useRef();




 useEffect(() => {
    const from = billFrom.state.trim().toLowerCase();
    const to = billTo.state.trim().toLowerCase();
    const same = from && to && from === to;
    const taxAmount = subtotal * (taxRate / 100);
    setCgst(same ? taxAmount / 2 : 0);
    setSgst(same ? taxAmount / 2 : 0);
    setIgst(same ? 0 : taxAmount);
  }, [billFrom.state, billTo.state, subtotal, taxRate]);

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
  if (!billFrom.name || !billFrom.email || !billFrom.address || !billFrom.pincode || !billFrom.state) {
    alert("Please fill in all 'Bill From' fields.");
    return;
  }

  if (!billTo.name || !billTo.email || !billTo.address || !billTo.pincode || !billTo.state) {
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

const handlePDFPreview = () => {
  if (!isFormValid) {
    alert('Please fill all required fields before previewing.');
    return;
  }

  const previewData = {
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
  };

  setShowPDFPreview(previewData);
};



const handleSaveToBackend = async () => {
  const invoiceData = {
    logo,
    invoiceNumber,
    invoiceDate,
    dueDate,
    billFrom,
    billTo,
    items,
    notes,
    currency,
    subtotal,
    taxRate,
    taxAmount: subtotal * (taxRate / 100),
    total: subtotal + subtotal * (taxRate / 100),
  };

  try {
    const response = await createInvoice(invoiceData);
    alert("Invoice saved to backend successfully!");
    console.log(response.data);
  } catch (error) {
    console.error("Error saving invoice:", error);
    alert("Failed to save invoice to backend.");
  }
};

const handleBackendPDFDownload = async () => {
  if (!isFormValid) {
    alert("Please fill all required fields before saving.");
    return;
  }

  try {
    const invoiceData = {
      logo, 
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items,
      notes,
      currency,
      subtotal,
      taxRate,
      taxAmount: subtotal * (taxRate / 100),
      total: subtotal + subtotal * (taxRate / 100),
    };

    // 1. Save invoice to DB
    const res = await createInvoice(invoiceData);
    const invoiceId = res.invoice._id;

    // 2. Fetch the PDF file from backend
    const response = await fetch(`http://localhost:5000/api/invoices/pdf/${invoiceId}`);

    if (!response.ok) throw new Error("Download failed");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // 3. Trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("PDF Download Error:", err);
    alert("Failed to download PDF from backend.");
  }
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
        <option value="mr">Marathi</option>
      </select>
    </div>
  </div>

  {/* Action Buttons */}
  <div className="flex flex-wrap gap-3">
    <button
      onClick={handlePDFPreview}
      className="bg-gray-100 text-gray-800 border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition"
    >
      Preview
    </button>
    <button
  onClick={handleBackendPDFDownload}
  disabled={!isFormValid}
  className={`bg-sky-600 text-white px-4 py-2 rounded-md text-sm font-medium transition ${
    isFormValid
      ? "hover:bg-sky-800"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
>
  Save as PDF
</button>

    <button
      onClick={async () => {
  try {
    const invoiceData = {
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items,
      notes,
      currency,
      subtotal,
      taxRate,
      taxAmount: subtotal * (taxRate / 100),
      total: subtotal + subtotal * (taxRate / 100),
    };

    // Save invoice to DB and get _id
    const res = await createInvoice(invoiceData);
    const invoiceId = res.invoice._id;

    //  send email using that ID
    const emailRes = await sendInvoiceEmail(invoiceId);
    alert(emailRes.data.message);
  } catch (err) {
    console.error("Email failed:", err);
    alert("Failed to send invoice via email.");
  }
}}


      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition"
    >
      Send Email
    </button>
  </div>
</div>
        <div ref={invoiceRef} className="pdf-preview">

      {/* Invoice Details */}
      <InvoiceHeader
      invoiceTitle={invoiceTitle}
  setInvoiceTitle={setInvoiceTitle}
        invoiceDate={invoiceDate}
        setInvoiceDate={setInvoiceDate}
        dueDate={dueDate}
        setDueDate={setDueDate}
        invoiceNumber={invoiceNumber}
        setInvoiceNumber={setInvoiceNumber}
        labels={currentLang}
         logo={logo}
  setLogo={setLogo}
      />


      <BillingSection
  billTo={billTo}
  setBillTo={setBillTo}
  billFrom={billFrom}
  setBillFrom={setBillFrom}
  labels={currentLang}
/>


      <ItemTable items={items} setItems={setItems} labels={currentLang} />

      {/* Notes + Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch  pl-8 pr-8 pt-4 pb-4 ">
        <div className="h-full">
          <NotesSection notes={notes} setNotes={setNotes} labels={currentLang} notesImage={notesImage}
  setNotesImage={setNotesImage} />
        </div>
        <div className="h-full">
          <SummarySection
  subtotal={subtotal}
  taxRate={taxRate}
  setTaxRate={setTaxRate}
  currency={currency}
  cgst={cgst}
  sgst={sgst}
  igst={igst}
  labels={currentLang}
/>

        </div>
      </div>
    </div>
   {showPDFPreview && (
  <PDFPreview 
    onClose={() => setShowPDFPreview(false)}
    data={showPDFPreview}
  />
)}

    
    </div>
  );
};

export default InvoiceForm;
