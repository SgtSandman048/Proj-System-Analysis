class BuyerSellerChatApp {
            constructor() {
                this.currentUser = {
                    id: 1,
                    username: 'buyer',
                    fullname: 'User',
                    role: 'buyer'
                };
                
                this.seller = {
                    id: 2,
                    username: 'store',
                    fullname: 'User',
                    role: 'seller'
                };
                
                this.messages = [];
                this.selectedImages = [];
                this.currentRating = 0;
                this.init();
            }

            init() {
                this.initializeElements();
                this.bindEvents();
                this.setupInitialMessages();
            }

            initializeElements() {
                this.elements = {
                    messagesContainer: document.getElementById('messagesContainer'),
                    messageInput: document.getElementById('messageInput'),
                    sendBtn: document.getElementById('sendBtn'),
                    fileInput: document.getElementById('fileInput'),
                    imagePreview: document.getElementById('imagePreview'),
                    typingIndicator: document.getElementById('typingIndicator'),
                    reviewModal: document.getElementById('reviewModal'),
                    starRating: document.getElementById('starRating'),
                    ratingText: document.getElementById('ratingText'),
                    reviewText: document.getElementById('reviewText'),
                    imageModal: document.getElementById('imageModal'),
                    modalImage: document.getElementById('modalImage')
                };
            }

            bindEvents() {
                // Message input events
                this.elements.messageInput.addEventListener('input', () => {
                    this.autoResize();
                    this.toggleSendButton();
                });

                this.elements.messageInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (this.canSendMessage()) {
                            this.sendMessage();
                        }
                    }
                });

                // Send button
                this.elements.sendBtn.addEventListener('click', () => {
                    if (this.canSendMessage()) {
                        this.sendMessage();
                    }
                });

                // File input
                this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

                // Image modal
                this.elements.imageModal.addEventListener('click', (e) => {
                    if (e.target === this.elements.imageModal) {
                        this.closeImageModal();
                    }
                });

                // Star rating
                document.querySelectorAll('.star').forEach(star => {
                    star.addEventListener('click', (e) => {
                        this.setRating(parseInt(e.target.dataset.rating));
                    });

                    star.addEventListener('mouseover', (e) => {
                        this.highlightStars(parseInt(e.target.dataset.rating));
                    });
                });

                this.elements.starRating.addEventListener('mouseleave', () => {
                    this.highlightStars(this.currentRating);
                });

                // Modal close on background click
                this.elements.reviewModal.addEventListener('click', (e) => {
                    if (e.target === this.elements.reviewModal) {
                        this.closeReviewModal();
                    }
                });
            }

            setupInitialMessages() {
                const initialMessages = [/*
                    {
                        user: this.seller,
                        text: "สวัสดีครับ! ยินดีต้อนรับสู่ร้าน ABC Store 🛍️ มีอะไรให้ช่วยไหมครับ?",
                        type: 'received'
                    },
                    {
                        user: this.currentUser,
                        text: "สวัสดีค่ะ อยากสอบถามเรื่องสินค้าหน่อยค่ะ",
                        type: 'sent'
                    },
                    {
                        user: this.seller,
                        text: "ได้เลยครับ! สินค้าชิ้นไหนที่สนใจครับ? เรามีสินค้าหลากหลายแบบเลยครับ 😊",
                        type: 'received'
                    }*/
                ];

                initialMessages.forEach((msgData, index) => {
                    setTimeout(() => {
                        const message = {
                            id: Date.now() + index,
                            user: msgData.user,
                            text: msgData.text,
                            timestamp: new Date(),
                            type: msgData.type
                        };
                        this.messages.push(message);
                        this.renderMessage(message);
                        this.scrollToBottom();
                    }, index * 1000);
                });
            }

            autoResize() {
                const textarea = this.elements.messageInput;
                textarea.style.height = 'auto';
                textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
            }

            toggleSendButton() {
                const hasText = this.elements.messageInput.value.trim().length > 0;
                const hasImages = this.selectedImages.length > 0;
                
                if (hasText || hasImages) {
                    this.elements.sendBtn.classList.add('active');
                } else {
                    this.elements.sendBtn.classList.remove('active');
                }
            }

            canSendMessage() {
                return this.elements.messageInput.value.trim().length > 0 || this.selectedImages.length > 0;
            }

            handleFileSelect(e) {
                const files = Array.from(e.target.files);
                files.forEach(file => {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            this.selectedImages.push({
                                file: file,
                                dataUrl: e.target.result,
                                name: file.name
                            });
                            this.updateImagePreview();
                            this.toggleSendButton();
                        };
                        reader.readAsDataURL(file);
                    }
                });
                e.target.value = '';
            }

            updateImagePreview() {
                const container = this.elements.imagePreview;
                container.innerHTML = '';

                this.selectedImages.forEach((image, index) => {
                    const previewDiv = document.createElement('div');
                    previewDiv.className = 'image-preview';
                    
                    previewDiv.innerHTML = `
                        <img src="${image.dataUrl}" class="preview-image" alt="${image.name}">
                        <button class="remove-preview" onclick="chatApp.removeImage(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    
                    container.appendChild(previewDiv);
                });
            }

            removeImage(index) {
                this.selectedImages.splice(index, 1);
                this.updateImagePreview();
                this.toggleSendButton();
            }

            sendMessage() {
                const text = this.elements.messageInput.value.trim();
                if (!text && this.selectedImages.length === 0) return;

                const message = {
                    id: Date.now(),
                    user: this.currentUser,
                    text: text,
                    images: [...this.selectedImages],
                    timestamp: new Date(),
                    type: 'sent'
                };

                this.messages.push(message);
                this.renderMessage(message);

                // Clear input
                this.elements.messageInput.value = '';
                this.selectedImages = [];
                this.updateImagePreview();
                this.autoResize();
                this.toggleSendButton();
                this.scrollToBottom();

                // Show typing indicator and simulate seller response
                this.simulateSellerResponse(text);
            }

            simulateSellerResponse(buyerMessage) {
                // Show typing indicator
                this.elements.typingIndicator.style.display = 'flex';

                setTimeout(() => {
                    this.elements.typingIndicator.style.display = 'none';
                    
                    const sellerResponse = this.generateSellerResponse(buyerMessage);
                    let message;
                    
                    // Check if response is an image object
                    if (typeof sellerResponse === 'object' && sellerResponse.type === 'image') {
                        message = {
                            id: Date.now(),
                            user: this.seller,
                            text: sellerResponse.text,
                            images: [{
                                dataUrl: sellerResponse.imageUrl,
                                name: 'response-image'
                            }],
                            timestamp: new Date(),
                            type: 'received'
                        };
                    } else {
                        message = {
                            id: Date.now(),
                            user: this.seller,
                            text: sellerResponse,
                            timestamp: new Date(),
                            type: 'received'
                        };
                    }

                    this.messages.push(message);
                    this.renderMessage(message);
                    this.scrollToBottom();
                }, 1500 + Math.random() * 2000);
            }

            generateSellerResponse(buyerMessage) {
                const lowerMessage = buyerMessage.toLowerCase();
                
                // Product inquiries
                if (lowerMessage.includes('มีสินค้าครับ') ) {
                    return "ชื่อ @SERGENT_SANDMAN ครับ บช.มา";
                }
                if (lowerMessage.includes('สนใจอยากเทรด') ) {
                    return "ชื่อ roblox...เลขบัญชี.....ธนาคาร........ ครับ";
                }
                
                if (lowerMessage.includes('เลขบัญชี xxxxxxxxxx ธนาคาร xxx ครับ') || lowerMessage.includes('สีไหน')) {
                    return {
                        type: 'image',
                        text: "โอนแล้วครับ",
                        imageUrl: "images/fakebills.png"
                    };
                }
                
                if (lowerMessage.includes('โอนละครับ') || lowerMessage.includes('โอนแล้วครับ')) {
                    return "โอเคครับ ส่งขอองแล้วนะครับ";
                }
                
                if (lowerMessage.includes('การันตี') || lowerMessage.includes('รับประกัน')) {
                    return "รับประกันสินค้า 1 ปีเต็มครับ และมี after service ดูแลหลังการขายด้วย มั่นใจได้เลยครับ! ✅";
                }
                
                if (lowerMessage.includes('ขอบคุณ') || lowerMessage.includes('thank')) {
                    return "ยินดีครับ! มีอะไรอยากสอบถามเพิ่มเติมก็ถามได้เลยนะครับ พร้อมให้บริการตลอด 24 ชม. 😊";
                }
                if (lowerMessage.includes('เรียบร้อยครับส่งของให้แล้ว') ) {
                    return "✨ ได้ให้รีวิว 5 ดาว 'ไม่บิด'";
                }
                

                // Default responses
                const defaultResponses = [/*
                    "เข้าใจครับ! มีอะไรอยากสอบถามเพิ่มเติมไหมครับ? 😊",
                    "ขอบคุณที่สอบถามครับ มีคำถามอื่นๆ อีกไหมครับ?",
                    "ครับผม! ยินดีให้คำปรึกษาเรื่องสินค้าเสมอนะครับ ☺️",
                    "ได้เลยครับ! ถ้าต้องการข้อมูลเพิ่มเติมก็บอกได้เลยนะครับ",
                    "เข้าใจครับ อย่าลืงเลทีจะสอบถามนะครับ ยินดีช่วยเหลือครับ! 💙"*/
                ];
                
                return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
            }

            renderMessage(message) {
                const messageGroup = document.createElement('div');
                messageGroup.className = `message-group ${message.type === 'sent' ? 'own' : 'other'}`;

                let messageContent = '';
                
                // Add images first if any
                if (message.images && message.images.length > 0) {
                    message.images.forEach(image => {
                        messageContent += `<img src="${image.dataUrl}" class="message-image" onclick="chatApp.showImage('${image.dataUrl}')" alt="${image.name}">`;
                    });
                }

                // Add text if any
                if (message.text) {
                    if (messageContent) messageContent += '<br>';
                    messageContent += message.text;
                }

                const messageHtml = `
                    <div class="message-header">
                        <i class="fas fa-user-circle"></i>
                        <span>${message.user.fullname}</span>
                        <span>•</span>
                        <span>${message.timestamp.toLocaleTimeString('th-TH', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}</span>
                    </div>
                    <div class="message">
                        ${messageContent}
                        ${message.type === 'sent' ? `
                            <div class="message-time">
                                <span>${message.timestamp.toLocaleTimeString('th-TH', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}</span>
                                <i class="fas fa-check-double" style="color: #4fc3f7;" title="ส่งแล้ว"></i>
                            </div>
                        ` : ''}
                    </div>
                `;

                messageGroup.innerHTML = messageHtml;
                this.elements.messagesContainer.appendChild(messageGroup);
            }

            showImage(src) {
                this.elements.modalImage.src = src;
                this.elements.imageModal.style.display = 'flex';
            }

            closeImageModal() {
                this.elements.imageModal.style.display = 'none';
            }

            scrollToBottom() {
                this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
            }

            // Review Modal Functions
            openReviewModal() {
                this.elements.reviewModal.style.display = 'flex';
            }

            closeReviewModal() {
                this.elements.reviewModal.style.display = 'none';
                this.resetReviewForm();
            }

            setRating(rating) {
                this.currentRating = rating;
                this.highlightStars(rating);
                this.updateRatingText(rating);
            }

            highlightStars(rating) {
                document.querySelectorAll('.star').forEach((star, index) => {
                    if (index < rating) {
                        star.classList.add('active');
                    } else {
                        star.classList.remove('active');
                    }
                });
            }

            updateRatingText(rating) {
                const ratingTexts = {
                    1: 'แย่มาก',
                    2: 'ไม่ค่อยดี',
                    3: 'ปานกลาง',
                    4: 'ดี',
                    5: 'ดีเยี่ยม'
                };
                this.elements.ratingText.textContent = ratingTexts[rating] || 'กรุณาให้คะแนน';
            }

            resetReviewForm() {
                this.currentRating = 0;
                this.highlightStars(0);
                this.elements.ratingText.textContent = 'กรุณาให้คะแนน';
                this.elements.reviewText.value = '';
            }

            submitReview() {
                if (this.currentRating === 0) {
                    alert('กรุณาให้คะแนนก่อนส่งรีวิว');
                    return;
                }

                const reviewText = this.elements.reviewText.value.trim();
                if (!reviewText) {
                    alert('กรุณาเขียนความคิดเห็นก่อนส่งรีวิว');
                    return;
                }

                // Simulate review submission
                const reviewMessage = {
                    id: Date.now(),
                    user: this.currentUser,
                    text: `✨ ได้ให้รีวิว ${this.currentRating} ดาว\n"${reviewText}"`,
                    timestamp: new Date(),
                    type: 'sent'
                };

                this.messages.push(reviewMessage);
                this.renderMessage(reviewMessage);
                this.scrollToBottom();

                // Seller response to review
                setTimeout(() => {
                    const sellerReviewResponse = {
                        id: Date.now(),
                        user: this.seller,
                        text: `ขอบคุณมากๆ ครับสำหรับรีวิว 🙏✨ เรายินดีที่ได้ให้บริการและหวังว่าจะได้ต้อนรับอีกครั้งในอนาคตครับ 😊`,
                        timestamp: new Date(),
                        type: 'received'
                    };

                    this.messages.push(sellerReviewResponse);
                    this.renderMessage(sellerReviewResponse);
                    this.scrollToBottom();
                }, 2000);

                this.closeReviewModal();
                alert('ส่งรีวิวเรียบร้อยแล้ว! ขอบคุณครับ');
            }
        }

        // Function to initialize chat with trading context
        function initializeChatWithContext() {
            const chatContextStr = localStorage.getItem('chatContext');
            
            if (chatContextStr) {
                try {
                    const chatContext = JSON.parse(chatContextStr);
                    
                    // Update the chat header
                    const reviewTitle = document.querySelector('.review-title span');
                    if (reviewTitle) {
                        reviewTitle.textContent = `Chat - ${chatContext.type === 'buy' ? 'Buying' : 'Selling'} ${chatContext.itemName}`;
                    }
                    
                    // Add a system message about the trade context
                    const systemMessage = {
                        id: Date.now(),
                        user: {
                            id: 'system',
                            username: 'system',
                            fullname: 'Trading System',
                            role: 'system'
                        },
                        text: `💼 Trade Discussion: ${chatContext.type === 'buy' ? 'Buying' : 'Selling'} "${chatContext.itemName}" from ${chatContext.game}`,
                        timestamp: new Date(),
                        type: 'received'
                    };
                    
                    // Add the system message to the chat
                    if (typeof chatApp !== 'undefined') {
                        chatApp.messages.push(systemMessage);
                        chatApp.renderMessage(systemMessage);
                        
                        // Add automatic seller response based on trade type
                        setTimeout(() => {
                            let sellerResponseText = '';
                            
                            
                            
                            const sellerMessage = {
                                id: Date.now() + 1,
                                user: chatApp.seller,
                                text: sellerResponseText,
                                timestamp: new Date(),
                                type: 'received'
                            };
                            
                            chatApp.messages.push(sellerMessage);
                            chatApp.renderMessage(sellerMessage);
                            chatApp.scrollToBottom();
                        }, 1000);
                        
                        chatApp.scrollToBottom();
                    }
                    
                    // Clear the context after using it
                    localStorage.removeItem('chatContext');
                    
                } catch (error) {
                    console.error('Error parsing chat context:', error);
                }
            }
        }

        // Global functions
        function openReviewModal() {
            chatApp.openReviewModal();
        }

        function closeReviewModal() {
            chatApp.closeReviewModal();
        }

        function submitReview() {
            chatApp.submitReview();
        }

        function closeImageModal() {
            chatApp.closeImageModal();
        }

        // Initialize the chat application
        const chatApp = new BuyerSellerChatApp();
        window.chatApp = chatApp;

        // Initialize with trading context if available
        setTimeout(() => {
            initializeChatWithContext();
        }, 500);

        // Add some sample interactions after initialization
        setTimeout(() => {
            /*const welcomeMessage = {
                id: Date.now(),
                user: chatApp.seller,
                text: "หากต้องการดูสินค้าเพิ่มเติมหรือมีคำถามใดๆ ก็สอบถามได้เลยนะครับ! พร้อมให้คำปรึกษาตลอด 24 ชม. 🕐",
                timestamp: new Date(),
                type: 'received'
            };*/
            
            // chatApp.messages.push(welcomeMessage);
            // chatApp.renderMessage(welcomeMessage);
            // chatApp.scrollToBottom();
        }, 4000);


        