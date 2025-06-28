const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Constants for layout
const FOOTER_HEIGHT = 10;
const MARGIN = 20;
const PAGE_WIDTH = 612; // US Letter width in points
const LINE_COLOR = "#000000"; // Light gray for borders

// Simple currency symbol lookup
const getCurrencySymbol = (currency) => {
  const symbols = {
    USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥'
  };
  return symbols[currency] || currency;
};


const generateInvoicePDF = (invoice, filePath) => {
  console.log("logo:", invoice.logo?.slice(0, 30));
console.log("notesImage:", invoice.notesImage?.slice(0, 30));
  console.log("Invoice data for PDF:", invoice);
  return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: MARGIN });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

   

    const currencySymbol = getCurrencySymbol(invoice.currency);

    // ========== 1. Header Section ==========
    const headerY = MARGIN;

    // Left side - Invoice title and details
    doc.font("Helvetica-Bold")
       .fontSize(24)
       .fillColor("#000000")
       .text(invoice.invoiceTitle || "INVOICE", MARGIN, headerY);

    doc.font("Helvetica")
       .fontSize(10)
       .fillColor("#1F2937")
       .text(`Invoice #: ${invoice.invoiceNumber || "N/A"}`, MARGIN, headerY + 30)
       .text(`Date: ${invoice.invoiceDate || "N/A"}`, MARGIN, headerY + 45)
       .text(`Due: ${invoice.dueDate || "N/A"}`, MARGIN, headerY + 60);

    // Right side - Logo
    if (invoice.logo && invoice.logo.startsWith("data:image")) {
      try {
        const base64Data = invoice.logo.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        doc.image(buffer, PAGE_WIDTH - MARGIN - 100, headerY, { 
          width: 100,
          align: 'right'
        });
      } catch (e) {
        console.error("Error rendering logo:", e.message);
      }
    }

    // Border bottom
    doc.moveTo(MARGIN, headerY + 80)
       .lineTo(PAGE_WIDTH - MARGIN, headerY + 80)
       .strokeColor(LINE_COLOR)
       .lineWidth(1)
       .stroke();

    doc.y = headerY + 100;

    // ========== 2. Billing Sections ==========
    const billSectionY = doc.y;
    const columnWidth = (PAGE_WIDTH - (MARGIN * 2)) / 2;
    const lineHeight = 14;

    // Bill To (left column)
    doc.font("Helvetica-Bold")
       .fontSize(12)
       .fillColor("#374151")
       .text("Bill To:", MARGIN, billSectionY)
       .moveDown(0.5);

    doc.font("Helvetica")
       .fontSize(10)
       .fillColor("#374151")
       .text(invoice.billTo?.name || "", MARGIN)
       .moveDown(lineHeight/50)
       .text(invoice.billTo?.address || "", MARGIN)
       .moveDown(lineHeight/50)
       .text(`${invoice.billTo?.state || ""} - ${invoice.billTo?.pincode || ""}`, MARGIN)
       .moveDown(lineHeight/50)
       .text(invoice.billTo?.email || "", MARGIN);

    // From (right column)
    const rightColumnX = MARGIN + columnWidth;

    doc.font("Helvetica-Bold")
       .fontSize(12)
       .fillColor("#374151")
       .text("From:", rightColumnX, billSectionY, {
         align: "right",
         width: columnWidth
       })
       .moveDown(0.5);

    doc.font("Helvetica")
       .fontSize(10)
       .fillColor("#374151")
       .text(invoice.billFrom?.name || "", rightColumnX, undefined, {
         align: "right",
         width: columnWidth
       })
       .moveDown(lineHeight/50)
       .text(invoice.billFrom?.address || "", rightColumnX, undefined, {
         align: "right",
         width: columnWidth
       })
       .moveDown(lineHeight/50)
       .text(`${invoice.billFrom?.state || ""} - ${invoice.billFrom?.pincode || ""}`, rightColumnX, undefined, {
         align: "right",
         width: columnWidth
       })
       .moveDown(lineHeight/50)
       .text(invoice.billFrom?.email || "", rightColumnX, undefined, {
         align: "right",
         width: columnWidth
       });

    doc.moveDown(1.5);

   // ========== 3. Items Table ==========
const tableTop = doc.y + 10;
const columnPadding = 12; // Matches p-3 (0.75rem)

// Corrected column definitions with proper cumulative positioning
const columns = [
  { 
    name: "DESCRIPTION", 
    width: 200,        // DESCRIPTION column width
    x: MARGIN,         // Starts at left margin
    align: "left",
    padding: 12
  },
  { 
    name: "QTY", 
    width: 40,         // QTY column width
    x: MARGIN + 200 + columnPadding,  // Previous width + padding
    align: "right",
    padding: 12
  },
  { 
    name: `RATE (${invoice.currency || "INR"})`, 
    width: 80,        // RATE column width
    x: MARGIN + 200 + 40 + (columnPadding * 2), // Sum of previous widths + paddings
    align: "right",
    padding: 12
  },
  { 
    name: `AMOUNT (${invoice.currency || "INR"})`, 
    width: 100,        // AMOUNT column width
    x: MARGIN + 200 + 60 + 80 + (columnPadding * 3), // Sum of all previous
    align: "right",
    padding: 12
  }
];

// Table header with background color
doc.fillColor("#eaf1fe")
   .rect(MARGIN, tableTop, PAGE_WIDTH - (MARGIN * 2), 20)
   .fill();

// Draw header text with proper padding
columns.forEach(col => {
  doc.font("Helvetica-Bold")
     .fontSize(10)
     .fillColor("#374151")
     .text(col.name, 
       col.x + col.padding/2,  // Center text in cell with padding
       tableTop + 5,           // Vertically center
       {
         width: col.width - col.padding, // Reduce width by padding
         align: col.align,
         characterSpacing: 0.5
       }
     );
});

// Table rows
let tableCurrentY = tableTop + 20;
(invoice.items || []).forEach((item, idx) => {
  if (tableCurrentY > doc.page.height - FOOTER_HEIGHT - 30) {
    doc.addPage();
    tableCurrentY = MARGIN;
    
    // Redraw header on new page
    doc.fillColor("#eaf1fe")
       .rect(MARGIN, tableCurrentY, PAGE_WIDTH - (MARGIN * 2), 20)
       .fill();
    
    columns.forEach(col => {
      doc.font("Helvetica-Bold")
         .fontSize(10)
         .fillColor("#374151")
         .text(col.name, 
           col.x + col.padding/2,
           tableCurrentY + 5,
           {
             width: col.width - col.padding,
             align: col.align,
             characterSpacing: 0.5
           }
         );
    });
    
    tableCurrentY += 20;
  }

  // Draw row border if not first row
  if (idx > 0) {
    doc.moveTo(MARGIN, tableCurrentY)
       .lineTo(PAGE_WIDTH - MARGIN, tableCurrentY)
       .strokeColor("#E5E7EB")
       .stroke();
  }

  // Draw cell content with proper padding
  columns.forEach((col, colIdx) => {
    let value;
    switch(colIdx) {
      case 0: value = item.name || "-"; break;
      case 1: value = item.quantity?.toString() || "0"; break;
      case 2: value = item.rate?.toFixed(2) || "0.00"; break;
      case 3: value = item.total?.toFixed(2) || "0.00"; break;
    }
    
    doc.font("Helvetica")
       .fontSize(10)
       .fillColor("#111827")
       .text(value,
         col.x + col.padding/2,
         tableCurrentY + 5,
         {
           width: col.width - col.padding,
           align: col.align
         }
       );
  });

  tableCurrentY += 20;
});

// Add rounded corners to table
doc.roundedRect(MARGIN, tableTop, PAGE_WIDTH - (MARGIN * 2), tableCurrentY - tableTop, 4)
   .strokeColor("#E5E7EB")
   .stroke();

doc.y = tableCurrentY + 16;

    // ========== 4. Summary Section ==========
const summaryWidth = 200; // Matches max-w-sm
const summaryX = PAGE_WIDTH - MARGIN - summaryWidth; // Right-aligned (flex justify-end)
// const lineHeight = 14; // Matches text-sm line height (removed duplicate declaration)

// Start position with some spacing
let currentY = doc.y + 20;

// Helper function to add summary rows with proper styling
const addSummaryRow = (label, value, isTotal = false) => {
  // Set styles based on row type
  doc.font(isTotal ? "Helvetica-Bold" : "Helvetica")
     .fontSize(10) // text-sm
     .fillColor(isTotal ? "#111827" : "#6B7280"); // text-gray-600 for regular, black for total
  
  // Label column (left-aligned)
  doc.text(label, summaryX, currentY, {
    width: summaryWidth - 90,
    align: "left"
  });
  



  // Value column (right-aligned)
const valueText = isTotal 
  ? `${invoice.currency} ${value.toFixed(2)}` // Total shows only one currency
  : `${invoice.currency} ${value.toFixed(2)}`; // Others show both (can adjust as needed)
  
  doc.text(valueText, summaryX + summaryWidth - 90, currentY, {
    width: 90,
    align: "right"
  });
  
  currentY += lineHeight;
};



// Ensure values exist
invoice.subtotal = invoice.subtotal || 0;
invoice.taxRate = invoice.taxRate || 0;

// Compute CGST and SGST based on taxRate
const halfTaxRate = invoice.taxRate / 2;
invoice.cgst = parseFloat((invoice.subtotal * (halfTaxRate / 100)).toFixed(2));
invoice.sgst = parseFloat((invoice.subtotal * (halfTaxRate / 100)).toFixed(2));
invoice.igst = invoice.igst || 0; // Keep IGST optional if not used


// Subtotal row
addSummaryRow("Subtotal:", invoice.subtotal || 0);
currentY += 4;

// Always print tax rows, even if 0
addSummaryRow(`CGST (${(invoice.taxRate / 2).toFixed(2)}%):`, invoice.cgst || 0);
currentY += 2;
addSummaryRow(`SGST (${(invoice.taxRate / 2).toFixed(2)}%):`, invoice.sgst || 0);
currentY += 2;
addSummaryRow(`IGST (${invoice.taxRate?.toFixed(2) || "0.00"}%):`, invoice.igst || 0);
currentY += 2;

const totalTax = invoice.cgst + invoice.sgst + invoice.igst;
const total = invoice.subtotal + totalTax;

// Total row with top border (border-t border-gray-300)
currentY += 6; // Extra spacing before total line
doc.moveTo(summaryX, currentY)
   .lineTo(summaryX + summaryWidth, currentY)
   .strokeColor("#D1D5DB") // border-gray-300
   .stroke();

currentY += 6; // Space after border
addSummaryRow("Total:", total, true); // Bold total row

// Add final spacing (matches mb-4)
doc.y = currentY + 16;

    // ========== 5. Notes Section ==========
      let notesY = doc.y + 20;

    if (invoice.notesImage && Array.isArray(invoice.notesImage)) {
      invoice.notesImage.forEach(img => {
        if (img && img.startsWith("data:image")) {
          try {
            // Check if we need a new page before adding image
            if (notesY + 120 > doc.page.height - FOOTER_HEIGHT - 20) {
              doc.addPage();
              notesY = MARGIN;
            }
            
            const base64Data = img.split(',')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            doc.image(buffer, MARGIN, notesY, { width: 150, height: 100, align: 'left' });
            notesY += 120;
          } catch (err) {
            console.error("Failed to load notes image:", err.message);
          }
        }
      });
    }

    if (invoice.notes) {
      // Check if we need a new page before adding notes
      if (notesY + 40 > doc.page.height - FOOTER_HEIGHT - 20) {
        doc.addPage();
        notesY = MARGIN;
      }

      doc.font("Helvetica-Bold")
         .fontSize(12)
         .fillColor("#374151")
         .text("Additional Notes:", MARGIN, notesY)
         .moveDown(0.5);

      const notesHeight = doc.heightOfString(invoice.notes, {
        width: PAGE_WIDTH - (MARGIN * 2),
        lineGap: 4
      });

      // Check if notes will fit before adding them
      if (notesY + notesHeight > doc.page.height - FOOTER_HEIGHT - 20) {
        doc.addPage();
        notesY = MARGIN;
      }

      doc.font("Helvetica")
         .fontSize(10)
         .fillColor("#374151")
         .text(invoice.notes, MARGIN, doc.y, {
           width: PAGE_WIDTH - (MARGIN * 2),
           align: "left",
           lineGap: 4
         });
    }

    // ========== 6. Footer ==========
    // Calculate current Y position after all content
    const contentEndY = doc.y;
    const footerY = Math.max(contentEndY + 20, doc.page.height - FOOTER_HEIGHT - 10);

    // If footer would be pushed to next page, adjust content
    if (footerY > doc.page.height - FOOTER_HEIGHT) {
      // Move to next page and position footer at bottom
      doc.addPage();
      doc.moveTo(MARGIN, doc.page.height - FOOTER_HEIGHT - 10)
         .lineTo(PAGE_WIDTH - MARGIN, doc.page.height - FOOTER_HEIGHT - 10)
         .strokeColor("#E5E7EB")
         .stroke();

      doc.font("Helvetica")
         .fontSize(8)
         .fillColor("#6B7280")
         .text(`Thank you for your business. Generated on: ${new Date().toLocaleDateString()}`, 
               MARGIN, doc.page.height - FOOTER_HEIGHT, {
                 align: "center",
                 width: PAGE_WIDTH - (MARGIN * 2)
               });
    } else {
      // Footer fits on current page
      doc.moveTo(MARGIN, footerY - 10)
         .lineTo(PAGE_WIDTH - MARGIN, footerY - 10)
         .strokeColor("#E5E7EB")
         .stroke();

      doc.font("Helvetica")
         .fontSize(8)
         .fillColor("#6B7280")
         .text(`Thank you for your business. Generated on: ${new Date().toLocaleDateString()}`, 
               MARGIN, footerY, {
                 align: "center",
                 width: PAGE_WIDTH - (MARGIN * 2)
               });
    }

    doc.end();
    stream.on('finish', () => resolve());
    stream.on('error', (err) => reject(err));
  });
};

module.exports = generateInvoicePDF;