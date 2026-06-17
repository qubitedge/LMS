const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');

const darkColor = "1a1a2e";
const grayBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function boldRun(text, size = 22, color = "000000") {
  return new TextRun({ text, bold: true, size, color, font: "Arial" });
}
function normalRun(text, size = 20, color = "000000") {
  return new TextRun({ text, size, color, font: "Arial" });
}
function italicRun(text, size = 18, color = "555555") {
  return new TextRun({ text, italics: true, size, color, font: "Arial" });
}

const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 }
      }
    },
    children: [
      // INVOICE title + Period/Due Date row
      new Table({
        width: { size: 10080, type: WidthType.DXA },
        columnWidths: [5040, 5040],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: noBorders,
                width: { size: 5040, type: WidthType.DXA },
                children: [new Paragraph({
                  children: [new TextRun({ text: "INVOICE", bold: true, size: 52, font: "Arial", color: "000000" })]
                })]
              }),
              new TableCell({
                borders: noBorders,
                width: { size: 5040, type: WidthType.DXA },
                verticalAlign: VerticalAlign.TOP,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [boldRun("Period: ", 20), normalRun("May 2026", 20)]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [boldRun("Due Date: ", 20), normalRun("15/06/2026", 20)]
                  }),
                ]
              })
            ]
          })
        ]
      }),

      // Invoice # and Date
      new Paragraph({ spacing: { before: 160 }, children: [boldRun("Invoice #: ", 20), normalRun("1", 20)] }),
      new Paragraph({ children: [boldRun("Date: ", 20), normalRun("01/06/2026", 20)] }),

      // Spacer
      new Paragraph({ spacing: { before: 300 }, children: [] }),

      // FROM / BILL TO table
      new Table({
        width: { size: 10080, type: WidthType.DXA },
        columnWidths: [5040, 5040],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: noBorders,
                width: { size: 5040, type: WidthType.DXA },
                children: [
                  new Paragraph({ children: [boldRun("FROM", 18, "555555")] }),
                  new Paragraph({ spacing: { before: 80 }, children: [boldRun("Likhith Kumar Mankala", 22)] }),
                  new Paragraph({ children: [normalRun("Email: likhithmanakala@gmail.com", 20)] }),
                  new Paragraph({ children: [normalRun("India", 20)] }),
                ]
              }),
              new TableCell({
                borders: noBorders,
                width: { size: 5040, type: WidthType.DXA },
                children: [
                  new Paragraph({ children: [boldRun("BILL TO", 18, "555555")] }),
                  new Paragraph({ spacing: { before: 80 }, children: [boldRun("Qubitedge Global Services (OPC)", 22)] }),
                  new Paragraph({ children: [normalRun("Contact: contact@qubitedge.com", 20)] }),
                  new Paragraph({ children: [normalRun("India", 20)] }),
                ]
              })
            ]
          })
        ]
      }),

      // Spacer
      new Paragraph({ spacing: { before: 300 }, children: [] }),

      // Items table
      new Table({
        width: { size: 10080, type: WidthType.DXA },
        columnWidths: [720, 5760, 1800, 1800],
        rows: [
          // Header row
          new TableRow({
            children: [
              new TableCell({
                shading: { fill: darkColor, type: ShadingType.CLEAR },
                borders: noBorders,
                width: { size: 720, type: WidthType.DXA },
                margins: { top: 120, bottom: 120, left: 160, right: 160 },
                children: [new Paragraph({ children: [boldRun("QTY", 18, "FFFFFF")] })]
              }),
              new TableCell({
                shading: { fill: darkColor, type: ShadingType.CLEAR },
                borders: noBorders,
                width: { size: 5760, type: WidthType.DXA },
                margins: { top: 120, bottom: 120, left: 160, right: 160 },
                children: [new Paragraph({ children: [boldRun("DESCRIPTION", 18, "FFFFFF")] })]
              }),
              new TableCell({
                shading: { fill: darkColor, type: ShadingType.CLEAR },
                borders: noBorders,
                width: { size: 1800, type: WidthType.DXA },
                margins: { top: 120, bottom: 120, left: 160, right: 160 },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [boldRun("UNIT PRICE", 18, "FFFFFF")] })]
              }),
              new TableCell({
                shading: { fill: darkColor, type: ShadingType.CLEAR },
                borders: noBorders,
                width: { size: 1800, type: WidthType.DXA },
                margins: { top: 120, bottom: 120, left: 160, right: 160 },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [boldRun("AMOUNT", 18, "FFFFFF")] })]
              }),
            ]
          }),
          // Item row
          new TableRow({
            children: [
              new TableCell({
                borders: { top: grayBorder, bottom: grayBorder, left: grayBorder, right: grayBorder },
                width: { size: 720, type: WidthType.DXA },
                margins: { top: 120, bottom: 120, left: 160, right: 160 },
                children: [new Paragraph({ children: [normalRun("1", 20)] })]
              }),
              new TableCell({
                borders: { top: grayBorder, bottom: grayBorder, left: grayBorder, right: grayBorder },
                width: { size: 5760, type: WidthType.DXA },
                margins: { top: 120, bottom: 120, left: 160, right: 160 },
                children: [
                  new Paragraph({ children: [boldRun("Applied AI & Data Science Program", 20)] }),
                  new Paragraph({ children: [normalRun("Paid Internship Stipend — Month of May 2026", 19, "555555")] })
                ]
              }),
              new TableCell({
                borders: { top: grayBorder, bottom: grayBorder, left: grayBorder, right: grayBorder },
                width: { size: 1800, type: WidthType.DXA },
                margins: { top: 120, bottom: 120, left: 160, right: 160 },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [normalRun("Rs. 10,000.00", 20)] })]
              }),
              new TableCell({
                borders: { top: grayBorder, bottom: grayBorder, left: grayBorder, right: grayBorder },
                width: { size: 1800, type: WidthType.DXA },
                margins: { top: 120, bottom: 120, left: 160, right: 160 },
                children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [normalRun("Rs. 10,000.00", 20)] })]
              }),
            ]
          }),
        ]
      }),

      // Spacer
      new Paragraph({ spacing: { before: 300 }, children: [] }),

      // Payment info + totals table
      new Table({
        width: { size: 10080, type: WidthType.DXA },
        columnWidths: [5280, 4800],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: { top: noBorder, bottom: noBorder, left: { style: BorderStyle.SINGLE, size: 6, color: darkColor }, right: noBorder },
                width: { size: 5280, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 200, right: 160 },
                children: [
                  new Paragraph({ children: [boldRun("PAYMENT INFORMATION", 18)] }),
                  new Paragraph({ spacing: { before: 100 }, children: [boldRun("UPI ID: ", 20), normalRun("likhithmankala888-1@okhdfcbank", 20)] }),
                  new Paragraph({ spacing: { before: 100 }, children: [boldRun("Terms & Conditions:", 20)] }),
                  new Paragraph({ children: [normalRun("Payment is due within 15 days of the invoice date.", 19)] }),
                  new Paragraph({ children: [normalRun("Please make payments payable to: Likhith Kumar Mankala.", 19)] }),
                  new Paragraph({ spacing: { before: 80 }, children: [italicRun("This invoice is system-generated for internship stipend purposes.")] }),
                ]
              }),
              new TableCell({
                borders: noBorders,
                width: { size: 4800, type: WidthType.DXA },
                margins: { top: 80, bottom: 80, left: 160, right: 0 },
                children: [
                  new Paragraph({ alignment: AlignmentType.RIGHT, children: [normalRun("Subtotal", 20, "555555"), new TextRun({ text: "\t\tRs. 10,000.00", font: "Arial", size: 20 })] }),
                  new Paragraph({ alignment: AlignmentType.RIGHT, children: [normalRun("Tax (0%)", 20, "555555"), new TextRun({ text: "\t\tRs. 0.00", font: "Arial", size: 20 })] }),
                  new Paragraph({ spacing: { before: 120 }, alignment: AlignmentType.RIGHT, children: [boldRun("Total Due", 22), new TextRun({ text: "\t\t", font: "Arial", size: 22 }), boldRun("Rs. 10,000.00", 22)] }),
                ]
              })
            ]
          })
        ]
      }),

      // Spacer
      new Paragraph({ spacing: { before: 600 }, children: [] }),

      // Signature line
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "000000", space: 1 } },
        children: [normalRun("", 20)]
      }),
      new Paragraph({ spacing: { before: 80 }, alignment: AlignmentType.RIGHT, children: [boldRun("Authorized Signatory", 20)] }),
      new Paragraph({ alignment: AlignmentType.RIGHT, children: [normalRun("Likhith Kumar Mankala", 20)] }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  // Modified path to be compatible with Windows
  fs.writeFileSync("./Invoice_Likhith_May2026.docx", buf);
  console.log("Done");
});
