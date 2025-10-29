// =========================================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION
// =========================================================

// (Replace with your actual Firebase config)
const firebaseConfig = {
    apiKey: "AIzaSyDCGsnpr6SVf7rbSnRi2ipt5suZD99B2u4",
    authDomain: "student-database-1882d.firebaseapp.com",
    databaseURL: "https://student-database-1882d-default-rtdb.firebaseio.com",
    projectId: "student-database-1882d",
    storageBucket: "student-database-1882d.firebasestorage.app",
    messagingSenderId: "420379838808",
    appId: "1:420379838808:web:bb4206ea2fed40f3907d2d",
    measurementId: "G-MY77MRJJTM"
};

if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = typeof firebase !== 'undefined' ? firebase.database() : null;
const STUDENTS_NODE = "students";

// यह वेरिएबल स्टोर करता है कि फॉर्म में मौजूद Folio ID पहले से डेटाबेस में मौजूद है या नहीं।
let isExistingRecord = false;


// =========================================================
// 2. UTILITY FUNCTIONS (Match Logic is Key Here)
// =========================================================

// Aadhaar, Date formatting functions
function formatDateToDB(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date)) return null;
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options).replace(/ /g, '-').toUpperCase();
}

function formatAadhaar(value) {
    if (!value) return '';
    const cleanValue = value.toString().replace(/-/g, '').substring(0, 12);
    const parts = [];
    for (let i = 0; i < cleanValue.length; i += 4) {
        parts.push(cleanValue.substring(i, i + 4));
    }
    return parts.join('-');
}

function convertDBDateToForm(dbDate) {
    if (!dbDate) return '';
    const parts = dbDate.split('-');
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const monthIndex = monthNames.indexOf(parts[1]);

    if (monthIndex === -1) return '';

    const year = parts[2];
    const month = (monthIndex + 1).toString().padStart(2, '0');
    const day = parts[0];

    return `${year}-${month}-${day}`;
}

/**
 * Checks a group of two or three fields for matching values, and updates their labels based on status.
 */
function updateTripleMatchStatus(fieldIds) {
    // 1. Get values and labels
    const fields = fieldIds.map(id => {
        const element = document.getElementById(id);
        return {
            id: id,
            value: element ? element.value.trim().toUpperCase() : '',
            label: document.querySelector(`label[for="${id}"]`)
        };
    });

    const non_empty_fields = fields.filter(f => f.value !== '');

    // 2. Clear previous state and reset color/checkmarks
    fields.forEach(f => {
        if (f.label) {
            f.label.style.color = 'var(--text-secondary)';
            const check = f.label.querySelector('.match-check');
            if (check) check.remove();

            // If empty, set label to orange
            if (f.value === '') {
                f.label.style.color = 'var(--text-warning-orange)';
            }
        }
    });

    // If less than 2 fields have data, return
    if (non_empty_fields.length < 2) {
        return false;
    }

    // Check if ALL non-empty fields match
    const allMatch = non_empty_fields.every(f => f.value === non_empty_fields[0].value);

    const activeLabels = non_empty_fields.map(f => f.label).filter(label => label !== null);

    if (allMatch) {
        // All non-empty match: Add green checkmark
        activeLabels.forEach(label => {
            label.style.color = 'var(--primary-color)';
            const checkmark = document.createElement('i');
            checkmark.className = 'fas fa-check-circle match-check';
            checkmark.style.color = 'var(--primary-color)';
            checkmark.style.marginLeft = '5px';
            label.appendChild(checkmark);
        });
        return true;
    } else {
        // Mismatch: Color all non-empty labels red
        activeLabels.forEach(label => {
            label.style.color = 'var(--text-danger)';
        });
        return false;
    }
}


// Function to check all required match conditions
function checkAllMatchStatuses() {
    // 1. Name Match: studentName, eshikshaName, udiseName (3-way check)
    updateTripleMatchStatus(['studentName', 'eshikshaName', 'udiseName']);

    // 2. Class Match: class, eClass, uClass (3-way check)
    updateTripleMatchStatus(['class', 'eClass', 'uClass']);

    // 3. Block Match: eBlock, uSection (2-way check)
    updateTripleMatchStatus(['eBlock', 'uSection']);
}


function getStudentDataFromForm() {
    const form = document.getElementById('studentForm');
    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
        let finalValue = value.trim();

        // Format all alphabet fields to CAPITAL
        if (typeof finalValue === 'string' && finalValue.match(/[a-z]/i) && key !== 'dob') {
            finalValue = finalValue.toUpperCase();
        }

        data[key] = finalValue;
    }

    data.age = document.getElementById('agebox').value || null;

    // Convert empty strings to null for Firebase 
    for (const key in data) {
        if (data[key] === "") {
            data[key] = null;
        }
    }

    data.folio = data.folio ? data.folio.toUpperCase().replace(/\s/g, '') : null;
    data.dob = formatDateToDB(data.dob);
    data.aadhaar = formatAadhaar(data.aadhaar);
    data.fatherAadhaar = formatAadhaar(data.fatherAadhaar);
    data.motherAadhaar = formatAadhaar(data.motherAadhaar);

    return data;
}

// सर्च बॉक्स को क्लियर करने और फोकस को वहीं (सर्च बॉक्स पर) रखने के लिए
function resetSearchAndFocus() {
    const searchInput = document.getElementById('searchKey');
    if (searchInput) {
        searchInput.value = ''; // सर्च इनपुट को क्लियर करना
        searchInput.focus();    // सर्च इनपुट पर फोकस सेट करना
    }
}


// =========================================================
// 3. CRUD OPERATIONS (Realtime Database)
// =========================================================

async function saveOrUpdateStudent(studentData) {
    if (!database || !studentData.folio || !studentData.studentName) {
        displayMessage('❌ Folio No. and Student Name are required to save.', 'error');
        return;
    }

    checkAllMatchStatuses(); // Check status before saving

    const folioId = studentData.folio;

    // संशोधन: isExistingRecord variable का उपयोग करके मैसेज तय करना
    const successMessage = isExistingRecord ?
        `✅ Folio ${folioId} updated successfully!` :
        `✅ New Folio ${folioId} saved successfully!`;

    try {
        await database.ref(`${STUDENTS_NODE}/${folioId}`).set(studentData);
        displayMessage(successMessage, 'success');

        // फॉर्म क्लियर करें और isExistingRecord को फॉल्स पर रीसेट करें
        clearForm();

        // सफलतापूर्वक सेव/अपडेट के बाद सर्च बॉक्स क्लियर करें और फोकस करें
        resetSearchAndFocus();

    } catch (error) {
        console.error("Error saving document: ", error);
        displayMessage(`❌ Save failed for Folio ${folioId}: ${error.message}`, 'error');
    }
}


/**
 * Folio ID या Pen No. से छात्र डेटा खोजें।
 * @param {string} rawSearchKey - Folio ID या Pen No. हो सकता है।
 */
async function searchStudent(rawSearchKey) {
    const searchKey = rawSearchKey ? rawSearchKey.trim().toUpperCase().replace(/\s/g, '') : null;
    const searchInput = document.getElementById('searchKey');
    const folioInput = document.getElementById('folio');

    if (!database || !searchKey) {
        displayMessage("⚠️ Enter Folio Number or Pen Number to search.", 'warning');
        clearForm();
        resetSearchAndFocus();
        return;
    }

    // यह चेक करें कि searchStudent फ़ंक्शन को URL से कॉल किया जा रहा है या नहीं।
    // यदि URL से कॉल किया जा रहा है, तो searchInput का मान clear नहीं करेंगे, बल्कि इसे Folio ID मान लेंगे।
    const isCalledFromUrl = searchInput ? searchInput.value === searchKey : false;

    // अगर मैनुअल सर्च है, तो इनपुट फील्ड को तुरंत क्लियर करें
    if (searchInput && !isCalledFromUrl) searchInput.value = '';

    const searchButton = document.querySelector('.search-container .btn-primary');
    // सर्च बटन हो सकता है मौजूद न हो अगर URL से कॉल किया गया हो
    const originalButtonText = searchButton ? searchButton.innerHTML : 'Search';
    if (searchButton) {
        searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
        searchButton.disabled = true;
    }

    isExistingRecord = false;
    clearForm(); // फॉर्म को क्लियर करें

    try {
        let snapshot;
        let foundData = null;

        // 1. Folio ID से सीधा सर्च (सबसे तेज़ तरीका)
        snapshot = await database.ref(`${STUDENTS_NODE}/${searchKey}`).once('value');
        if (snapshot.exists()) {
            foundData = snapshot.val();
        }

        // 2. अगर Folio ID से नहीं मिला, तो Pen No. से खोजें
        if (!foundData) {
            const penQuery = database.ref(STUDENTS_NODE)
                .orderByChild('penNo') // Pen No. फ़ील्ड के आधार पर क्रमबद्ध करें
                .equalTo(searchKey)     // searchKey से मेल खाने वाला मान खोजें
                .limitToFirst(1);       // पहला मैच मिलने पर रुकें

            snapshot = await penQuery.once('value');
            if (snapshot.exists()) {
                // क्योंकि यह एक Query है, snapshot में 1 या अधिक child होंगे
                snapshot.forEach(childSnapshot => {
                    foundData = childSnapshot.val();
                    // एक बार मिलने पर break करें (limitToFirst(1) के बावजूद)
                    return true;
                });
            }
        }

        if (foundData) {
            fillFormWithData(foundData);
            isExistingRecord = true; // रिकॉर्ड मिल गया
            displayMessage(`✅ Folio ${foundData.folio} found. Ready to update.`, 'success');
        } else {
            // यदि Folio/Pen No. से नहीं मिला
            if (folioInput) folioInput.value = ''; // Folio फ़ील्ड को खाली रखें
            displayMessage(`⚠️ "${searchKey}" not found. Ready for new entry.`, 'warning');

            // अगर यूजर ने Folio No. सर्च किया था और नहीं मिला, तो उसे Folio फ़ील्ड में भरें
            // Note: Pen No. को Folio फ़ील्ड में नहीं भरना चाहिए
            // यह मानते हुए कि अगर searchKey 10-12 अंकों की संख्या नहीं है, तो यह Folio ID हो सकती है। 
            if (searchKey && searchKey.length < 13) {
                if (folioInput) folioInput.value = searchKey;
            }
        }
    } catch (error) {
        console.error("Error fetching data: ", error);
        displayMessage(`❌ Search error: ${error.message}`, 'error');
        clearForm();
    } finally {
        if (searchButton) {
            searchButton.innerHTML = originalButtonText;
            searchButton.disabled = false;
        }
        checkAllMatchStatuses();

        // अगर URL से कॉल नहीं किया गया है, तभी फोकस वापस लाएं
        if (searchInput && !isCalledFromUrl) searchInput.focus();

        // URL से कॉल होने पर, Folio ID इनपुट पर फोकस करें ताकि यूजर सीधे एडिट करना शुरू कर सके
        if (isCalledFromUrl && folioInput) folioInput.focus();

        // अगर URL से कॉल हुआ है और डेटा नहीं मिला है, तो Folio ID इनपुट पर फोकस करें
        if (isCalledFromUrl && !foundData && folioInput) folioInput.focus();
    }
}

async function deleteStudent(rawFolioId) {
    const folioId = rawFolioId ? rawFolioId.toUpperCase().replace(/\s/g, '') : null;

    if (!database || !folioId) {
        displayMessage('❌ Folio No. is missing for deletion.', 'error');
        const popup = document.getElementById('confirmationPopup');
        if (popup) popup.style.display = 'none';
        return;
    }

    const popup = document.getElementById('confirmationPopup');
    if (popup) popup.style.display = 'none';

    try {
        await database.ref(`${STUDENTS_NODE}/${folioId}`).remove();
        displayMessage(`🗑️ Folio ${folioId} deleted successfully.`, 'warning');

        // फॉर्म क्लियर करें और isExistingRecord को रीसेट करें
        clearForm();

        // सफलतापूर्वक डिलीट के बाद सर्च बॉक्स क्लियर करें और फोकस करें
        resetSearchAndFocus();

    } catch (error) {
        console.error("Error deleting document: ", error);
        displayMessage(`❌ Deletion failed for Folio ${folioId}: ${error.message}`, 'error');
    }
}


// =========================================================
// 4. UI INTERACTION FUNCTIONS
// =========================================================


function fillFormWithData(data) {
    for (const key in data) {
        const input = document.getElementById(key);
        if (input) {
            let value = data[key] === null ? '' : data[key];

            if (key === 'dob') {
                input.value = convertDBDateToForm(value);
            }
            else {
                input.value = value;
            }
        }
    }

    const dobInput = document.getElementById('dob');
    if (dobInput) dobInput.dispatchEvent(new Event('change'));
}

function clearForm() {
    const form = document.getElementById('studentForm');
    if (form) form.reset();

    const agebox = document.getElementById('agebox');
    if (agebox) agebox.value = '';

    // isExistingRecord को रीसेट करें
    isExistingRecord = false;

    // Reset all match/mismatch/empty labels
    checkAllMatchStatuses();
}

/**
 * Displays a short message in the fixed 'messageCard'.
 */
function displayMessage(msg, type) {
    const card = document.getElementById('messageCard');
    const text = document.getElementById('messageText');
    const icon = document.getElementById('messageIcon');

    if (!card || !text || !icon) return;

    card.className = '';
    card.classList.add(type, 'show');

    // मैसेज से emojis को हटाकर सिर्फ टेक्स्ट दिखाएं
    text.textContent = msg.replace(/^[✅❌⚠️🗑️]/, '').trim();

    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon.className = 'fas fa-times-circle';
    } else if (type === 'warning') {
        icon.className = 'fas fa-exclamation-triangle';
    } else {
        icon.className = 'fas fa-info-circle';
    }

    clearTimeout(window.messageTimeout);
    window.messageTimeout = setTimeout(() => {
        card.classList.remove('show');
    }, 5000);
}


// =========================================================
// 5. EVENT LISTENERS
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

    const uppercaseFields = [
        'folio', 'studentName', 'fatherName', 'motherName', 'address', 'remark',
        'eshikshaName', 'stateNo', 'udiseName', 'penNo', 'aapaarID',
        'accHolderName', 'bankAccNo', 'ifsc', 'eBlock', 'uSection', 'section'
    ];

    const matchCheckFields = [
        'studentName', 'eshikshaName', 'udiseName',
        'class', 'eClass', 'uClass',
        'eBlock', 'uSection'
    ];

    // 1. Capital Letter Formatting and Match Check on Input (Text/Select Inputs)
    uppercaseFields.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                e.target.value = e.target.value.toUpperCase();
                e.target.setSelectionRange(start, end);

                if (matchCheckFields.includes(id)) {
                    checkAllMatchStatuses();
                }
            });

            if (input.tagName === 'SELECT' && !matchCheckFields.includes(id)) {
                input.addEventListener('change', (e) => {
                    e.target.value = e.target.value.toUpperCase();
                });
            }
        }
    });


    // 2. Aadhaar Formatting Event Listeners 
    document.querySelectorAll('.aadhaar-input').forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = formatAadhaar(e.target.value);
        });
    });

    // 3. Match Status Check on Select/Dropdown Change for matching fields
    matchCheckFields.filter(id => {
        const element = document.getElementById(id);
        return element && element.tagName === 'SELECT';
    }).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', checkAllMatchStatuses);
        }
    });

    // 4. Search Functionality
    const searchButton = document.querySelector('.search-container .btn-primary');
    const searchInput = document.getElementById('searchKey');

    if (searchButton) {
        searchButton.addEventListener('click', () => {
            searchStudent(searchInput ? searchInput.value : '');
        });
    }

    // 5. Form Submission (Save/Update)
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const studentData = getStudentDataFromForm();
            if (studentData.folio && studentData.studentName) {
                saveOrUpdateStudent(studentData);
            }
        });
    }

    // 6. Reset/Clear Button
    document.querySelectorAll('button[type="reset"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            clearForm();
            displayMessage('⚠️ Form cleared. Ready for new action.', 'warning');
            // फॉर्म क्लियर होने पर सर्च बॉक्स क्लियर करें और फोकस करें
            resetSearchAndFocus();
        });
    });

    // 7. Delete Action
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const folioInput = document.getElementById('folio');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function () {
            const folioToDelete = folioInput ? folioInput.value : null;
            if (folioToDelete) {
                deleteStudent(folioToDelete);
            } else {
                displayMessage("❌ No Folio No. to delete.", 'error');
                const popup = document.getElementById('confirmationPopup');
                if (popup) popup.style.display = 'none';
            }
        });
    }

    // 8. DOB Change -> Age Calculation
    const dobInput = document.getElementById('dob');
    const ageBox = document.getElementById('agebox');
    if (dobInput && ageBox) {
        dobInput.addEventListener('change', function () {
            const dobValue = this.value;
            if (dobValue) {
                const birthDate = new Date(dobValue);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDifference = today.getMonth() - birthDate.getMonth();
                if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                ageBox.value = age >= 0 ? age : 'N/A';
            } else {
                ageBox.value = '';
            }
        });
    }

    // 9. Search input Enter key support
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchStudent(searchInput.value);
            }
        });
    }

    // Initial check on load
    checkAllMatchStatuses();

    // =========================================================
    // ✅ EDIT LOGIC FIX: URL से Folio ID को पढ़कर Search ट्रिगर करना
    // =========================================================

    const urlParams = new URLSearchParams(window.location.search);
    const searchKeyFromUrl = urlParams.get('searchKey'); // 'searchKey' पैरामीटर को पढ़ें

    if (searchKeyFromUrl) {
        // 1. searchInput में Folio ID भरें (ताकि searchStudent फ़ंक्शन उसे एक वैध इनपुट मान सके)
        if (searchInput) {
            searchInput.value = searchKeyFromUrl;
        }

        // 2. तुरंत searchStudent फ़ंक्शन को कॉल करके डेटा लोड करें
        searchStudent(searchKeyFromUrl);

        // 3. URL से searchKey पैरामीटर हटा दें (ताकि रिफ्रेश करने पर डुप्लीकेट सर्च न हो)
        // Note: यह केवल URL को साफ़ करता है, Folio ID इनपुट फ़ील्ड को नहीं।
        history.replaceState({}, document.title, window.location.pathname);
    } else {
        // अगर URL में searchKey नहीं है (यानी, यह एक नया एंट्री फॉर्म है), तो सामान्य फोकस सेट करें
        resetSearchAndFocus();
    }
    // =========================================================
});