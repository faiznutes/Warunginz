/**
 * Thermal Receipt Print Templates
 * 2 models: Klasik (monospace/dot-matrix style) and Modern (clean sans-serif)
 * Supports 58mm and 80mm thermal paper
 */

export interface ReceiptPrintData {
    orderNumber: string;
    date: string;
    customerName?: string;
    cashierName?: string;
    servedBy?: string;
    shiftType?: string | null;
    items: {
        name: string;
        quantity: number;
        price: number;
        subtotal: number;
        discount?: number;
    }[];
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: string;
    change?: number;
}

export interface ReceiptPrintOptions {
    receiptData: ReceiptPrintData;
    tenantName: string;
    tenantAddress: string;
    tenantPhone: string;
    paperSize: '58mm' | '80mm';
}

const formatCurrency = (amount: number): string => {
    return 'Rp ' + amount.toLocaleString('id-ID');
};

const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

const formatTime = (date: string): string => {
    return new Date(date).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
};

const getPaymentLabel = (method: string): string => {
    const labels: Record<string, string> = {
        CASH: 'Tunai',
        CARD: 'Kartu',
        E_WALLET: 'E-Wallet',
        QRIS: 'QRIS',
        BANK_TRANSFER: 'Transfer',
        SHOPEEPAY: 'ShopeePay',
        DANA: 'Dana',
        MIDTRANS: 'Midtrans',
    };
    return labels[method] || method;
};

// ============================================================
// TEMPLATE 1: KLASIK — Monospace / Dot-Matrix Style
// ============================================================

export function generateKlasikReceipt(options: ReceiptPrintOptions): string {
    const { receiptData, tenantName, tenantAddress, tenantPhone, paperSize } = options;
    const is58 = paperSize === '58mm';
    const charWidth = is58 ? 32 : 48;
    const separator = '='.repeat(charWidth);
    const dashSep = '-'.repeat(charWidth);

    const center = (text: string): string => {
        const pad = Math.max(0, Math.floor((charWidth - text.length) / 2));
        return ' '.repeat(pad) + text;
    };

    const leftRight = (left: string, right: string): string => {
        const space = Math.max(1, charWidth - left.length - right.length);
        return left + ' '.repeat(space) + right;
    };

    // Build item lines
    let itemLines = '';
    for (const item of receiptData.items) {
        const nameLine = item.name.length > charWidth - 2
            ? item.name.substring(0, charWidth - 2)
            : item.name;
        const qtyPrice = `  ${item.quantity}x ${formatCurrency(item.price)}`;
        const subtotalStr = formatCurrency(item.subtotal);

        itemLines += `${nameLine}\n`;
        itemLines += `${leftRight(qtyPrice, subtotalStr)}\n`;

        if (item.discount && item.discount > 0) {
            itemLines += `  Disc: -${formatCurrency(item.discount)}\n`;
        }
    }

    const receiptText = `
${center(tenantName.toUpperCase())}
${tenantAddress ? center(tenantAddress) : ''}
${tenantPhone ? center('Telp: ' + tenantPhone) : ''}
${separator}
${leftRight('No:', '#' + receiptData.orderNumber)}
${leftRight('Tgl:', formatDate(receiptData.date))}
${leftRight('Jam:', formatTime(receiptData.date) + ' WIB')}
${receiptData.cashierName || receiptData.servedBy ? leftRight('Kasir:', receiptData.cashierName || receiptData.servedBy || '') : ''}
${receiptData.customerName ? leftRight('Plgn:', receiptData.customerName) : ''}
${separator}
${itemLines}${dashSep}
${leftRight('Subtotal', formatCurrency(receiptData.subtotal))}
${receiptData.discount > 0 ? leftRight('Diskon', '-' + formatCurrency(receiptData.discount)) : ''}
${separator}
${leftRight('TOTAL', formatCurrency(receiptData.total))}
${separator}
${leftRight('Bayar (' + getPaymentLabel(receiptData.paymentMethod) + ')', formatCurrency(receiptData.total + (receiptData.change || 0)))}
${receiptData.change && receiptData.change > 0 ? leftRight('Kembali', formatCurrency(receiptData.change)) : ''}
${dashSep}

${center('*** Terima Kasih ***')}
${center('Simpan struk sebagai')}
${center('bukti pembayaran')}

${center(receiptData.orderNumber)}
`.trim();

    const pageWidth = is58 ? '58mm' : '80mm';
    const contentWidth = is58 ? '48mm' : '72mm';
    const fontSize = is58 ? '8px' : '10px';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${receiptData.orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page {
      size: ${pageWidth} auto;
      margin: 0;
    }
    body {
      font-family: 'Courier New', 'Courier', monospace;
      font-size: ${fontSize};
      line-height: 1.4;
      color: #000;
      background: #fff;
    }
    .receipt {
      width: ${contentWidth};
      max-width: ${contentWidth};
      margin: 0 auto;
      padding: 4mm 2mm;
      white-space: pre-wrap;
      word-break: break-word;
    }
    @media print {
      body { background: transparent; }
      .receipt { padding: 2mm 1mm; }
    }
  </style>
</head>
<body>
  <div class="receipt">${receiptText}</div>
</body>
</html>`;
}


// ============================================================
// TEMPLATE 2: MODERN — Clean Sans-Serif Style
// ============================================================

export function generateModernReceipt(options: ReceiptPrintOptions): string {
    const { receiptData, tenantName, tenantAddress, tenantPhone, paperSize } = options;
    const is58 = paperSize === '58mm';
    const pageWidth = is58 ? '58mm' : '80mm';
    const contentWidth = is58 ? '48mm' : '72mm';
    const fontSize = is58 ? '8px' : '9px';
    const titleSize = is58 ? '11px' : '14px';
    const totalSize = is58 ? '13px' : '16px';

    // Build item rows
    let itemRows = '';
    for (const item of receiptData.items) {
        itemRows += `
      <div class="item">
        <div class="item-name">${item.name}</div>
        <div class="item-detail">
          <span>${item.quantity} × ${formatCurrency(item.price)}</span>
          <span class="item-total">${formatCurrency(item.subtotal)}</span>
        </div>
        ${item.discount && item.discount > 0 ? `<div class="item-disc">Disc: -${formatCurrency(item.discount)}</div>` : ''}
      </div>`;
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${receiptData.orderNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page {
      size: ${pageWidth} auto;
      margin: 0;
    }
    body {
      font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
      font-size: ${fontSize};
      line-height: 1.5;
      color: #1e293b;
      background: #fff;
    }
    .receipt {
      width: ${contentWidth};
      max-width: ${contentWidth};
      margin: 0 auto;
      padding: 4mm 2mm;
    }

    /* Header */
    .header {
      text-align: center;
      padding-bottom: 3mm;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 2mm;
    }
    .header .logo {
      font-size: ${titleSize};
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 1mm;
    }
    .header .info {
      font-size: ${is58 ? '7px' : '8px'};
      color: #64748b;
      line-height: 1.4;
    }

    /* Meta */
    .meta {
      padding: 2mm 0;
      border-bottom: 1px dotted #cbd5e1;
      margin-bottom: 2mm;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5mm 0;
    }
    .meta-label { color: #94a3b8; font-size: ${is58 ? '7px' : '8px'}; }
    .meta-value { font-weight: 600; font-size: ${is58 ? '7px' : '8px'}; }

    /* Items */
    .items { padding: 2mm 0; }
    .item {
      padding: 1.5mm 0;
      border-bottom: 1px dotted #e2e8f0;
    }
    .item:last-child { border-bottom: none; }
    .item-name {
      font-weight: 600;
      margin-bottom: 0.5mm;
    }
    .item-detail {
      display: flex;
      justify-content: space-between;
      color: #64748b;
      font-size: ${is58 ? '7px' : '8px'};
    }
    .item-total { font-weight: 600; color: #1e293b; }
    .item-disc {
      font-size: ${is58 ? '6px' : '7px'};
      color: #10b981;
      font-style: italic;
      margin-top: 0.3mm;
    }

    /* Summary */
    .summary {
      padding: 2mm 0;
      border-top: 1px solid #e2e8f0;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5mm 0;
      color: #64748b;
    }
    .summary-row span:last-child { font-weight: 500; color: #1e293b; }
    .summary-row.discount span:last-child { color: #10b981; }

    /* Total */
    .total-section {
      border-top: 2px solid #1e293b;
      padding: 2mm 0;
      margin-top: 1mm;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .total-label { font-weight: 700; font-size: ${is58 ? '9px' : '11px'}; }
    .total-value { font-weight: 700; font-size: ${totalSize}; }

    /* Payment */
    .payment {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 2mm;
      padding: 2mm;
      margin: 2mm 0;
      text-align: center;
    }
    .payment-method {
      font-weight: 700;
      text-transform: uppercase;
      font-size: ${is58 ? '7px' : '8px'};
      letter-spacing: 0.05em;
      color: #10b981;
      margin-bottom: 0.5mm;
    }
    .payment-detail {
      font-size: ${is58 ? '7px' : '8px'};
      color: #64748b;
    }

    /* Footer */
    .footer {
      text-align: center;
      padding-top: 3mm;
      border-top: 1px dotted #cbd5e1;
      margin-top: 2mm;
    }
    .footer .thanks {
      font-weight: 600;
      font-style: italic;
      font-size: ${is58 ? '8px' : '9px'};
      margin-bottom: 1mm;
    }
    .footer .note {
      font-size: ${is58 ? '6px' : '7px'};
      color: #94a3b8;
      margin-bottom: 2mm;
    }
    .footer .order-id {
      font-family: 'Courier New', monospace;
      font-size: ${is58 ? '7px' : '8px'};
      letter-spacing: 0.1em;
      color: #94a3b8;
    }

    @media print {
      body { background: transparent; }
      .receipt { padding: 2mm 1mm; }
      .payment { background: transparent; border-color: #ccc; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <!-- Header -->
    <div class="header">
      <div class="logo">${tenantName}</div>
      <div class="info">
        ${tenantAddress ? tenantAddress + '<br>' : ''}
        ${tenantPhone ? 'Telp: ' + tenantPhone : ''}
      </div>
    </div>

    <!-- Meta -->
    <div class="meta">
      <div class="meta-row">
        <span class="meta-label">No. Transaksi</span>
        <span class="meta-value">#${receiptData.orderNumber}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Tanggal</span>
        <span class="meta-value">${formatDate(receiptData.date)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Waktu</span>
        <span class="meta-value">${formatTime(receiptData.date)} WIB</span>
      </div>
      ${receiptData.cashierName || receiptData.servedBy ? `
      <div class="meta-row">
        <span class="meta-label">Kasir</span>
        <span class="meta-value">${receiptData.cashierName || receiptData.servedBy}</span>
      </div>` : ''}
      ${receiptData.customerName ? `
      <div class="meta-row">
        <span class="meta-label">Pelanggan</span>
        <span class="meta-value">${receiptData.customerName}</span>
      </div>` : ''}
    </div>

    <!-- Items -->
    <div class="items">
      ${itemRows}
    </div>

    <!-- Summary -->
    <div class="summary">
      <div class="summary-row">
        <span>Subtotal</span>
        <span>${formatCurrency(receiptData.subtotal)}</span>
      </div>
      ${receiptData.discount > 0 ? `
      <div class="summary-row discount">
        <span>Diskon</span>
        <span>-${formatCurrency(receiptData.discount)}</span>
      </div>` : ''}
    </div>

    <!-- Total -->
    <div class="total-section">
      <div class="total-row">
        <span class="total-label">TOTAL</span>
        <span class="total-value">${formatCurrency(receiptData.total)}</span>
      </div>
    </div>

    <!-- Payment -->
    <div class="payment">
      <div class="payment-method">✓ Lunas — ${getPaymentLabel(receiptData.paymentMethod)}</div>
      ${receiptData.change && receiptData.change > 0 ? `
      <div class="payment-detail">Kembali: ${formatCurrency(receiptData.change)}</div>` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="thanks">Terima kasih telah berbelanja!</div>
      <div class="note">Simpan struk ini sebagai bukti pembayaran.</div>
      <div class="order-id">${receiptData.orderNumber}</div>
    </div>
  </div>
</body>
</html>`;
}
