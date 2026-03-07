interface FinancialData {
  summary: {
    revenue: number;
    revenueGrowth: number;
    expenses: number;
    profit: number;
    profitMargin: number;
  };
  profitLoss?: {
    revenue: number;
    discount: number;
    cogs: number;
    operatingExpenses: number;
    netProfit: number;
  };
  balanceSheet: {
    cash: number;
    receivables: number;
    inventory: number;
    totalAssets: number;
    liabilities: number;
    equity: number;
    totalLiabilities: number;
  };
  cashFlow: {
    operating: { inflow: number; outflow: number; net: number };
    investing: { inflow: number; outflow: number; net: number };
    financing: { inflow: number; outflow: number; net: number };
    total: number;
  };
  startDate: string;
  endDate: string;
}

import { downloadPDFFromHTMLIframe } from './pdf-download';

export async function generateFinancialReportPDF(data: FinancialData) {
  const html = generateFinancialReportHTML(data);

  // Generate filename
  const { startDate, endDate } = data;
  const filename = `Laporan_Keuangan_${startDate}_${endDate}.pdf`;

  await downloadPDFFromHTMLIframe(html, filename);
}

function generateFinancialReportHTML(data: FinancialData): string {
  const { summary, balanceSheet, cashFlow, startDate, endDate } = data;
  // Handle optional profitLoss with defaults based on summary data
  const profitLoss = data.profitLoss ?? {
    revenue: summary.revenue,
    discount: 0,
    cogs: 0,
    operatingExpenses: summary.expenses,
    netProfit: summary.profit,
  };
  const date = new Date().toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Laporan Keuangan</title>
  <style>
    @page {
      size: A4;
      margin: 18mm 20mm 25mm 20mm;
      @bottom-center {
        content: counter(page) " / " counter(pages);
        font-size: 8pt;
        color: #9ca3af;
      }
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 10pt;
      line-height: 1.5;
      color: #1f2937;
      background: #fff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 3px solid #111827;
      padding-bottom: 16px;
      margin-bottom: 28px;
    }
    .header-left .brand {
      font-size: 11pt;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #10b981;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .header-left .title {
      font-size: 22pt;
      font-weight: 700;
      color: #111827;
      line-height: 1.2;
    }
    .header-right {
      text-align: right;
      font-size: 9pt;
      color: #6b7280;
      line-height: 1.6;
    }
    .header-right .period-label {
      font-weight: 600;
      color: #374151;
      font-size: 9.5pt;
    }
    .section {
      margin-bottom: 28px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 12pt;
      font-weight: 700;
      color: #111827;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .section-title::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 16px;
      background: #10b981;
      border-radius: 2px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .summary-card {
      border: 1px solid #e5e7eb;
      padding: 14px 16px;
      border-radius: 6px;
      background: #f9fafb;
    }
    .summary-label {
      font-size: 8pt;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 6px;
    }
    .summary-value {
      font-size: 14pt;
      font-weight: 700;
      color: #111827;
    }
    .summary-sub {
      font-size: 8pt;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 9.5pt;
    }
    th, td {
      padding: 9px 12px;
      text-align: left;
    }
    th {
      background: #f3f4f6;
      font-weight: 700;
      color: #374151;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      border-bottom: 2px solid #d1d5db;
    }
    td {
      border-bottom: 1px solid #e5e7eb;
      color: #1f2937;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr.row-total {
      background: #f3f4f6;
      font-weight: 700;
    }
    tr.row-total td {
      border-top: 2px solid #d1d5db;
      border-bottom: 2px solid #d1d5db;
      padding-top: 10px;
      padding-bottom: 10px;
    }
    tr.row-header td {
      background: #fafafa;
      font-weight: 700;
      padding-top: 12px;
      color: #111827;
    }
    .text-right { text-align: right; }
    .text-bold { font-weight: 700; }
    .positive { color: #059669; }
    .negative { color: #dc2626; }
    .indent { padding-left: 28px !important; }
    .footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      font-size: 8pt;
      color: #9ca3af;
      display: flex;
      justify-content: space-between;
    }
    .content {
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <div class="brand">Warungin</div>
      <div class="title">Laporan Keuangan</div>
    </div>
    <div class="header-right">
      <div class="period-label">Periode Laporan</div>
      <div>${formatDate(startDate)} — ${formatDate(endDate)}</div>
      <div style="margin-top: 4px;">Dicetak: ${date}</div>
    </div>
  </div>
  
  <div class="content">
    <!-- Financial Summary -->
    <div class="section">
      <h2 class="section-title">Ringkasan Keuangan</h2>
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Total Revenue</div>
          <div class="summary-value">${formatCurrency(summary.revenue)}</div>
          <div class="summary-sub ${summary.revenueGrowth >= 0 ? 'positive' : 'negative'}">
            ${summary.revenueGrowth >= 0 ? '▲' : '▼'} ${Math.abs(summary.revenueGrowth)}% vs periode lalu
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Total Expenses</div>
          <div class="summary-value">${formatCurrency(summary.expenses)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Net Profit</div>
          <div class="summary-value ${summary.profit >= 0 ? 'positive' : 'negative'}">
            ${formatCurrency(summary.profit)}
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Profit Margin</div>
          <div class="summary-value">${summary.profitMargin}%</div>
        </div>
      </div>
    </div>

    <!-- Profit & Loss -->
    <div class="section">
      <h2 class="section-title">Laba Rugi</h2>
      <table>
        <thead>
          <tr>
            <th>Keterangan</th>
            <th class="text-right">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Revenue</td>
            <td class="text-right">${formatCurrency(profitLoss.revenue)}</td>
          </tr>
          <tr>
            <td>Discount</td>
            <td class="text-right negative">(${formatCurrency(profitLoss.discount)})</td>
          </tr>
          <tr>
            <td>Cost of Goods Sold (COGS)</td>
            <td class="text-right negative">(${formatCurrency(profitLoss.cogs)})</td>
          </tr>
          <tr>
            <td>Operating Expenses</td>
            <td class="text-right negative">(${formatCurrency(profitLoss.operatingExpenses)})</td>
          </tr>
          <tr class="row-total">
            <td>Net Profit</td>
            <td class="text-right ${profitLoss.netProfit >= 0 ? 'positive' : 'negative'}">
              ${formatCurrency(profitLoss.netProfit)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Balance Sheet -->
    <div class="section">
      <h2 class="section-title">Neraca</h2>
      <table>
        <thead>
          <tr>
            <th>Keterangan</th>
            <th class="text-right">Jumlah</th>
          </tr>
        </thead>
        <tbody>
          <tr class="row-header">
            <td>Assets</td>
            <td></td>
          </tr>
          <tr>
            <td class="indent">Cash & Bank</td>
            <td class="text-right">${formatCurrency(balanceSheet.cash)}</td>
          </tr>
          <tr>
            <td class="indent">Accounts Receivable</td>
            <td class="text-right">${formatCurrency(balanceSheet.receivables)}</td>
          </tr>
          <tr>
            <td class="indent">Inventory</td>
            <td class="text-right">${formatCurrency(balanceSheet.inventory)}</td>
          </tr>
          <tr class="row-total">
            <td>Total Assets</td>
            <td class="text-right">${formatCurrency(balanceSheet.totalAssets)}</td>
          </tr>
          <tr class="row-header">
            <td>Liabilities & Equity</td>
            <td></td>
          </tr>
          <tr>
            <td class="indent">Hutang Usaha</td>
            <td class="text-right">${formatCurrency(balanceSheet.liabilities)}</td>
          </tr>
          <tr>
            <td class="indent">Modal (Equity)</td>
            <td class="text-right">${formatCurrency(balanceSheet.equity)}</td>
          </tr>
          <tr class="row-total">
            <td>Total Liabilities & Equity</td>
            <td class="text-right">${formatCurrency(balanceSheet.totalLiabilities)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Cash Flow -->
    <div class="section">
      <h2 class="section-title">Cash Flow</h2>
      <table>
        <thead>
          <tr>
            <th>Keterangan</th>
            <th class="text-right">Inflow</th>
            <th class="text-right">Outflow</th>
            <th class="text-right">Net</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Aktivitas Operasi</strong></td>
            <td class="text-right">${formatCurrency(cashFlow.operating.inflow)}</td>
            <td class="text-right negative">(${formatCurrency(cashFlow.operating.outflow)})</td>
            <td class="text-right ${cashFlow.operating.net >= 0 ? 'positive' : 'negative'}">
              ${formatCurrency(cashFlow.operating.net)}
            </td>
          </tr>
          <tr>
            <td><strong>Aktivitas Investasi</strong></td>
            <td class="text-right">${formatCurrency(cashFlow.investing.inflow)}</td>
            <td class="text-right negative">(${formatCurrency(cashFlow.investing.outflow)})</td>
            <td class="text-right ${cashFlow.investing.net >= 0 ? 'positive' : 'negative'}">
              ${formatCurrency(cashFlow.investing.net)}
            </td>
          </tr>
          <tr>
            <td><strong>Aktivitas Pendanaan</strong></td>
            <td class="text-right">${formatCurrency(cashFlow.financing.inflow)}</td>
            <td class="text-right negative">(${formatCurrency(cashFlow.financing.outflow)})</td>
            <td class="text-right ${cashFlow.financing.net >= 0 ? 'positive' : 'negative'}">
              ${formatCurrency(cashFlow.financing.net)}
            </td>
          </tr>
          <tr class="row-total">
            <td>Total Cash Flow</td>
            <td></td>
            <td></td>
            <td class="text-right ${cashFlow.total >= 0 ? 'positive' : 'negative'}">
              ${formatCurrency(cashFlow.total)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  
  <div class="footer">
    <span>Dibuat oleh Warungin POS System</span>
    <span>${date}</span>
  </div>
</body>
</html>
  `;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

