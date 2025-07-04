import React from "react";
import { Trash2 } from "lucide-react";
import { currencySymbols } from "../utils/currency";

const ItemTable = ({ items, setItems, labels, currency }) => {
  const currencySymbol = currencySymbols[currency] || currency;

  const handleChange = (index, field, value) => {
    const updated = [...items];
    if (field === "name") {
      updated[index][field] = value;
    } else {
      const number = parseFloat(value);
      updated[index][field] = isNaN(number) ? 0 : number;
    }

    const q = parseFloat(updated[index].quantity) || 0;
    const r = parseFloat(updated[index].rate) || 0;
    updated[index].total = q * r;
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { name: "", quantity: 1, rate: 0, total: 0 },
    ]);
  };

  const handleDelete = (index) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  return (
    <div className="rounded-xl pl-8 pr-8 pt-4 pb-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {labels.invoiceItems}
      </h2>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="min-w-[640px] sm:min-w-full text-sm text-gray-800 border border-gray-200 rounded-md">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs border-b">
            <tr>
              <th className="text-left py-3 px-4">{labels.item}</th>
              <th className="text-center py-3 px-2">{labels.quantity}</th>
              <th className="text-center py-3 px-2">{labels.rate}</th>
              <th className="text-center py-3 px-2">{labels.total}</th>
              <th className="text-center py-3 px-2">{labels.action}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row, index) => (
              <tr
                key={index}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="py-3 px-4">
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) =>
                      handleChange(index, "name", e.target.value)
                    }
                    className="w-40 sm:w-full px-2 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={labels.itemPlaceholder}
                  />
                </td>
                <td className="text-center py-3 px-2">
                  <input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={(e) =>
                      handleChange(index, "quantity", e.target.value)
                    }
                    className="w-16 text-center px-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="text-center py-3 px-2">
                  <input
                    type="number"
                    min="0"
                    value={row.rate}
                    onChange={(e) =>
                      handleChange(index, "rate", e.target.value)
                    }
                    className="w-24 text-center px-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="text-center py-3 px-2 font-medium text-gray-700">
                  {currencySymbol}{Number(row.total).toFixed(2)}
                </td>
                <td className="text-center py-3 px-2">
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-500 hover:text-red-700 transition"
                    title={labels.removeItem}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <button
          onClick={handleAddItem}
          className="inline-block px-5 py-2 hover:bg-sky-600 text-white rounded-md text-sm font-medium bg-sky-500 transition"
        >
          {labels.addItem}
        </button>
      </div>
    </div>
  );
};

export default ItemTable;
