// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// State management
let currentUser = null;
let currentMode = 'sell';

// SINGLE DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkUserLoginStatus();
    loadMarketData();
    setupRealTimeUpdates();
    
    // Sign out listener
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
    const submitButton = document.querySelector('.new-submit-btn');
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
                <div class="item-icon">🐾</div>
                <p>Selected pet: ${selectedItem}</p>
                <div class="pet-rarity">${getPetRarity(selectedItem)}</div>
            </div>
        `;
    } else {
        imageContainer.innerHTML = `
            <div class="new-placeholder-content">
                <div class="new-placeholder-icon">?</div>
                <p class="new-placeholder-text">Select a pet to view details</p>
            </div>
        `;
    }
}

function getPetRarity(petName) {
    const rarities = {
        'Hell Fox': 'Legendary',
        'Dominus Empyreus': 'Mythical',
        'Abating Link': 'Rare',
        'Abundant Mutation': 'Epic',
        'Abyssal Beacon': 'Legendary',
        'Accelerated Blast': 'Common'
    };
    return rarities[petName] || 'Unknown';
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
            showSuccessMessage('Pet order placed successfully!');
            closePlaceOrderModal();
            await loadMarketData(); // Refresh data immediately
        } else {
            showErrorMessage(result.message || 'Failed to place pet order');
        }
    } catch (error) {
        console.error('Error placing pet order:', error);
        showErrorMessage('An error occurred while placing the pet order');
    } finally {
        showLoadingState(false);
    }
}

function handleNewSubmit() {
    handlePlaceOrder();
}

function getFormData() {
    const itemSelect = document.getElementById('newItemSelect');
    const priceInput = document.getElementById('newPriceInput');
    const quantityInput = document.getElementById('newQuantityInput');
    
    return {
        type: currentMode,
        game: 'PetSimulator',
        item: itemSelect ? itemSelect.value : '',
        price: priceInput ? parseFloat(priceInput.value) : 0,
        quantity: quantityInput ? parseInt(quantityInput.value) : 0,
        imageUrl: getPetImageUrl(itemSelect ? itemSelect.value : ''),
        rarity: getPetRarity(itemSelect ? itemSelect.value : '')
    };
}

function getPetImageUrl(petName) {
    const petImages = {
        'Hell Fox': 'images/hell-fox.png',
        'Dominus Empyreus': 'images/dominus-empyreus.png',
        'Abating Link': 'images/abating-link.png',
        'Abundant Mutation': 'images/abundant-mutation.png',
        'Abyssal Beacon': 'images/abyssal-beacon.png',
        'Accelerated Blast': 'images/accelerated-blast.png'
    };
    
    return petImages[petName] || 'images/default-pet.png';
}

function validateFormData(formData) {
    const errors = [];
    
    if (!formData.item) errors.push('Please select a pet');
    if (!formData.price || formData.price <= 0) errors.push('Please enter a valid price');
    if (!formData.quantity || formData.quantity <= 0) errors.push('Please enter a valid quantity');
    if (formData.quantity > 100) errors.push('Maximum quantity for pets is 100');
    
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
        return { success: false, message: error.message || 'Failed to create pet trade' };
    }
}

async function fetchMarketData() {
    try {
        const response = await fetch(`${API_BASE_URL}/item/trades`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, message: error.message || 'Failed to fetch pet market data' };
    }
}

// Market functions
async function loadMarketData() {
    try {
        const result = await fetchMarketData();
        
        if (result.success && result.data) {
            displayMarketItems(result.data);
        } else {
            console.error('Failed to load pet market data:', result.message);
        }
    } catch (error) {
        console.error('Error loading pet market data:', error);
    }
}

function displayMarketItems(trades) {
    const buyItemsList = document.getElementById('buyItemsList');
    const sellItemsList = document.getElementById('sellItemsList');
    
    if (!buyItemsList || !sellItemsList) return;
    
    buyItemsList.innerHTML = '';
    sellItemsList.innerHTML = '';
    
    const petTrades = trades.filter(trade => trade.game === 'PetSimulator');
    const buyItems = petTrades.filter(trade => trade.type === 'buy');
    const sellItems = petTrades.filter(trade => trade.type === 'sell');
    
    if (buyItems.length > 0) {
        buyItems.forEach(item => {
            buyItemsList.appendChild(createPetItemElement(item, 'buy'));
        });
    } else {
        buyItemsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🐾</div>
                <div class="empty-text">No pet buy requests yet</div>
                <div class="empty-subtext">Be the first to post what pets you're looking for!</div>
            </div>
        `;
    }
    
    if (sellItems.length > 0) {
        sellItems.forEach(item => {
            sellItemsList.appendChild(createPetItemElement(item, 'sell'));
        });
    } else {
        sellItemsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🏪</div>
                <div class="empty-text">No pets for sale yet</div>
                <div class="empty-subtext">Be the first to list your pets!</div>
            </div>
        `;
    }
}

function createPetItemElement(item, type) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'market-item';
    
    const petEmojis = {
        'Hell Fox': '🦊',
        'Dominus Empyreus': '👑',
        'Abating Link': '🔗',
        'Abundant Mutation': '🧬',
        'Abyssal Beacon': '🔮',
        'Accelerated Blast': '💥'
    };
    
    const emoji = petEmojis[item.item] || '🐾';
    const timeAgo = getTimeAgo(item.createdAt);
    const quantityText = type === 'buy' ? `Looking for: ${item.quantity} pets` : `Available: ${item.quantity} pets`;
    const rarity = item.rarity || getPetRarity(item.item);
    
    itemDiv.innerHTML = `
        <div class="item-image">${emoji}</div>
        <div class="item-info">
            <div class="item-name">${item.item}</div>
            <div class="item-price">$${item.price.toFixed(2)}</div>
            <div class="item-quantity">${quantityText}</div>
            <div class="pet-rarity" style="color: ${getRarityColor(rarity)}; font-size: 12px; font-weight: bold;">${rarity}</div>
            <div class="item-time">${timeAgo}</div>
            <div class="seller-info">
                <div class="seller-avatar"></div>
                <span>Trader_${Math.random().toString(36).substr(2, 8)}</span>
            </div>
        </div>
        <button class="chat-btn" onclick="openPetChat('${type}', '${item.item}')">Chat</button>
    `;
    
    return itemDiv;
}

function getRarityColor(rarity) {
    const colors = {
        'Common': '#808080',
        'Rare': '#0080ff',
        'Epic': '#8000ff',
        'Legendary': '#ff8000',
        'Mythical': '#ff0080'
    };
    return colors[rarity] || '#ffffff';
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

function openPetChat(type, petName) {
    alert(`Opening chat for ${type} request: ${petName}\n\nPet trading chat will be implemented soon!`);
}

// UI Helper functions
function showLoadingState(isLoading) {
    const submitButton = document.querySelector('.new-submit-btn');
    if (submitButton) {
        if (isLoading) {
            submitButton.disabled = true;
            submitButton.textContent = 'Placing Pet Order...';
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
            <span class="popup-message">🐾 ${message}</span>
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

// Event listeners
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

// Global functions
window.openPlaceOrderModal = openPlaceOrderModal;
window.closePlaceOrderModal = closePlaceOrderModal;
window.handleNewItemSelection = handleNewItemSelection;
window.handleNewSubmit = handleNewSubmit;
window.openPetChat = openPetChat;