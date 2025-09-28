// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// State management
let currentUser = null;
let currentMode = 'sell';

// Initialize the application - SINGLE DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkUserLoginStatus();
    loadMarketData();
    setupRealTimeUpdates();
    
    // Sign out button listener
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleSignOut();
        });
    }
});

function initializeApp() {
    const toggle = document.getElementById('mode-toggle');
    const currentState = document.getElementById('current-state');
    
    if (toggle && currentState) {
        toggle.addEventListener('change', function() {
            currentMode = this.checked ? 'buy' : 'sell';
            currentState.textContent = `Current Mode: Want ${currentMode === 'sell' ? 'Sell' : 'Buy'}`;
        });
    }
}

function setupEventListeners() {
    const submitButton = document.getElementById('newSubmitButton');
    if (submitButton) {
        submitButton.addEventListener('click', handlePlaceOrder);
    }

    const itemSelect = document.getElementById('newItemSelect');
    if (itemSelect) {
        itemSelect.addEventListener('change', handleNewItemSelection);
    }
}

function checkUserLoginStatus() {
    const userToken = localStorage.getItem('userToken');
    const username = localStorage.getItem('username');
    
    if (userToken && username) {
        showUserLoggedIn(username);
    } else {
        showSignInOption();
    }
}

function showUserLoggedIn(username) {
    const signInLink = document.getElementById('signInLink');
    const userDropdown = document.getElementById('userDropdown');
    const usernameDisplay = document.getElementById('usernameDisplay');
    
    if (signInLink) signInLink.style.display = 'none';
    if (userDropdown) userDropdown.style.display = 'block';
    if (usernameDisplay) usernameDisplay.textContent = username;
}

function showSignInOption() {
    const signInLink = document.getElementById('signInLink');
    const userDropdown = document.getElementById('userDropdown');
    
    if (signInLink) signInLink.style.display = 'block';
    if (userDropdown) userDropdown.style.display = 'none';
}

// Modal functions
function openPlaceOrderModal() {
    const modal = document.getElementById('placeOrderModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closePlaceOrderModal() {
    const modal = document.getElementById('placeOrderModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        clearForm();
    }
}

function clearForm() {
    const itemSelect = document.getElementById('newItemSelect');
    const priceInput = document.getElementById('newPriceInput');
    const quantityInput = document.getElementById('newQuantityInput');
    
    if (itemSelect) itemSelect.value = '';
    if (priceInput) priceInput.value = '';
    if (quantityInput) quantityInput.value = '';
    
    const imageContainer = document.getElementById('newItemImageContainer');
    if (imageContainer) {
        imageContainer.innerHTML = `
            <div class="new-placeholder-content">
                <div class="new-placeholder-icon">?</div>
                <p class="new-placeholder-text">Select an item to view details</p>
            </div>
        `;
    }
}

function handleNewItemSelection() {
    const itemSelect = document.getElementById('newItemSelect');
    const imageContainer = document.getElementById('newItemImageContainer');
    
    if (!itemSelect || !imageContainer) return;
    
    const selectedItem = itemSelect.value;
    
    if (selectedItem) {
        imageContainer.innerHTML = `
            <div class="new-item-preview">
                <h3>${selectedItem}</h3>
                <div class="item-icon">📦</div>
                <p>Selected item: ${selectedItem}</p>
            </div>
        `;
    } else {
        imageContainer.innerHTML = `
            <div class="new-placeholder-content">
                <div class="new-placeholder-icon">?</div>
                <p class="new-placeholder-text">Select an item to view details</p>
            </div>
        `;
    }
}

// SINGLE handlePlaceOrder function
async function handlePlaceOrder() {
    try {
        const formData = getFormData();
        
        if (!validateFormData(formData)) {
            return;
        }

        showLoadingState(true);
        const result = await createTradeItem(formData);
        
        if (result.success) {
            showSuccessMessage('Order placed successfully!');
            closePlaceOrderModal();
            await loadMarketData(); // Refresh data
        } else {
            showErrorMessage(result.message || 'Failed to place order');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        showErrorMessage('An error occurred while placing the order');
    } finally {
        showLoadingState(false);
    }
}

function getFormData() {
    const itemSelect = document.getElementById('newItemSelect');
    const priceInput = document.getElementById('newPriceInput');
    const quantityInput = document.getElementById('newQuantityInput');
    
    return {
        type: currentMode,
        game: 'GrowAGarden',
        item: itemSelect ? itemSelect.value : '',
        price: priceInput ? parseFloat(priceInput.value) : 0,
        quantity: quantityInput ? parseInt(quantityInput.value) : 0,
        imageUrl: getItemImageUrl(itemSelect ? itemSelect.value : '')
    };
}

function getItemImageUrl(itemName) {
    const itemImages = {
        'Red Dragon': 'images/red-dragon.png',
        'Golden Bee': 'images/golden-bee.png',
        'Abating Link': 'images/abating-link.png',
        'Abundant Mutation': 'images/abundant-mutation.png',
        'Abyssal Beacon': 'images/abyssal-beacon.png',
        'Accelerated Blast': 'images/accelerated-blast.png'
    };
    
    return itemImages[itemName] || 'images/default-item.png';
}

function validateFormData(formData) {
    const errors = [];
    
    if (!formData.item) errors.push('Please select an item');
    if (!formData.price || formData.price <= 0) errors.push('Please enter a valid price');
    if (!formData.quantity || formData.quantity <= 0) errors.push('Please enter a valid quantity');
    
    if (errors.length > 0) {
        showErrorMessage(errors.join(', '));
        return false;
    }
    
    return true;
}

// API functions
async function createTradeItem(tradeData) {
    try {
        const response = await fetch(`${API_BASE_URL}/item/trades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tradeData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: error.message || 'Failed to create trade item' };
    }
}

// SINGLE fetchMarketData function
async function fetchMarketData() {
    try {
        const response = await fetch(`${API_BASE_URL}/item/trades`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: error.message || 'Failed to fetch market data' };
    }
}

// Market data functions
async function loadMarketData() {
    try {
        const result = await fetchMarketData();
        
        if (result.success && result.data) {
            displayMarketItems(result.data);
        } else {
            console.error('Failed to load market data:', result.message);
        }
    } catch (error) {
        console.error('Error loading market data:', error);
    }
}

function displayMarketItems(trades) {
    const buyItemsList = document.getElementById('buyItemsList');
    const sellItemsList = document.getElementById('sellItemsList');
    
    if (!buyItemsList || !sellItemsList) return;
    
    buyItemsList.innerHTML = '';
    sellItemsList.innerHTML = '';
    
    const buyItems = trades.filter(trade => trade.type === 'buy');
    const sellItems = trades.filter(trade => trade.type === 'sell');
    
    if (buyItems.length > 0) {
        buyItems.forEach(item => {
            buyItemsList.appendChild(createItemElement(item, 'buy'));
        });
    } else {
        buyItemsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🛒</div>
                <div class="empty-text">No buy requests yet</div>
                <div class="empty-subtext">Be the first to post what you're looking for!</div>
            </div>
        `;
    }
    
    if (sellItems.length > 0) {
        sellItems.forEach(item => {
            sellItemsList.appendChild(createItemElement(item, 'sell'));
        });
    } else {
        sellItemsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💰</div>
                <div class="empty-text">No items for sale yet</div>
                <div class="empty-subtext">Be the first to list your items!</div>
            </div>
        `;
    }
}

function createItemElement(item, type) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'market-item';
    
    const itemEmojis = {
        'Red Dragon': '🐲',
        'Golden Bee': '🐝',
        'Mythic Sword': '⚔️',
        'Rare Crystal': '💎',
        'Elven Bow': '🏹'
    };
    
    const emoji = itemEmojis[item.item] || '📦';
    const timeAgo = getTimeAgo(item.createdAt);
    const quantityText = type === 'buy' ? `Looking for: ${item.quantity} units` : `Available: ${item.quantity} units`;
    
    itemDiv.innerHTML = `
        <div class="item-image">${emoji}</div>
        <div class="item-info">
            <div class="item-name">${item.item}</div>
            <div class="item-price">$${item.price.toFixed(2)}</div>
            <div class="item-quantity">${quantityText}</div>
            <div class="item-time">${timeAgo}</div>
            <div class="seller-info">
                <div class="seller-avatar"></div>
                <span>User_${Math.random().toString(36).substr(2, 8)}</span>
            </div>
        </div>
        <button class="chat-btn" onclick="openChat('${type}', '${item.item}')">Chat</button>
    `;
    
    return itemDiv;
}

function getTimeAgo(dateString) {
    const now = new Date();
    const itemDate = new Date(dateString);
    const diffInMinutes = Math.floor((now - itemDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
}

function setupRealTimeUpdates() {
    setInterval(async () => {
        await loadMarketData();
    }, 30000);
}

function openChat(type, itemName) {
    alert(`Opening chat for ${type} request: ${itemName}\n\nThis will be implemented with your chat system later.`);
}

// UI Helper functions
function showLoadingState(isLoading) {
    const submitButton = document.getElementById('newSubmitButton');
    if (submitButton) {
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.textContent = 'Placing Order...';
        } else {
            submitButton.disabled = false;
            submitButton.textContent = 'Place Order';
        }
    }
}

function showSuccessMessage(message) {
    showPopup(message, 'success');
}

function showErrorMessage(message) {
    showPopup(message, 'error');
}

function showPopup(message, type = 'info') {
    let popupContainer = document.getElementById('popup-container');
    if (!popupContainer) {
        popupContainer = document.createElement('div');
        popupContainer.id = 'popup-container';
        popupContainer.className = 'popup-container';
        popupContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            pointer-events: none;
        `;
        document.body.appendChild(popupContainer);
    }

    const popup = document.createElement('div');
    popup.className = `popup popup-${type}`;
    popup.style.cssText = `
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        pointer-events: auto;
        opacity: 0;
        transform: translateX(300px);
        transition: all 0.3s ease;
    `;
    
    popup.innerHTML = `
        <div class="popup-content" style="display: flex; align-items: center; justify-content: space-between;">
            <span class="popup-message">${message}</span>
            <button class="popup-close" onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: 10px;">×</button>
        </div>
    `;

    popupContainer.appendChild(popup);

    setTimeout(() => {
        popup.style.opacity = '1';
        popup.style.transform = 'translateX(0)';
    }, 10);

    setTimeout(() => {
        if (popup.parentNode) {
            popup.style.opacity = '0';
            popup.style.transform = 'translateX(300px)';
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.remove();
                }
            }, 300);
        }
    }, 5000);
}

function handleSignOut() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    showSignInOption();
    window.location.href = 'index.html';
}

// Event listeners for modal
document.addEventListener('click', function(e) {
    const modal = document.getElementById('placeOrderModal');
    if (modal && e.target === modal) {
        closePlaceOrderModal();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePlaceOrderModal();
    }
});

// Make functions globally available
window.openPlaceOrderModal = openPlaceOrderModal;
window.closePlaceOrderModal = closePlaceOrderModal;
window.handleNewItemSelection = handleNewItemSelection;
window.openChat = openChat;