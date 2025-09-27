        // Items Database for new modal
/*        let newItemsData = {
    "Red Dragon": {
        image: "images/RedDragon.webp",
        description: "Powerful fire breathing dragon"
    },
    "Golden Bee": {
        image: "images/GoldenBee.webp",
        description: "Rare golden bee specimen"
    }
};*/

        // New modal state
        let newModalState = {
            orderType: 'buy',
            selectedItem: '',
            price: '',
            quantity: ''
        };

        /*
        let newItemsData = {};  // เก็บข้อมูล item จาก backend
*/
        async function fetchItemsFromDB() {
    try {
        const res = await fetch('/api/items');  // ✅ backend จะต้องมี route /api/items
        const data = await res.json();
        newItemsData = data; // เก็บ item list ที่ backend ส่งมา

        // อัปเดต dropdown ให้มี option ตาม DB
        const select = document.getElementById('newItemSelect');
        select.innerHTML = '<option value="">-- Select Item --</option>'; // reset

        Object.keys(newItemsData).forEach(itemName => {
            const option = document.createElement('option');
            option.value = itemName;
            option.textContent = itemName;
            select.appendChild(option);
        });
    } catch (err) {
        console.error("โหลด item list ไม่ได้:", err);
    }
}

// ✅ เรียกตอนโหลดหน้าเว็บ
document.addEventListener("DOMContentLoaded", fetchItemsFromDB);



        // Original JavaScript functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Buy button functionality
            const buyButtons = document.querySelectorAll('.buy-btn');
            buyButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const itemName = this.closest('.market-item').querySelector('.item-name').textContent;
                    alert('ซื้อ ' + itemName + ' สำเร็จ!');
                });
            });

            // Search functionality
            const searchBtn = document.querySelector('.search-btn');
            const searchInput = document.querySelector('.search-input');

            searchBtn.addEventListener('click', function() {
                const searchTerm = searchInput.value.trim();
                if (searchTerm) {
                    alert('ค้นหา: ' + searchTerm);
                } else {
                    alert('กรุณาใส่คำค้นหา');
                }
            });

            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    const searchTerm = this.value.trim();
                    if (searchTerm) {
                        alert('ค้นหา: ' + searchTerm);
                    } else {
                        alert('กรุณาใส่คำค้นหา');
                    }
                }
            });

            // Smooth hover effects
            const marketItems = document.querySelectorAll('.market-item');
            marketItems.forEach(item => {
                item.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                });
                
                item.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = 'none';
                });
            });
        });

        // New Modal Functions
        function openPlaceOrderModal() {
            document.getElementById('placeOrderModal').style.display = 'flex';
            resetNewModalForm();
        }

        function closePlaceOrderModal() {
            document.getElementById('placeOrderModal').style.display = 'none';
            resetNewModalForm();
        }

function resetNewModalForm() {
    newModalState = {
        orderType: 'sell', // ใช้เฉพาะขาย
        selectedItem: '',
        price: '',
        quantity: ''
    };

    document.getElementById('newItemSelect').value = '';
    document.getElementById('newPriceInput').value = '';
    document.getElementById('newQuantityInput').value = '';
    updateNewItemDisplay('');
}



        function setNewOrderType(type) {
            newModalState.orderType = type;
            
            const sellBtn = document.getElementById('newSellButton');
            const buyBtn = document.getElementById('newBuyButton');
            
            if (type === 'sell') {
                sellBtn.classList.add('active');
                buyBtn.classList.remove('active');
            } else {
                buyBtn.classList.add('active');
                sellBtn.classList.remove('active');
            }
        }

        function handleNewItemSelection() {
            const selectedItem = document.getElementById('newItemSelect').value;
            newModalState.selectedItem = selectedItem;
            updateNewItemDisplay(selectedItem);
        }

        function updateNewItemDisplay(itemName) {
            const container = document.getElementById('newItemImageContainer');
            
            if (itemName && newItemsData[itemName]) {
                const item = newItemsData[itemName];
                container.innerHTML = `
                    <div class="new-item-content">
                        <img src="${item.image}" alt="${itemName}" class="new-item-image" />
                        <h3 class="new-item-name">${itemName}</h3>
                        <p class="new-item-description">${item.description}</p>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="new-placeholder-content">
                        <div class="new-placeholder-icon">?</div>
                        <p class="new-placeholder-text">Select an item to view details</p>
                    </div>
                `;
            }
        }

// สมมติว่ามี username จากระบบ login
// const currentUser = "Jeffy";

let currentUser = "Guest"; // ค่า default ถ้าไม่ได้ login

async function fetchCurrentUser() {
    try {
        const res = await fetch('/api/current-user'); // backend จะส่ง JSON
        const data = await res.json();
        currentUser = data.username; // เก็บ username ที่ได้
    } catch (err) {
        console.error("ดึงข้อมูล user ไม่ได้:", err);
    }
}

// ดึง user ตอนเปิดหน้าเว็บ
document.addEventListener("DOMContentLoaded", fetchCurrentUser);


// A. ฟังก์ชันเดิมถูกแยกออกมาเพื่อใช้สร้าง Market Item
function createMarketItem(itemData, price, quantity, totalPrice, orderType) {
    const container = document.querySelector('.market-container');
    const typeClass = (orderType === 'sell') ? 'wantsell' : 'wantbuy';
    const buttonText = (orderType === 'sell') ? 'Buy' : 'Sell'; // ผู้ใช้จะเห็นปุ่มตรงข้ามกับ OrderType

    const newItem = document.createElement('div');
    newItem.classList.add('market-item');
    newItem.innerHTML = `
        <div class="${typeClass}">
            <div class="item-image">
                <img src="${itemData.image}" />
            </div>
            <div class="item-info">
                <div class="item-name">${newModalState.selectedItem}</div>
                <div class="item-price">${price} ฿ x ${quantity}</div>
                <div class="item-time">Total: ${totalPrice} ฿</div>
                <div class="seller-info">
                    <div class="seller-avatar"></div>
                    <span>${currentUser}</span>
                </div>
            </div>
            <button class="action-btn ${buttonText.toLowerCase()}-btn">${buttonText}</button>
        </div>
    `;
    
    // ใส่ popup ตอนกด Buy/Sell
    newItem.querySelector('.action-btn').addEventListener('click', function() {
        const actionMessage = (orderType === 'sell') ? 
            'Buy ' + newModalState.selectedItem + ' success!' :
            'Sell ' + newModalState.selectedItem + ' success!';
        showPopup(actionMessage, 'success');
    });

    // แทรกไว้บนสุด
    container.prepend(newItem);
}

// B. ฟังก์ชันใหม่สำหรับตรวจสอบโหมดและส่งคำสั่ง
function handleOrderSubmit() {
    const toggleInput = document.getElementById('mode-toggle');
    const orderType = toggleInput.checked ? 'buy' : 'sell'; // checked=Want Buy, unchecked=Want Sell

    const price = parseFloat(document.getElementById('newPriceInput').value);
    const quantity = parseInt(document.getElementById('newQuantityInput').value);

    // ตรวจสอบ input (เหมือนเดิม)
    if (!newModalState.selectedItem) {
        showPopup('Please select item!', 'warning');
        return;
    }
    if (!price || !quantity || price <= 0 || quantity <= 0) {
        showPopup('Please fill out all the information correctly!', 'warning');
        return;
    }

    const totalPrice = price * quantity;
    const itemData = newItemsData[newModalState.selectedItem];
    
    // ✅ เรียกใช้ฟังก์ชันสร้าง Market Item ตาม Order Type
    createMarketItem(itemData, price, quantity, totalPrice, orderType);

    // ปิด Modal และแจ้งเตือน
    closePlaceOrderModal();
    const successMessage = (orderType === 'sell') ? 
        'Sell order added successfully!' : 
        'Buy request added successfully!';
    showPopup(successMessage, 'success');
}


// C. แทนที่ Event Listener เดิมด้วย Logic ใหม่
document.addEventListener('DOMContentLoaded', () => {
    // ... (โค้ดเดิมทั้งหมดใน DOMContentLoaded) ...

    // หาปุ่ม Submit ใหม่
    const submitButton = document.getElementById('newSubmitButton');
    if (submitButton) {
        // เปลี่ยนมาใช้ handleOrderSubmit ที่ถูกปรับปรุง
        submitButton.addEventListener('click', handleOrderSubmit);
    }
    
    // ... (โค้ดเดิมทั้งหมดใน DOMContentLoaded) ...
    
    const toggleInput = document.getElementById('mode-toggle');
    const currentStateText = document.getElementById('current-state');

    // ฟังก์ชันสำหรับอัปเดตข้อความสถานะ
    function updateState() {
        if (toggleInput.checked) {
            // เมื่อ checked (เลื่อนไปทางขวา) คือ "want buy"
            currentStateText.textContent = "Current Mode: Want Buy";
        } else {
            // เมื่อ unchecked (เลื่อนไปทางซ้าย) คือ "want sell"
            currentStateText.textContent = "Current Mode: Want Sell";
        }
    }

    // กำหนดสถานะเริ่มต้นเมื่อโหลดหน้า
    updateState();

    // เพิ่ม event listener เมื่อมีการเปลี่ยนแปลงสถานะ
    toggleInput.addEventListener('change', updateState);
});
        let newItemsData = {
            "Red Dragon": {
                image: "images/RedDragon.webp",
                description: "Powerful fire breathing dragon"
            },
            "Golden Bee": {
                image: "images/GoldenBee.webp",
                description: "Rare golden bee specimen"
            }
        };




        // Close modal when clicking outside
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-overlay')) {
                closePlaceOrderModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closePlaceOrderModal();
            }
        });

        // Legacy modal functions (for compatibility)
        function setOrderType(type) {
            setNewOrderType(type);
        }



        function showPopup(message, type = 'success') {
    const container = document.getElementById('popup-container');
    const popup = document.createElement('div');
    popup.classList.add('popup', type);
    popup.textContent = message;

    container.appendChild(popup);

    // trigger animation
    setTimeout(() => popup.classList.add('show'), 50);

    // auto remove
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    }, 3000);
}
//สมมติ การล็อคอิน
// let isLoggedIn = true; // เปลี่ยนเป็น false ถ้า logout

async function updateUserMenu() {
    try {
        const res = await fetch('/api/current-user'); // ✅ backend ต้องเขียน endpoint นี้
        const data = await res.json();

        const signInLink = document.getElementById("signInLink");
        const userDropdown = document.getElementById("userDropdown");

        if (data.loggedIn) {
            signInLink.style.display = "none";
            userDropdown.style.display = "inline-block";
            document.getElementById("usernameDisplay").textContent = data.username;
        } else {
            signInLink.style.display = "inline-block";
            userDropdown.style.display = "none";
        }
    } catch (err) {
        console.error("เชื่อมต่อ backend ไม่ได้:", err);
    }
}

// กดปุ่ม Sign out → ส่งไปที่ backend
document.getElementById("signOutBtn").addEventListener("click", async function(e) {
    e.preventDefault();
    await fetch('/api/logout', { method: 'POST' });
    updateUserMenu();
});

// โหลดหน้ามา → อัปเดตเมนู
document.addEventListener("DOMContentLoaded", updateUserMenu);

document.addEventListener('DOMContentLoaded', () => {
    const toggleInput = document.getElementById('mode-toggle');
    const currentStateText = document.getElementById('current-state');

    // ฟังก์ชันสำหรับอัปเดตข้อความสถานะ
    function updateState() {
        if (toggleInput.checked) {
            // เมื่อ checked (เลื่อนไปทางขวา) คือ "want buy"
            currentStateText.textContent = "Current Mode: Want Buy";
        } else {
            // เมื่อ unchecked (เลื่อนไปทางซ้าย) คือ "want sell"
            currentStateText.textContent = "Current Mode: Want Sell";
        }
    }

    // กำหนดสถานะเริ่มต้นเมื่อโหลดหน้า
    updateState();

    // เพิ่ม event listener เมื่อมีการเปลี่ยนแปลงสถานะ
    toggleInput.addEventListener('change', updateState);
});