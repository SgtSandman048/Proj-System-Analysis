// Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// State management
let currentUser = null;
let currentMode = 'sell';
let uploadedImages = [];

// Initialize the application - SINGLE DOMContentLoaded listener
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    checkUserLoginStatus();
    loadMarketData();
    setupRealTimeUpdates();
    
    // Image upload listener
    const imageUploadInput = document.getElementById('imageUploadInput');
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', handleImageUpload);
    }
    
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

    // Setup item input listener instead of select
    const itemInput = document.getElementById('newItemInput');
    if (itemInput) {
        itemInput.addEventListener('input', handleNewItemInput);
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
        
        // Focus on item input when modal opens
        setTimeout(() => {
            const itemInput = document.getElementById('newItemInput');
            if (itemInput) itemInput.focus();
        }, 300);
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
    const itemInput = document.getElementById('newItemInput');
    const priceInput = document.getElementById('newPriceInput');
    const quantityInput = document.getElementById('newQuantityInput');
    
    if (itemInput) {
        itemInput.value = '';
        itemInput.classList.remove('form-error', 'form-success');
    }
    if (priceInput) priceInput.value = '';
    if (quantityInput) quantityInput.value = '';
    
    clearInputError();
    
    // Reset uploaded images
    uploadedImages = [];
    updateImagesDisplay();
    updateLeftPanelDisplay();
}

// Image compression function
function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            // Calculate new dimensions
            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            // Draw and compress
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Convert to blob with compression
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    // Fallback to original if compression fails
                    resolve(file);
                }
            }, 'image/jpeg', quality);
        };
        
        img.onerror = function() {
            // Fallback to original file if image loading fails
            resolve(file);
        };
        
        img.src = URL.createObjectURL(file);
    });
}

// Handle image upload with compression
function handleImageUpload(event) {
    const files = Array.from(event.target.files);
    const uploadStatus = document.getElementById('uploadStatus');
    const uploadBtn = document.querySelector('.upload-btn');
    
    if (files.length === 0) return;
    
    // Show upload status
    if (uploadStatus) uploadStatus.style.display = 'flex';
    if (uploadBtn) uploadBtn.disabled = true;
    
    let processedCount = 0;
    let successCount = 0;
    
    // Process each file
    files.forEach(async (file, index) => {
        try {
            if (!file.type.startsWith('image/')) {
                processedCount++;
                showErrorMessage(`${file.name} is not a valid image file`);
                checkIfDone();
                return;
            }
            
            // Check file size (limit to 10MB for original file)
            if (file.size > 10 * 1024 * 1024) {
                processedCount++;
                showErrorMessage(`File ${file.name} is too large (max 10MB)`);
                checkIfDone();
                return;
            }
            
            // Compress the image
            console.log(`Compressing ${file.name}...`);
            const compressedBlob = await compressImage(file);
            
            // Create FileReader for compressed image
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const imageData = {
                        id: Date.now() + index,
                        name: file.name,
                        url: e.target.result,
                        size: compressedBlob.size,
                        originalSize: file.size,
                        uploadedAt: new Date().toLocaleTimeString('th-TH')
                    };
                    
                    uploadedImages.push(imageData);
                    successCount++;
                    processedCount++;
                    
                    console.log(`Compressed ${file.name}: ${file.size} -> ${compressedBlob.size} bytes`);
                    
                    updateImagesDisplay();
                    updateLeftPanelDisplay();
                    
                    checkIfDone();
                } catch (error) {
                    console.error('Error processing image:', error);
                    processedCount++;
                    showErrorMessage(`Failed to process image: ${file.name}`);
                    checkIfDone();
                }
            };
            
            reader.onerror = function() {
                processedCount++;
                showErrorMessage(`Failed to read image: ${file.name}`);
                checkIfDone();
            };
            
            // Add a small delay to prevent overwhelming the browser
            setTimeout(() => {
                reader.readAsDataURL(compressedBlob);
            }, index * 100);
            
        } catch (error) {
            console.error('Error compressing image:', error);
            processedCount++;
            showErrorMessage(`Failed to compress image: ${file.name}`);
            checkIfDone();
        }
    });
    
    function checkIfDone() {
        if (processedCount === files.length) {
            if (uploadStatus) uploadStatus.style.display = 'none';
            if (uploadBtn) uploadBtn.disabled = false;
            
            if (successCount > 0) {
                showSuccessMessage(`${successCount} image(s) uploaded and compressed successfully!`);
            }
        }
    }
    
    // Reset input value
    event.target.value = '';
}

// Update images display in right panel
function updateImagesDisplay() {
    const container = document.getElementById('uploadedImagesContainer');
    const grid = document.getElementById('imagesGrid');
    const countSpan = document.getElementById('imageCount');
    
    if (!container || !grid || !countSpan) return;
    
    if (uploadedImages.length > 0) {
        container.style.display = 'block';
        
        // Clear existing images
        grid.innerHTML = '';
        
        // Add each image
        uploadedImages.forEach(image => {
            const compressionRatio = ((image.originalSize - image.size) / image.originalSize * 100).toFixed(1);
            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            imageItem.innerHTML = `
                <img src="${image.url}" alt="${image.name}">
                <button class="image-remove-btn" onclick="removeImage(${image.id})" title="Remove image">
                    ×
                </button>
                <div class="image-info">
                    <div class="image-name" title="${image.name}">${image.name}</div>
                    <div class="compression-info" title="Compressed by ${compressionRatio}%">
                        ${(image.size / 1024).toFixed(1)}KB
                    </div>
                </div>
            `;
            grid.appendChild(imageItem);
        });
        
        // Update count
        countSpan.textContent = uploadedImages.length;
    } else {
        container.style.display = 'none';
    }
}

function handleNewItemInput() {
    const itemInput = document.getElementById('newItemInput');
    if (!itemInput) return;
    
    const itemName = itemInput.value.trim();
    
    // Add validation feedback
    if (itemName.length > 50) {
        itemInput.classList.add('form-error');
        showInputError('Pet name is too long (max 50 characters)');
    } else if (itemName.length > 0) {
        itemInput.classList.remove('form-error');
        itemInput.classList.add('form-success');
        clearInputError();
    } else {
        itemInput.classList.remove('form-error', 'form-success');
        clearInputError();
    }
    
    // Update left panel display
    updateLeftPanelDisplay();
}

function showInputError(message) {
    let errorElement = document.querySelector('.item-input-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'item-input-error';
        errorElement.style.cssText = `
            color: #ef4444;
            font-size: 0.8rem;
            margin-top: 0.25rem;
            animation: fadeIn 0.3s ease;
        `;
        
        const itemInput = document.getElementById('newItemInput');
        itemInput.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

function clearInputError() {
    const errorElement = document.querySelector('.item-input-error');
    if (errorElement) {
        errorElement.remove();
    }
}
function updateLeftPanelDisplay() {
    const leftPanel = document.getElementById('newItemImageContainer');
    const itemSelect = document.getElementById('newItemSelect');
    const selectedItem = itemSelect ? itemSelect.value : '';
    
    if (!leftPanel) return;
    
    if (uploadedImages.length > 0 || selectedItem) {
        const latestImage = uploadedImages.length > 0 ? uploadedImages[uploadedImages.length - 1] : null;
        
        leftPanel.innerHTML = `
            <div class="new-item-preview">
                ${latestImage ? `
                    <div class="new-item-image">
                        <img src="${latestImage.url}" alt="${latestImage.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">
                    </div>
                ` : `
                    <div class="new-item-image" style="display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.1); border: 2px dashed rgba(255, 255, 255, 0.3);">
                        <div style="text-align: center; color: rgba(255, 255, 255, 0.6);">
                            <div style="font-size: 3rem; margin-bottom: 0.5rem;">${getPetEmoji(selectedItem)}</div>
                            <div style="font-size: 0.8rem;">No image uploaded</div>
                        </div>
                    </div>
                `}
                <div class="new-item-info">
                    <h3 class="new-item-name">${selectedItem || 'Select a Pet'}</h3>
                    <p class="new-item-details">${uploadedImages.length > 0 ? `${uploadedImages.length} image(s) uploaded` : 'Ready to upload images'}</p>
                    ${uploadedImages.length > 0 ? `
                        <div class="new-image-gallery">
                            ${uploadedImages.map((img, index) => `
                                <div class="new-gallery-thumb ${index === uploadedImages.length - 1 ? 'active' : ''}" 
                                     onclick="showImageInLeftPanel(${img.id})"
                                     title="${img.name}">
                                    <img src="${img.url}" alt="${img.name}">
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    } else {
        leftPanel.innerHTML = `
            <div class="new-placeholder-content">
                <div class="new-placeholder-icon">?</div>
                <p class="new-placeholder-text">Select a pet to view details</p>
            </div>
        `;
    }
}

// Remove all pet emoji functions - only use box emoji
function getPetEmoji(itemName) {
    return '📦'; // Always return box emoji
}

// Show specific image in left panel
function showImageInLeftPanel(imageId) {
    const image = uploadedImages.find(img => img.id === imageId);
    const leftPanel = document.getElementById('newItemImageContainer');
    const itemInput = document.getElementById('newItemInput');
    const selectedItem = itemInput ? itemInput.value.trim() : '';
    
    if (!image || !leftPanel) return;
    
    leftPanel.innerHTML = `
        <div class="new-item-preview">
            <div class="new-item-image">
                <img src="${image.url}" alt="${image.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;">
            </div>
            <div class="new-item-info">
                <h3 class="new-item-name">${selectedItem || 'Custom Pet'}</h3>
                <p class="new-item-details">${uploadedImages.length} image(s) uploaded</p>
                <div class="new-image-gallery">
                    ${uploadedImages.map((img, index) => `
                        <div class="new-gallery-thumb ${img.id === imageId ? 'active' : ''}" 
                             onclick="showImageInLeftPanel(${img.id})"
                             title="${img.name}">
                            <img src="${img.url}" alt="${img.name}">
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// Remove image
function removeImage(imageId) {
    uploadedImages = uploadedImages.filter(img => img.id !== imageId);
    updateImagesDisplay();
    updateLeftPanelDisplay();
}

function handleNewItemSelection() {
    updateLeftPanelDisplay();
    
    const itemInput = document.getElementById('newItemInput');
    const imageContainer = document.getElementById('newItemImageContainer');
    
    if (!itemInput || !imageContainer) return;
    
    const selectedItem = itemInput.value.trim();
    
    // If no uploaded images and item entered, show item info
    if (uploadedImages.length === 0 && selectedItem) {
        imageContainer.innerHTML = `
            <div class="new-item-preview">
                <div class="new-item-image" style="display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.1); border: 2px dashed rgba(255, 255, 255, 0.3);">
                    <div style="text-align: center; color: rgba(255, 255, 255, 0.6);">
                        <div style="font-size: 3rem; margin-bottom: 0.5rem;">📦</div>
                        <div style="font-size: 0.8rem;">No image uploaded</div>
                    </div>
                </div>
                <div class="new-item-info">
                    <h3 class="new-item-name">${selectedItem}</h3>
                    <p class="new-item-details">Custom pet: ${selectedItem}</p>
                </div>
            </div>
        `;
    } else if (uploadedImages.length === 0 && !selectedItem) {
        imageContainer.innerHTML = `
            <div class="new-placeholder-content">
                <div class="new-placeholder-icon">?</div>
                <p class="new-placeholder-text">Enter a pet name and upload images to preview</p>
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

        console.log('Placing order with data:', {
            ...formData,
            uploadedImages: formData.uploadedImages.length + ' images',
            totalSize: formData.uploadedImages.reduce((total, img) => total + img.size, 0) + ' bytes'
        });

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
    const itemInput = document.getElementById('newItemInput');
    const priceInput = document.getElementById('newPriceInput');
    const quantityInput = document.getElementById('newQuantityInput');
    
    return {
        type: currentMode,
        game: 'PetSimulator',
        item: itemInput ? itemInput.value.trim() : '',
        price: priceInput ? parseFloat(priceInput.value) : 0,
        quantity: quantityInput ? parseInt(quantityInput.value) : 0,
        imageUrl: getItemImageUrl(itemInput ? itemInput.value.trim() : ''),
        uploadedImages: uploadedImages
    };
}

function getItemImageUrl(itemName) {
    // For custom items, we'll use a default image or the first uploaded image
    if (uploadedImages.length > 0) {
        return uploadedImages[0].url;
    }
    
    const itemImages = {
        'Hell Fox': 'images/hell-fox.png',
        'Dominus Empyreus': 'images/dominus-empyreus.png',
        'Abating Link': 'images/abating-link.png',
        'Abundant Mutation': 'images/abundant-mutation.png',
        'Abyssal Beacon': 'images/abyssal-beacon.png',
        'Accelerated Blast': 'images/accelerated-blast.png'
    };
    
    return itemImages[itemName] || 'images/default-pet.png';
}

function validateFormData(formData) {
    const errors = [];
    
    if (!formData.item || formData.item.length === 0) {
        errors.push('Please enter a pet name');
    } else if (formData.item.length > 50) {
        errors.push('Pet name is too long (max 50 characters)');
    }
    
    if (!formData.price || formData.price <= 0) {
        errors.push('Please enter a valid price');
    }
    
    if (!formData.quantity || formData.quantity <= 0) {
        errors.push('Please enter a valid quantity');
    }
    
    // Check total payload size
    const payloadSize = JSON.stringify(formData).length;
    const maxSize = 45 * 1024 * 1024; // 45MB to be safe
    
    if (payloadSize > maxSize) {
        errors.push('Images are too large. Please reduce image size or quantity.');
    }
    
    if (errors.length > 0) {
        showErrorMessage(errors.join(', '));
        return false;
    }
    
    return true;
}

// API functions with better error handling and timeout
async function createTradeItem(tradeData) {
    try {
        console.log('Sending trade data:', {
            ...tradeData,
            uploadedImages: tradeData.uploadedImages ? tradeData.uploadedImages.length + ' images' : 'none',
            payloadSize: JSON.stringify(tradeData).length + ' bytes'
        });
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for images
        
        const response = await fetch(`${API_BASE_URL}/item/trades`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(tradeData),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log('Response status:', response.status);

        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                console.warn('Could not parse error response as JSON');
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('Success response:', result);
        return { success: true, data: result };
    } catch (error) {
        console.error('API Error:', error);
        
        // Handle different types of errors
        if (error.name === 'AbortError') {
            return { success: false, message: 'Request timed out - images may be too large. Try reducing image size or quantity.' };
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return { success: false, message: 'Network error. Please check your connection and make sure the server is running.' };
        } else if (error.message.includes('Failed to fetch')) {
            return { success: false, message: 'Cannot connect to server. Make sure the backend is running on http://localhost:3000' };
        } else {
            return { success: false, message: error.message || 'Failed to create trade item' };
        }
    }
}

// Fetch market data with better error handling
async function fetchMarketData() {
    try {
        const response = await fetch(`${API_BASE_URL}/item/trades`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                console.warn('Could not parse error response as JSON');
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error('Fetch Market Data Error:', error);
        
        // Handle different types of errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return { success: false, message: 'Network error while fetching market data' };
        } else if (error.message.includes('Failed to fetch')) {
            return { success: false, message: 'Cannot connect to server to fetch market data' };
        } else {
            return { success: false, message: error.message || 'Failed to fetch market data' };
        }
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
    
    // Filter to show only Pet Simulator items
    const petSimulatorTrades = trades.filter(trade => trade.game === 'PetSimulator');
    
    const buyItems = petSimulatorTrades.filter(trade => trade.type === 'buy');
    const sellItems = petSimulatorTrades.filter(trade => trade.type === 'sell');
    
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
    
    const timeAgo = getTimeAgo(item.createdAt);
    const quantityText = type === 'buy' ? `Looking for: ${item.quantity} pets` : `Available: ${item.quantity} pets`;
    
    // Get the image to display (uploaded image or default emoji)
    const displayImage = getDisplayImage(item);
    
    itemDiv.innerHTML = `
        <div class="item-image">${displayImage}</div>
        <div class="item-info">
            <div class="item-name">${item.item}</div>
            <div class="item-price">$${item.price.toFixed(2)}</div>
            <div class="item-quantity">${quantityText}</div>
            <div class="item-time">${timeAgo}</div>
            <div class="seller-info">
                <div class="seller-avatar"></div>
                <span>Trainer_${Math.random().toString(36).substr(2, 8)}</span>
            </div>
        </div>
        <button class="chat-btn" onclick="openChat('${type}', '${item.item}')">Chat</button>
    `;
    
    return itemDiv;
}

function getDisplayImage(item) {
    // If there are uploaded images, use the first one
    if (item.uploadedImages && item.uploadedImages.length > 0) {
        return `<img src="${item.uploadedImages[0].url}" alt="${item.item}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
    }
    
    // Always use box emoji instead of pet-specific emojis
    return '📦';
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
window.handleNewItemInput = handleNewItemInput;
window.openChat = openChat;
window.removeImage = removeImage;
window.showImageInLeftPanel = showImageInLeftPanel;