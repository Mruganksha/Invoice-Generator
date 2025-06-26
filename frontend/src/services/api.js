import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,  
});

export const createInvoice = async (invoiceData) => {
  const response = await API.post("/api/invoices", invoiceData); 
  return response.data;
};


export const getInvoiceById = (id) => API.get(`/invoices/${id}`);

export const downloadInvoicePDF = (id) =>
  API.get(`/invoices/pdf/${id}`, { responseType: 'blob' });

export const sendInvoiceEmail = (invoiceId) => API.post('/email/send', {invoiceId});

export default API;
