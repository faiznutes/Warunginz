interface ReportData {
  template: string;
  tenants: Array<{ id: string; name: string }>;
  stats: any;
  startDate: string;
  endDate: string;
}

import { downloadPDFFromHTMLIframe } from './pdf-download';

export async function generateReportPDF(data: ReportData) {
  // Support both old and new template names for backward compatibility
  const templateMap: Record<string, string> = {
    'minimalist': 'clean',
    'modern': 'contemporary',
    'colorful': 'vibrant',
    'elegant': 'professional',
    'classic': 'contemporary', // Map classic to contemporary
    'clean': 'clean',
    'contemporary': 'contemporary',
    'vibrant': 'vibrant',
    'professional': 'professional',
    'executive': 'executive',
  };

  const normalizedTemplate = templateMap[data.template] || 'contemporary';

  const templateFunctions: Record<string, (data: ReportData) => string> = {
    clean: generateCleanTemplate,
    contemporary: generateContemporaryTemplate,
    vibrant: generateVibrantTemplate,
    professional: generateProfessionalTemplate,
    executive: generateExecutiveTemplate,
    // Legacy support
    minimalist: generateCleanTemplate,
    modern: generateContemporaryTemplate,
    colorful: generateVibrantTemplate,
    elegant: generateProfessionalTemplate,
  };

  const templateFunction = templateFunctions[normalizedTemplate];
  if (!templateFunction) {
    throw new Error(`Template tidak ditemukan: ${data.template}`);
  }

  const html = templateFunction(data);
  
  // Generate filename
  const { startDate, endDate } = data;
  const templateLabelMap: Record<string, string> = {
    clean: 'Clean',
    contemporary: 'Contemporary',
    vibrant: 'Vibrant',
    professional: 'Professional',
    executive: 'Executive',
    minimalist: 'Clean',
    modern: 'Contemporary',
    colorful: 'Vibrant',
    elegant: 'Professional',
  };
  const templateLabel = templateLabelMap[normalizedTemplate] || 'Laporan';
  const filename = `Laporan_${templateLabel}_${startDate}_${endDate}.pdf`;
  
  await downloadPDFFromHTMLIframe(html, filename);
}

// Template 1: Clean & Simple (formerly Minimalist)
function generateCleanTemplate(data: ReportData): string {
  const { stats, startDate, endDate } = data;
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
  <title>Laporan Tenant</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1f2937;
      background: #fff;
    }
    .header {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .title {
      font-size: 24pt;
      font-weight: 300;
      color: #111827;
      margin-bottom: 5px;
    }
    .subtitle {
      font-size: 10pt;
      color: #6b7280;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      border: 1px solid #e5e7eb;
      padding: 24px 20px;
      border-radius: 8px;
      background: #ffffff;
      transition: box-shadow 0.2s;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .stat-card:hover {
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .stat-label {
      font-size: 9pt;
      color: #6b7280;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }
    .stat-value {
      font-size: 22pt;
      font-weight: 600;
      color: #111827;
      line-height: 1.2;
    }
    .footer {
      position: fixed;
      bottom: 10mm;
      left: 20mm;
      font-size: 9pt;
      color: #9ca3af;
      background: transparent;
    }
    .content {
      margin-bottom: 30px;
      padding-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">Laporan Tenant</h1>
    <p class="subtitle">Periode: ${formatDate(startDate)} - ${formatDate(endDate)} | ${date}</p>
  </div>
  
  <div class="content">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Penjualan</div>
        <div class="stat-value">${formatCurrency(stats.totalSales || 0)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Pesanan</div>
        <div class="stat-value">${stats.totalOrders || 0}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Produk</div>
        <div class="stat-value">${stats.totalProducts || 0}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Pelanggan</div>
        <div class="stat-value">${stats.totalCustomers || 0}</div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <p>Dibuat oleh Warungin | ${date}</p>
  </div>
</body>
</html>
  `;
}

// Template 2: Contemporary (formerly Modern)
function generateContemporaryTemplate(data: ReportData): string {
  const { stats, startDate, endDate } = data;
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
  <title>Laporan Tenant</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1f2937;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .container {
      background: #fff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .title {
      font-size: 28pt;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .subtitle {
      font-size: 11pt;
      opacity: 0.9;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      margin-bottom: 35px;
    }
    .stat-card {
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 28px 25px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 12px rgba(0,0,0,0.15);
    }
    .stat-label {
      font-size: 10pt;
      color: #4b5563;
      margin-bottom: 12px;
      font-weight: 600;
      letter-spacing: 0.3px;
    }
    .stat-value {
      font-size: 26pt;
      font-weight: 700;
      color: #1f2937;
      line-height: 1.2;
    }
    .footer {
      position: fixed;
      bottom: 10mm;
      left: 15mm;
      font-size: 9pt;
      color: #6b7280;
      background: transparent;
    }
    .content {
      margin-bottom: 30px;
      padding-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">Laporan Tenant</h1>
      <p class="subtitle">Periode: ${formatDate(startDate)} - ${formatDate(endDate)} | ${date}</p>
    </div>
    
    <div class="content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Penjualan</div>
          <div class="stat-value">${formatCurrency(stats.totalSales || 0)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Pesanan</div>
          <div class="stat-value">${stats.totalOrders || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Produk</div>
          <div class="stat-value">${stats.totalProducts || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Pelanggan</div>
          <div class="stat-value">${stats.totalCustomers || 0}</div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <p>Dibuat oleh Warungin | ${date}</p>
  </div>
</body>
</html>
  `;
}

// Template 3: Vibrant (formerly Colorful)
function generateVibrantTemplate(data: ReportData): string {
  const { stats, startDate, endDate } = data;
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
  <title>Laporan Tenant</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1f2937;
      background: #fff;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      color: #fff;
      padding: 35px;
      border-radius: 16px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
    .title {
      font-size: 32pt;
      font-weight: 800;
      margin-bottom: 10px;
    }
    .subtitle {
      font-size: 11pt;
      opacity: 0.95;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      padding: 25px;
      border-radius: 16px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
      position: relative;
      overflow: hidden;
    }
    .stat-card:nth-child(1) {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }
    .stat-card:nth-child(2) {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: #fff;
    }
    .stat-card:nth-child(3) {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: #fff;
    }
    .stat-card:nth-child(4) {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: #fff;
    }
    .stat-label {
      font-size: 10pt;
      margin-bottom: 10px;
      font-weight: 600;
      opacity: 0.9;
    }
    .stat-value {
      font-size: 28pt;
      font-weight: 800;
    }
    .footer {
      position: fixed;
      bottom: 10mm;
      left: 15mm;
      font-size: 9pt;
      color: #6b7280;
      background: transparent;
    }
    .content {
      margin-bottom: 30px;
      padding-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">📊 Laporan Tenant</h1>
    <p class="subtitle">Periode: ${formatDate(startDate)} - ${formatDate(endDate)} | ${date}</p>
  </div>
  
  <div class="content">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">💰 Total Penjualan</div>
        <div class="stat-value">${formatCurrency(stats.totalSales || 0)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">🛒 Total Pesanan</div>
        <div class="stat-value">${stats.totalOrders || 0}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">📦 Total Produk</div>
        <div class="stat-value">${stats.totalProducts || 0}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">👥 Total Pelanggan</div>
        <div class="stat-value">${stats.totalCustomers || 0}</div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <p>Dibuat oleh Warungin | ${date}</p>
  </div>
</body>
</html>
  `;
}

// Template 4: Professional (formerly Elegant)
function generateProfessionalTemplate(data: ReportData): string {
  const { stats, startDate, endDate } = data;
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
  <title>Laporan Tenant</title>
  <style>
    @page {
      size: A4;
      margin: 30mm 25mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1f2937;
      background: #ffffff;
    }
    .container {
      background: #fff;
      padding: 40px;
      border: 1px solid #e5e7eb;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #059669;
      padding-bottom: 25px;
      margin-bottom: 35px;
    }
    .title {
      font-size: 28pt;
      font-weight: 600;
      color: #059669;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    .subtitle {
      font-size: 10pt;
      color: #6b7280;
      font-weight: 400;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 25px;
      margin-bottom: 35px;
    }
    .stat-card {
      text-align: center;
      padding: 30px 20px;
      border: 1px solid #d1d5db;
      background: #f9fafb;
      border-radius: 8px;
    }
    .stat-label {
      font-size: 9pt;
      color: #6b7280;
      margin-bottom: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-value {
      font-size: 26pt;
      font-weight: 700;
      color: #059669;
    }
    .footer {
      position: fixed;
      bottom: 10mm;
      left: 25mm;
      font-size: 9pt;
      color: #a0aec0;
      background: transparent;
      font-style: italic;
    }
    .content {
      margin-bottom: 30px;
      padding-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">Laporan Tenant</h1>
      <p class="subtitle">Periode: ${formatDate(startDate)} - ${formatDate(endDate)} | ${date}</p>
    </div>
    
    <div class="content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Penjualan</div>
          <div class="stat-value">${formatCurrency(stats.totalSales || 0)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Pesanan</div>
          <div class="stat-value">${stats.totalOrders || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Produk</div>
          <div class="stat-value">${stats.totalProducts || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Pelanggan</div>
          <div class="stat-value">${stats.totalCustomers || 0}</div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <p>Dibuat oleh Warungin | ${date}</p>
  </div>
</body>
</html>
  `;
}

// Template 5: Executive (NEW)
function generateExecutiveTemplate(data: ReportData): string {
  const { stats, startDate, endDate } = data;
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
  <title>Laporan Tenant</title>
  <style>
    @page {
      size: A4;
      margin: 25mm 20mm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #1a202c;
      background: #ffffff;
    }
    .container {
      background: #ffffff;
      padding: 40px;
      border: 2px solid #1a202c;
    }
    .header {
      border-bottom: 3px solid #F59E0B;
      padding-bottom: 25px;
      margin-bottom: 35px;
    }
    .title {
      font-size: 32pt;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 8px;
      letter-spacing: 1px;
      font-family: 'Georgia', serif;
    }
    .subtitle {
      font-size: 10pt;
      color: #4b5563;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 25px;
      margin-bottom: 35px;
    }
    .stat-card {
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      border: 1px solid #e5e7eb;
      border-left: 4px solid #F59E0B;
      padding: 25px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .stat-label {
      font-size: 9pt;
      color: #6b7280;
      margin-bottom: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .stat-value {
      font-size: 28pt;
      font-weight: 700;
      color: #1a202c;
      font-family: 'Georgia', serif;
    }
    .footer {
      position: fixed;
      bottom: 10mm;
      left: 20mm;
      font-size: 9pt;
      color: #9ca3af;
      background: transparent;
    }
    .content {
      margin-bottom: 30px;
      padding-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="title">Laporan Tenant</h1>
      <p class="subtitle">Periode: ${formatDate(startDate)} - ${formatDate(endDate)} | ${date}</p>
    </div>
    
    <div class="content">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Penjualan</div>
          <div class="stat-value">${formatCurrency(stats.totalSales || 0)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Pesanan</div>
          <div class="stat-value">${stats.totalOrders || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Produk</div>
          <div class="stat-value">${stats.totalProducts || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Pelanggan</div>
          <div class="stat-value">${stats.totalCustomers || 0}</div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="footer">
    <p>Dibuat oleh Warungin | ${date}</p>
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

