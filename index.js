// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('declarationForm');
    
    // Form submission handler
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        generatePDF();
    });
});

function generatePDF() {
    const button = document.querySelector('.download-btn');
    button.classList.add('loading');
    button.textContent = 'Generating PDF';
    
    // Get form data
    const formData = getFormData();
    
    // Create PDF using jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Set font
    doc.setFont("helvetica");
    
    // Page 1
    generatePage1(doc, formData);
    
    // Add Page 2
    doc.addPage();
    generatePage2(doc, formData);
    
    // Save the PDF
    const nameForFile = formData.yourName ? formData.yourName.replace(/\s+/g, '_') : 'Blank';
    const fileName = `ESOP_Declaration_${nameForFile}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    // Reset button
    button.classList.remove('loading');
    button.textContent = 'Download PDF';
}

function getFormData() {
    // Get all form values
    const data = {
        todayDate: document.getElementById('todayDate').value,
        accountNumber: document.getElementById('accountNumber').value,
        branchName: document.getElementById('branchName').value,
        yourName: document.getElementById('yourName').value,
        foreignCompany: document.getElementById('foreignCompany').value,
        fundTransfer: document.getElementById('fundTransfer').value,
        currency: document.getElementById('currency').value,
        amount: document.getElementById('amount').value,
        receivedFrom: document.getElementById('receivedFrom').value,
        saleDate: document.getElementById('saleDate').value,
        amountRemitted: document.getElementById('amountRemitted').value,
        remittanceDate: document.getElementById('remittanceDate').value,
        bankName: document.getElementById('bankName').value,
        bankBranch: document.getElementById('bankBranch').value,
        indianCompany: document.getElementById('indianCompany').value,
        purposes: [],
        investments: []
    };
    
    // Get checked purposes
    const purposeCheckboxes = document.querySelectorAll('input[name="purpose"]:checked');
    purposeCheckboxes.forEach(cb => {
        data.purposes.push({
            value: cb.value,
            label: cb.nextElementSibling.textContent
        });
    });
    
    // Get checked investments
    const investmentCheckboxes = document.querySelectorAll('input[name="investment"]:checked');
    investmentCheckboxes.forEach(cb => {
        data.investments.push({
            value: cb.value,
            label: cb.nextElementSibling.textContent
        });
    });
    
    return data;
}

function generatePage1(doc, data) {
    let yPos = 20;
    
    // Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Customer Declaration - ESOP/Portfolio Investment Inward Wire Remittances", 105, yPos, { align: "center" });
    
    yPos += 7;
    doc.setFontSize(11);
    doc.text("(For repatriation within 180 days)", 105, yPos, { align: "center" });
    
    yPos += 15;
    
    // Date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Date: ", 150, yPos);
    const dateField = formatFieldValue(data.todayDate ? formatDate(data.todayDate) : null);
    addUnderlinedText(doc, dateField.text, 150 + doc.getTextWidth("Date: "), yPos, dateField.isFilled);
    
    yPos += 10;
    
    // Address section
    doc.text("To,", 20, yPos);
    yPos += 7;
    doc.text("Asst General Manager", 20, yPos);
    yPos += 7;
    doc.text("State Bank of India", 20, yPos);
    yPos += 7;
    doc.text("Tanuku Branch.", 20, yPos);
    
    yPos += 12;
    
    // Salutation
    doc.text("Dear Sir/Madam,", 20, yPos);
    
    yPos += 10;
    
    // Account details - with justified text and proper margins
    const leftMargin = 20;
    const rightMargin = 190; // Page width is approximately 210mm, leaving 20mm margin on right
    const lineWidth = rightMargin - leftMargin;
    
    // Line 1: "I hold the account number _____ with State Bank of India,"
    const line1Part1 = "I hold the account number ";
    const accountField = formatFieldValue(data.accountNumber);
    const line1Part3 = " with State Bank of India,";
    
    // Build the full line 1 text for justification
    const line1Text = line1Part1 + accountField.text + line1Part3;
    addJustifiedText(doc, line1Text, leftMargin, yPos, lineWidth);
    
    // Add underline for account number if filled
    if (accountField.isFilled) {
        const accountStartX = leftMargin + doc.getTextWidth(line1Part1);
        const accountWidth = doc.getTextWidth("  " + accountField.text + "  ");
        doc.line(accountStartX, yPos + 0.5, accountStartX + accountWidth, yPos + 0.5);
    }
    
    yPos += 7;
    
    // Line 2: "_____ Branch. This is to confirm that I will be receiving inward wire remittances in the"
    const branchField = formatFieldValue(data.branchName);
    const line2Part2 = " Branch. This is to confirm that I will be receiving inward wire remittances in the";
    
    const line2Text = branchField.text + line2Part2;
    addJustifiedText(doc, line2Text, leftMargin, yPos, lineWidth);
    
    // Add underline for branch if filled
    if (branchField.isFilled) {
        const branchWidth = doc.getTextWidth("  " + branchField.text + "  ");
        doc.line(leftMargin, yPos + 0.5, leftMargin + branchWidth, yPos + 0.5);
    }
    
    yPos += 7;
    
    // Line 3: "aforementioned account and the purpose of the remittance would be: (tick wherever applicable)"
    const line3Text = "aforementioned account and the purpose of the remittance would be: (tick wherever applicable)";
    addJustifiedText(doc, line3Text, leftMargin, yPos, lineWidth);
    
    yPos += 10;
    
    // Purpose checkboxes
    const purposes = [
        { code: "P0001", text: "Repatriation of Indian Portfolio investment abroad in equity capital (shares)" },
        { code: "P0002", text: "Repatriation of Indian Portfolio investment abroad in debt instruments" },
        { code: "P0021", text: "Receipts on account of sale of share under Employee stock option" },
        { code: "P1411", text: "Inward remittance of interest income on account of Portfolio Investment made abroad" },
        { code: "P1412", text: "Inward remittance of dividends on account of Portfolio Investment made abroad on equity" }
    ];
    
    purposes.forEach(purpose => {
        const isChecked = data.purposes.some(p => p.value === purpose.code);
        drawCheckbox(doc, 20, yPos, isChecked);
        doc.text(`${purpose.code} - ${purpose.text}`, 27, yPos);
        yPos += 7;
    });
    
    doc.text("and investment fund shares", 27, yPos);
    yPos += 10;
    
    // Details section
    doc.text("Details of the remittances are as below:", 20, yPos);
    yPos += 10;
    
    // Company name
    doc.text(`• Name of the foreign company (Applicable for ESOP transactions only):`, 20, yPos);
    yPos += 7;
    const companyField = formatFieldValue(data.foreignCompany, "___________________________________________");
    doc.setFont("helvetica", "bold");
    addUnderlinedText(doc, companyField.text, 20, yPos, companyField.isFilled);
    doc.setFont("helvetica", "normal");
    yPos += 10;
    
    // Fund transfer
    doc.text(`• Fund Transfer from overseas broking account maintained with (Applicable for Portfolio Investments`, 20, yPos);
    yPos += 7;
    doc.text("only): ", 20, yPos);
    const fundField = formatFieldValue(data.fundTransfer, "___________________________________________");
    addUnderlinedText(doc, fundField.text, 20 + doc.getTextWidth("only): "), yPos, fundField.isFilled);
    yPos += 10;
    
    // Currency
    doc.text("• Currency of remittance: ", 20, yPos);
    const currencyField = formatFieldValue(data.currency);
    addUnderlinedText(doc, currencyField.text, 20 + doc.getTextWidth("• Currency of remittance: "), yPos, currencyField.isFilled);
    yPos += 10;
    
    // Amount
    doc.text("• Amount: ", 20, yPos);
    const amountField = formatFieldValue(data.amount);
    addUnderlinedText(doc, amountField.text, 20 + doc.getTextWidth("• Amount: "), yPos, amountField.isFilled);
    yPos += 10;
    
    // Received from
    doc.text("• Received from: ", 20, yPos);
    const receivedField = formatFieldValue(data.receivedFrom);
    addUnderlinedText(doc, receivedField.text, 20 + doc.getTextWidth("• Received from: "), yPos, receivedField.isFilled);
    yPos += 10;
    
    // Sale date
    doc.text("• Date of sale of ESOPs/ESUs/RSUs/Portfolio investments: ", 20, yPos);
    const saleDateField = formatFieldValue(data.saleDate ? formatDate(data.saleDate) : null);
    addUnderlinedText(doc, saleDateField.text, 20 + doc.getTextWidth("• Date of sale of ESOPs/ESUs/RSUs/Portfolio investments: "), yPos, saleDateField.isFilled);
    yPos += 12;
    
    // Investment details
    doc.text("I further confirm that the underlying investments were: (tick wherever applicable)", 20, yPos);
    yPos += 10;
    
    // Investment checkboxes
    const investments = [
        { value: "cashless", text: "Issued to me by the above company under the 'Cashless Employees Stock Option Scheme'" },
        { value: "rsu", text: "Allotted to me as an RSU (Restricted Stock Unit)" },
        { value: "dspp", text: "Allotted to me under DSPP (Direct Stock Purchase Plan)" },
        { value: "gift", text: "Acquired by way of gift from any person resident outside India" },
        { value: "inheritance", text: "Acquired by way of inheritance from a person whether a resident in or outside India" }
    ];
    
    investments.forEach(investment => {
        const isChecked = data.investments.some(i => i.value === investment.value);
        drawCheckbox(doc, 20, yPos, isChecked);
        doc.text(investment.text, 27, yPos);
        yPos += 7;
    });
}

function generatePage2(doc, data) {
    let yPos = 20;
    
    // Continued checkboxes from page 1
    const remainingInvestments = [
        { value: "nri", text: "Acquired when I was an NRI" },
        { value: "lrs", text: "Purchased by me through an outward remittance under the extant Liberalised Remittance Scheme" }
    ];
    
    remainingInvestments.forEach(investment => {
        const isChecked = data.investments.some(i => i.value === investment.value);
        drawCheckbox(doc, 20, yPos, isChecked);
        doc.text(investment.text, 27, yPos);
        yPos += 7;
    });
    
    doc.text("(LRS) limit", 27, yPos);
    yPos += 10;
    
    // Outward remittance details
    doc.text("Details of outward remittance are as under:", 20, yPos);
    yPos += 10;
    
    // Table header
    doc.setFontSize(9);
    const tableHeaders = ["Amount Remitted (in FCY)", "Date of remittance", "Name of the Bank", "Bank Branch Name"];
    const colWidths = [45, 40, 50, 45];
    let xPos = 20;
    
    tableHeaders.forEach((header, index) => {
        doc.text(header, xPos, yPos);
        xPos += colWidths[index];
    });
    
    yPos += 7;
    
    // Table data
    xPos = 20;
    const amtRemittedField = formatFieldValue(data.amountRemitted, "");
    if (amtRemittedField.isFilled) {
        addUnderlinedText(doc, amtRemittedField.text, xPos, yPos, true);
    }
    xPos += colWidths[0];
    
    const remitDateField = formatFieldValue(data.remittanceDate ? formatDate(data.remittanceDate) : null, "");
    if (remitDateField.isFilled) {
        addUnderlinedText(doc, remitDateField.text, xPos, yPos, true);
    }
    xPos += colWidths[1];
    
    const bankNameField = formatFieldValue(data.bankName, "");
    if (bankNameField.isFilled) {
        addUnderlinedText(doc, bankNameField.text, xPos, yPos, true);
    }
    xPos += colWidths[2];
    
    const bankBranchField = formatFieldValue(data.bankBranch, "");
    if (bankBranchField.isFilled) {
        addUnderlinedText(doc, bankBranchField.text, xPos, yPos, true);
    }
    
    yPos += 15;
    doc.setFontSize(10);
    
    // Compliance statement
    doc.text("I undertake to inform the Indian company ", 20, yPos);
    const indianCompanyField = formatFieldValue(data.indianCompany, "_____________________________");
    xPos = 20 + doc.getTextWidth("I undertake to inform the Indian company ");
    xPos += addUnderlinedText(doc, indianCompanyField.text, xPos, yPos, indianCompanyField.isFilled);
    doc.text(" to comply", xPos, yPos);
    yPos += 7;
    addJustifiedText(doc, "with the applicable regulatory reporting requirements in case of buy-back of ESOPs (Applicable for", 20, yPos, 170);
    yPos += 7;
    doc.text("Buy-back ESOP transactions only).", 20, yPos);
    
    yPos += 15;
    
    // FEMA Undertaking
    doc.setFont("helvetica", "bold");
    doc.text("Undertaking Under FEMA, 1999", 20, yPos);
    doc.setFont("helvetica", "normal");
    
    yPos += 10;
    
    // FEMA text (justified)
    const femaText = "I hereby declare that the transaction does not involve and is not designed for the purpose of any contravention or evasion of the provision of the aforesaid act or any rule, regulation, notification, direction, or order made there under. I also understand that if I refuse to comply with any such requirement or make any unsatisfactory compliance therewith, the Bank shall refuse in writing to undertake the transaction and shall, if it has reason to believe that any contravention/evasion is contemplated by me, report the matter to RBI. I also hereby agree and undertake to give such information/documents as will reasonably satisfy the Bank about this transaction in terms of the above declaration.";
    
    const splitText = doc.splitTextToSize(femaText, 170);
    splitText.forEach((line, index) => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        // Justify all lines except the last one
        if (index < splitText.length - 1) {
            addJustifiedText(doc, line, 20, yPos, 170);
        } else {
            doc.text(line, 20, yPos);
        }
        yPos += 7;
    });
    
    yPos += 10;
    
    // Note
    doc.setFont("helvetica", "bold");
    doc.text("Please note:", 20, yPos);
    doc.setFont("helvetica", "normal");
    yPos += 7;
    
    const noteText = "Any unused forex amount (unless reinvested) / proceed of shares acquired under ESOP scheme, should be repatriated immediately within a period of 180 days, from the date of realization or date of return to India (applicable for the date of realization after August 22, 2022. The repatriation period prior to August 22, 2022, is 90 days only), as the case may be.";
    const splitNote = doc.splitTextToSize(noteText, 170);
    splitNote.forEach((line, index) => {
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
        // Justify all lines except the last one
        if (index < splitNote.length - 1) {
            addJustifiedText(doc, line, 20, yPos, 170);
        } else {
            doc.text(line, 20, yPos);
        }
        yPos += 7;
    });
    
    yPos += 15;
    
    // Closing
    doc.text("Regards,", 20, yPos);
    
    yPos += 20;
    
    // Signature line
    doc.text("_____________________________", 20, yPos);
    yPos += 7;
    if (data.yourName) {
        const nameField = formatFieldValue(data.yourName);
        doc.text("(", 20, yPos);
        const nameX = 20 + doc.getTextWidth("(");
        const nameWidth = addUnderlinedText(doc, nameField.text, nameX, yPos, nameField.isFilled);
        doc.text(")", nameX + nameWidth, yPos);
    }
    yPos += 7;
    doc.text("(Name & Signature)", 20, yPos);
}

function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Helper function to add underlined text with padding
function addUnderlinedText(doc, text, x, y, isFilled = false) {
    if (isFilled) {
        // Add padding to the text
        const paddedText = `  ${text}  `;
        doc.text(paddedText, x, y);
        
        // Get text width and add underline
        const textWidth = doc.getTextWidth(paddedText);
        doc.line(x, y + 0.5, x + textWidth, y + 0.5);
        
        return textWidth;
    } else {
        // Just show the blank line
        doc.text(text, x, y);
        return doc.getTextWidth(text);
    }
}

// Helper function to format field value with underline
function formatFieldValue(value, defaultBlank = "_____________") {
    return {
        text: value || defaultBlank,
        isFilled: !!value
    };
}

// Helper function to draw checkbox
function drawCheckbox(doc, x, y, isChecked = false) {
    const size = 3;
    // Draw rectangle for checkbox
    doc.rect(x, y - size + 0.5, size, size);
    
    // If checked, draw an X inside
    if (isChecked) {
        doc.line(x + 0.3, y - size + 0.8, x + size - 0.3, y - 0.2);
        doc.line(x + size - 0.3, y - size + 0.8, x + 0.3, y - 0.2);
    }
}

// Helper function to justify text (spread words evenly across the line)
function addJustifiedText(doc, text, x, y, maxWidth) {
    const words = text.split(' ');
    const totalTextWidth = doc.getTextWidth(text.replace(/\s+/g, ''));
    const totalSpaceWidth = maxWidth - totalTextWidth;
    const spaceWidth = totalSpaceWidth / (words.length - 1);
    
    let currentX = x;
    words.forEach((word, index) => {
        doc.text(word, currentX, y);
        currentX += doc.getTextWidth(word);
        if (index < words.length - 1) {
            currentX += spaceWidth;
        }
    });
}
