export const exportToCSV = (data: any[], filename: string, headers?: string[]) => {
    if (!data || !data.length) return;

    const dataKeys = Object.keys(data[0]);
    const headerRow = headers ? headers.join(',') : dataKeys.join(',');

    const rows = data.map(row => {
        return Object.values(row).map(value => {
            let str = value === null || value === undefined ? '' : String(value);
            // Escape quotes and wrap in quotes to handle commas
            str = str.replace(/"/g, '""');
            return `"${str}"`;
        }).join(',');
    });

    const csvContent = [headerRow, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

export const exportToPDF = async (data: any[], filename: string, title?: string) => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    if (title) {
        doc.setFontSize(16);
        doc.text(title, 14, 20);
        doc.setFontSize(10);
    }

    let y = 30;
    const pageHeight = doc.internal.pageSize.height;

    data.forEach((row) => {
        const text = Object.values(row).map(v => String(v)).join(' | ');
        // Simple text wrapping or truncation might be needed
        const splitText = doc.splitTextToSize(text, 180);

        if (y + (splitText.length * 5) > pageHeight - 20) {
            doc.addPage();
            y = 20;
        }

        doc.text(splitText, 14, y);
        y += (splitText.length * 5) + 2;
    });

    doc.save(`${filename}.pdf`);
};

export const exportToExcel = (data: any[], filename: string) => {
    // Basic Excel XML format or just CSV disguised?
    // Since we don't have xlsx library, we will fallback to CSV but with .xls extension if requested
    exportToCSV(data, filename); // Fallback
};
