import React from "react";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];


const BillingSection = ({
  billTo,
  setBillTo,
  billFrom,
  setBillFrom,
}) => {
   console.log("BillTo State:", billTo.state);
  console.log("BillFrom State:", billFrom.state);
  return (
    <div className=" p-8 rounded-xl  mb-8 ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bill To */}
        <div className="bg-white rounded-lg shadow p-6 border border-blue-100 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">Bill To</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client or Company Name</label>
              <input
                type="text"
                value={billTo.name}
                onChange={(e) => setBillTo({ ...billTo, name: e.target.value })}
                placeholder="Acme Corporation"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={billTo.email}
                onChange={(e) => setBillTo({ ...billTo, email: e.target.value })}
                placeholder="client@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
              <textarea
                rows="3"
                value={billTo.address}
                onChange={(e) => setBillTo({ ...billTo, address: e.target.value })}
                placeholder="123 Street Name, City, State ZIP"
                className="w-full px-4 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Pincode */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
  <input
    type="text"
    maxLength={6}
    value={billTo.pincode || ""}
    onChange={(e) => setBillTo({ ...billTo, pincode: e.target.value })}
    placeholder="400001"
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

{/* State */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
  <select
    value={billTo.state || ""}
    onChange={(e) => setBillTo({ ...billTo, state: e.target.value })}
    placeholder="Maharashtra"
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Select State</option>
    {indianStates.map((st) => (
      <option key={st} value={st}>{st}</option>
    ))}
  </select>
</div>

          </div>
        </div>

        {/* Bill From */}
        <div className="bg-white rounded-lg shadow  pl-8 pr-8 pt-4 pb-4 border border-green-100 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold text-sky-700 mb-4">Bill From</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name or Company</label>
              <input
                type="text"
                value={billFrom.name}
                onChange={(e) => setBillFrom({ ...billFrom, name: e.target.value })}
                placeholder="John Doe LLC"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={billFrom.email}
                onChange={(e) => setBillFrom({ ...billFrom, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address</label>
              <textarea
                rows="3"
                value={billFrom.address}
                onChange={(e) => setBillFrom({ ...billFrom, address: e.target.value })}
                placeholder="456 Street Name, City, State ZIP"
                className="w-full px-4 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            {/* Pincode */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
  <input
    type="text"
    maxLength={6}
    value={billFrom.pincode || ""}
    onChange={(e) => setBillFrom({ ...billFrom, pincode: e.target.value })}
    placeholder="110001"
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
  />
</div>

{/* State */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
  <select
    value={billFrom.state || ""}
    onChange={(e) => setBillFrom({ ...billFrom, state: e.target.value })}
    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
  >
    <option value="">Select State</option>
    {indianStates.map((st) => (
      <option key={st} value={st}>{st}</option>
    ))}
  </select>
</div>

          </div>
        </div>
      </div>
     </div>
  );
};

export default BillingSection;
