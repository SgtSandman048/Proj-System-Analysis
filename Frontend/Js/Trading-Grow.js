// Configuration
const API_BASE_URL = 'http://localhost:3000/api'; // Adjust this to match your backend URL

// State management
let currentUser = null;
let currentMode = 'sell'; // 'sell' or 'buy'

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkUserLoginStatus();
});

function initializeApp() {
    // Initialize toggle switch
    const toggle = document.getElementById('mode-toggle');
    const currentState = document.getElementById('current-state');
    
    if (toggle && currentState) {
        toggle.addEventListener('change', function() {
            currentMode = this.checked ? 'buy' : 'sell'; // Fixed: switched logic
            currentState.textContent = `Current Mode: Want ${currentMode === 'sell' ? 'Sell' : 'Buy'}`;
        });
    }
}

function setupEventListeners() {
    // Submit button event listener
    const submitButton = document.getElementById('newSubmitButton');
    if (submitButton) {
        submitButton.addEventListener('click', handlePlaceOrder);
    }

    // Item selection change listener
    const itemSelect = document.getElementById('newItemSelect');
    if (itemSelect) {
        itemSelect.addEventListener('change', handleNewItemSelection);
    }
}

function checkUserLoginStatus() {
    // Check if user is logged in (you can implement this based on your authentication system)
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
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

function closePlaceOrderModal() {
    const modal = document.getElementById('placeOrderModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
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
    
    // Clear item preview
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
        // Update the item preview
        imageContainer.innerHTML = `
            <div class="new-item-preview">
                <h3>${selectedItem}</h3>
                <div class="item-icon">📦</div>
                <p>Selected item: ${selectedItem}</p>
            </div>
        `;
    } else {
        // Show placeholder
        imageContainer.innerHTML = `
            <div class="new-placeholder-content">
                <div class="new-placeholder-icon">?</div>
                <p class="new-placeholder-text">Select an item to view details</p>
            </div>
        `;
    }
}

// Main function to handle placing an order
async function handlePlaceOrder() {
    try {
        // Get form data
        const formData = getFormData();
        
        // Validate form data
        if (!validateFormData(formData)) {
            return;
        }

        // Show loading state
        showLoadingState(true);

        // Create trade item via API
        const result = await createTradeItem(formData);
        
        if (result.success) {
            showSuccessMessage('Order placed successfully!');
            closePlaceOrderModal();
            // Optionally refresh the market data
            // await loadMarketData();
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
        type: currentMode, // 'buy' or 'sell'
        game: 'GrowAGarden', // You can make this dynamic if needed
        item: itemSelect ? itemSelect.value : '',
        price: priceInput ? parseFloat(priceInput.value) : 0,
        quantity: quantityInput ? parseInt(quantityInput.value) : 0,
        imageUrl: getItemImageUrl(itemSelect ? itemSelect.value : '')
    };
}

function getItemImageUrl(itemName) {
    // Map item names to image URLs
    const itemImages = {
        'Red Dragon': 'images/red-dragon.png',
        'Golden Bee': 'images/golden-bee.png',
        'Abating Link': 'images/abating-link.png',
        'Abundant Mutation': 'images/abundant-mutation.png',
        'Abyssal Beacon': 'images/abyssal-beacon.png',
        'Accelerated Blast': 'images/accelerated-blast.png',
        // Add more mappings as needed
    };
    
    return itemImages[itemName] || 'images/default-item.png';
}

function validateFormData(formData) {
    const errors = [];
    
    if (!formData.item) {
        errors.push('Please select an item');
    }
    
    if (!formData.price || formData.price <= 0) {
        errors.push('Please enter a valid price');
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
        errors.push('Please enter a valid quantity');
    }
    
    if (errors.length > 0) {
        showErrorMessage(errors.join(', '));
        return false;
    }
    
    return true;
}

// API function to create a trade item
async function createTradeItem(tradeData) {
    try {
        // Fixed: Use correct endpoint that matches your route
        const response = await fetch(`${API_BASE_URL}/item/trades`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add authorization header if needed
                // 'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            },
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
        return { 
            success: false, 
            message: error.message || 'Failed to create trade item'
        };
    }
}

// API function to fetch market data (for future use)
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
        return { 
            success: false, 
            message: error.message || 'Failed to fetch market data'
        };
    }
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
    // Create popup container if it doesn't exist
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

    // Trigger animation
    setTimeout(() => {
        popup.style.opacity = '1';
        popup.style.transform = 'translateX(0)';
    }, 10);

    // Auto remove after 5 seconds
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

// Event listeners for sign in/out (you can integrate with your authentication system)
document.addEventListener('DOMContentLoaded', function() {
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleSignOut();
        });
    }
});

function handleSignOut() {
    // Clear user data
    localStorage.removeItem('userToken');
    localStorage.removeItem('username');
    
    // Update UI
    showSignInOption();
    
    // Redirect to home or login page
    window.location.href = 'index.html';
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('placeOrderModal');
    if (modal && e.target === modal) {
        closePlaceOrderModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closePlaceOrderModal();
    }
});

// Make functions globally available for HTML onclick handlers
window.openPlaceOrderModal = openPlaceOrderModal;
window.closePlaceOrderModal = closePlaceOrderModal;
window.handleNewItemSelection = handleNewItemSelection;