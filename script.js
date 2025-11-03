// ===== CAROUSEL FUNCTIONALITY =====
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initCarousel();
    initContactTabs();
    initFormHandlers();
    initAdminDashboard();
    initServiceCRUD();
});

// ===== MOBILE MENU =====
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });

        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-times');
                }
            }
        });
    }
}

function initCarousel() {
    const carouselTrack = document.getElementById('carouselTrack');
    
    if (!carouselTrack) return;

    // Check if we should load custom service cards (only on home page)
    const serviceCards = getFromLocalStorage('serviceCards');
    if (serviceCards && serviceCards.length > 0 && !document.getElementById('serviceCardsList')) {
        // We're on home page, update with custom cards
        updateCarouselServices();
        return;
    }

    // Use default cards if no custom cards exist
    const slides = carouselTrack.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    let currentSlide = 0;
    let autoSlideInterval;
    let isHovered = false;
    let touchStartX = 0;
    let touchEndX = 0;

    // Update carousel position
    function updateCarousel() {
        carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    // Next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
        resetAutoSlide();
    }

    // Auto-slide functionality
    function startAutoSlide() {
        if (!isHovered) {
            autoSlideInterval = setInterval(nextSlide, 3000);
        }
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    function resetAutoSlide() {
        stopAutoSlide();
        if (!isHovered) {
            startAutoSlide();
        }
    }

    // Pause on hover
    const carouselContainer = carouselTrack.closest('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            isHovered = true;
            stopAutoSlide();
        });

        carouselContainer.addEventListener('mouseleave', () => {
            isHovered = false;
            startAutoSlide();
        });
    }

    // Touch/swipe support
    if (carouselTrack) {
        carouselTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoSlide();
        }, { passive: true });

        carouselTrack.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            resetAutoSlide();
        }, { passive: true });

        // Mouse drag support
        let isDragging = false;
        let startX = 0;

        carouselTrack.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX;
            stopAutoSlide();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });

        document.addEventListener('mouseup', (e) => {
            if (isDragging) {
                const endX = e.pageX;
                const diff = startX - endX;
                
                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        nextSlide();
                    }
                }
                isDragging = false;
                resetAutoSlide();
            }
        });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            }
        }
    }

    // Initialize
    updateCarousel();
    startAutoSlide();
}

// ===== CONTACT PAGE TOGGLE BUTTONS =====
function initContactTabs() {
    // Support both old toggle buttons and new switcher buttons
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const switcherButtons = document.querySelectorAll('.switcher-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const formCards = document.querySelectorAll('.form-card');

    // New form switcher
    if (switcherButtons.length > 0) {
        switcherButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetForm = button.getAttribute('data-switch');

                // Remove active class from all buttons and cards
                switcherButtons.forEach(btn => btn.classList.remove('active'));
                formCards.forEach(card => card.classList.remove('active'));

                // Add active class to clicked button and corresponding card
                button.classList.add('active');
                const targetCard = document.getElementById(targetForm + '-card');
                if (targetCard) {
                    targetCard.classList.add('active');
                }
            });
        });
        return;
    }

    // Old toggle buttons (backward compatibility)
    if (toggleButtons.length === 0) return;

    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all buttons and panes
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to clicked button and corresponding pane
            button.classList.add('active');
            const targetPane = document.getElementById(targetTab);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

// ===== FORM HANDLING =====
function initFormHandlers() {
    const bookTripForm = document.getElementById('bookTripForm');
    const generalQueryForm = document.getElementById('generalQueryForm');

    if (bookTripForm) {
        bookTripForm.addEventListener('submit', handleBookTripSubmit);
    }

    if (generalQueryForm) {
        generalQueryForm.addEventListener('submit', handleGeneralQuerySubmit);
    }

    // Set minimum date for travel date input
    const travelDateInput = document.getElementById('travelDate');
    if (travelDateInput) {
        const today = new Date().toISOString().split('T')[0];
        travelDateInput.setAttribute('min', today);
    }
}

function handleBookTripSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        id: generateId(),
        type: 'booking',
        name: form.name.value.trim(),
        mobile: form.mobile.value.trim(),
        source: form.source.value.trim(),
        destination: form.destination.value.trim(),
        travelDate: form.travelDate.value,
        members: form.members.value,
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString()
    };

    // Validate form
    if (!validateBookingForm(formData)) {
        return;
    }

    // Save to localStorage
    saveFormToLocalStorage('bookings', formData);

    // Show success message
    showFormMessage('bookTripMessage', 'Thank you! Your trip booking has been submitted successfully.', 'success');

    // Reset form
    form.reset();

    // Scroll to message
    const messageElement = document.getElementById('bookTripMessage');
    if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function handleGeneralQuerySubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = {
        id: generateId(),
        type: 'query',
        name: form.queryName.value.trim(),
        mobile: form.queryMobile.value.trim(),
        message: form.message.value.trim(),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleString()
    };

    // Validate form
    if (!validateQueryForm(formData)) {
        return;
    }

    // Save to localStorage
    saveFormToLocalStorage('queries', formData);

    // Show success message
    showFormMessage('generalQueryMessage', 'Thank you! Your query has been submitted successfully. We will get back to you soon.', 'success');

    // Reset form
    form.reset();

    // Scroll to message
    const messageElement = document.getElementById('generalQueryMessage');
    if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function validateBookingForm(data) {
    const messageElement = document.getElementById('bookTripMessage');
    
    if (!data.name || data.name.length < 2) {
        showFormMessage('bookTripMessage', 'Please enter a valid name (at least 2 characters).', 'error');
        return false;
    }

    if (!data.mobile || !/^[0-9]{10}$/.test(data.mobile)) {
        showFormMessage('bookTripMessage', 'Please enter a valid 10-digit mobile number.', 'error');
        return false;
    }

    if (!data.source || data.source.length < 2) {
        showFormMessage('bookTripMessage', 'Please enter a valid source location.', 'error');
        return false;
    }

    if (!data.destination || data.destination.length < 2) {
        showFormMessage('bookTripMessage', 'Please enter a valid destination location.', 'error');
        return false;
    }

    if (!data.travelDate) {
        showFormMessage('bookTripMessage', 'Please select a travel date.', 'error');
        return false;
    }

    const selectedDate = new Date(data.travelDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        showFormMessage('bookTripMessage', 'Travel date cannot be in the past.', 'error');
        return false;
    }

    if (!data.members || parseInt(data.members) < 1) {
        showFormMessage('bookTripMessage', 'Please enter a valid number of members (at least 1).', 'error');
        return false;
    }

    return true;
}

function validateQueryForm(data) {
    if (!data.name || data.name.length < 2) {
        showFormMessage('generalQueryMessage', 'Please enter a valid name (at least 2 characters).', 'error');
        return false;
    }

    if (!data.mobile || !/^[0-9]{10}$/.test(data.mobile)) {
        showFormMessage('generalQueryMessage', 'Please enter a valid 10-digit mobile number.', 'error');
        return false;
    }

    if (!data.message || data.message.length < 10) {
        showFormMessage('generalQueryMessage', 'Please enter a message (at least 10 characters).', 'error');
        return false;
    }

    return true;
}

function showFormMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `form-message ${type}`;
        messageElement.style.display = 'block';

        // Auto-hide error messages after 5 seconds, success messages after 8 seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, type === 'error' ? 5000 : 8000);
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function saveFormToLocalStorage(key, data) {
    try {
        const existingData = JSON.parse(localStorage.getItem(key) || '[]');
        data.read = false; // New submissions are unread by default
        existingData.push(data);
        localStorage.setItem(key, JSON.stringify(existingData));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        // Fallback: create new array if parsing fails
        data.read = false;
        localStorage.setItem(key, JSON.stringify([data]));
    }
}

// ===== ADMIN DASHBOARD =====
function initAdminDashboard() {
    const bookingsContainer = document.getElementById('bookingsContainer');
    const queriesContainer = document.getElementById('queriesContainer');
    const bookingCount = document.getElementById('bookingCount');
    const queryCount = document.getElementById('queryCount');

    if (!bookingsContainer || !queriesContainer) return;

    // Initialize tabs for bookings and queries
    initDashboardTabs();

    // Load and display bookings
    const bookings = getFromLocalStorage('bookings');
    updateStats(bookings, getFromLocalStorage('queries'));
    displayBookings(bookings);
    if (bookingCount) {
        bookingCount.textContent = bookings.length;
    }

    // Load and display queries
    const queries = getFromLocalStorage('queries');
    displayQueries(queries);
    if (queryCount) {
        queryCount.textContent = queries.length;
    }
}

function initDashboardTabs() {
    const tabButtons = document.querySelectorAll('.dashboard-tabs .tab-btn');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            const container = button.closest('.dashboard-card');
            
            // Remove active class from all tabs in this container
            container.querySelectorAll('.dashboard-tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
            container.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const targetContent = container.querySelector(`#${targetTab}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Refresh the display
            const bookings = getFromLocalStorage('bookings');
            const queries = getFromLocalStorage('queries');
            if (targetTab.includes('bookings')) {
                displayBookings(bookings);
            } else {
                displayQueries(queries);
            }
        });
    });
}

function updateStats(bookings, queries) {
    const unreadBookings = bookings.filter(b => !b.read).length;
    const unreadQueries = queries.filter(q => !q.read).length;
    
    const unreadBookingsCount = document.getElementById('unreadBookingsCount');
    const unreadQueriesCount = document.getElementById('unreadQueriesCount');
    const totalBookingsCount = document.getElementById('totalBookingsCount');
    const totalQueriesCount = document.getElementById('totalQueriesCount');
    const unreadBookingsBadge = document.getElementById('unreadBookingsBadge');
    const unreadQueriesBadge = document.getElementById('unreadQueriesBadge');
    const readBookingsBadge = document.getElementById('readBookingsBadge');
    const readQueriesBadge = document.getElementById('readQueriesBadge');
    
    if (unreadBookingsCount) unreadBookingsCount.textContent = unreadBookings;
    if (unreadQueriesCount) unreadQueriesCount.textContent = unreadQueries;
    if (totalBookingsCount) totalBookingsCount.textContent = bookings.length;
    if (totalQueriesCount) totalQueriesCount.textContent = queries.length;
    if (unreadBookingsBadge) unreadBookingsBadge.textContent = unreadBookings;
    if (unreadQueriesBadge) unreadQueriesBadge.textContent = unreadQueries;
    if (readBookingsBadge) readBookingsBadge.textContent = bookings.length - unreadBookings;
    if (readQueriesBadge) readQueriesBadge.textContent = queries.length - unreadQueries;
}

window.markAsRead = function(type, id) {
    const key = type === 'booking' ? 'bookings' : 'queries';
    const items = getFromLocalStorage(key);
    const item = items.find(item => item.id === id);
    
    if (item) {
        item.read = true;
        saveToLocalStorage(key, items);
        
        // Refresh display
        if (type === 'booking') {
            displayBookings(items);
        } else {
            displayQueries(items);
        }
        
        // Update stats
        const bookings = getFromLocalStorage('bookings');
        const queries = getFromLocalStorage('queries');
        updateStats(bookings, queries);
    }
};

function displayBookings(bookings) {
    const unreadContainer = document.querySelector('#bookings-unread');
    const readContainer = document.querySelector('#bookings-read');
    
    if (!unreadContainer || !readContainer) return;
    
    // Separate read and unread
    const unreadBookings = bookings.filter(b => !b.read);
    const readBookings = bookings.filter(b => b.read);
    
    // Sort by timestamp (newest first)
    unreadBookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    readBookings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Display unread bookings
    if (unreadBookings.length === 0) {
        unreadContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No unread bookings</p>
            </div>
        `;
    } else {
        unreadContainer.innerHTML = unreadBookings.map(booking => createBookingHTML(booking, true)).join('');
    }
    
    // Display read bookings
    if (readBookings.length === 0) {
        readContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <p>No read bookings</p>
            </div>
        `;
    } else {
        readContainer.innerHTML = readBookings.map(booking => createBookingHTML(booking, false)).join('');
    }
}

function displayQueries(queries) {
    const unreadContainer = document.querySelector('#queries-unread');
    const readContainer = document.querySelector('#queries-read');
    
    if (!unreadContainer || !readContainer) return;
    
    // Separate read and unread
    const unreadQueries = queries.filter(q => !q.read);
    const readQueries = queries.filter(q => q.read);
    
    // Sort by timestamp (newest first)
    unreadQueries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    readQueries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Display unread queries
    if (unreadQueries.length === 0) {
        unreadContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No unread queries</p>
            </div>
        `;
    } else {
        unreadContainer.innerHTML = unreadQueries.map(query => createQueryHTML(query, true)).join('');
    }
    
    // Display read queries
    if (readQueries.length === 0) {
        readContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <p>No read queries</p>
            </div>
        `;
    } else {
        readContainer.innerHTML = readQueries.map(query => createQueryHTML(query, false)).join('');
    }
}

function createBookingHTML(booking, isUnread) {
    return `
        <div class="submission-item ${isUnread ? 'unread' : 'read'}" data-id="${booking.id}">
            ${isUnread ? `<button class="mark-read-btn" onclick="markAsRead('booking', '${booking.id}')">Mark as Read</button>` : ''}
            <div class="submission-field">
                <span class="submission-label">Name:</span>
                <span class="submission-value">${escapeHtml(booking.name)}</span>
            </div>
            <div class="submission-field">
                <span class="submission-label">Mobile:</span>
                <span class="submission-value">${escapeHtml(booking.mobile)}</span>
            </div>
            <div class="submission-field">
                <span class="submission-label">Source:</span>
                <span class="submission-value">${escapeHtml(booking.source)}</span>
            </div>
            <div class="submission-field">
                <span class="submission-label">Destination:</span>
                <span class="submission-value">${escapeHtml(booking.destination)}</span>
            </div>
            <div class="submission-field">
                <span class="submission-label">Travel Date:</span>
                <span class="submission-value">${escapeHtml(booking.travelDate)}</span>
            </div>
            <div class="submission-field">
                <span class="submission-label">Members:</span>
                <span class="submission-value">${escapeHtml(booking.members)}</span>
            </div>
            <div class="submission-date">Submitted: ${escapeHtml(booking.date || new Date(booking.timestamp).toLocaleString())}</div>
        </div>
    `;
}

function createQueryHTML(query, isUnread) {
    return `
        <div class="submission-item ${isUnread ? 'unread' : 'read'}" data-id="${query.id}">
            ${isUnread ? `<button class="mark-read-btn" onclick="markAsRead('query', '${query.id}')">Mark as Read</button>` : ''}
            <div class="submission-field">
                <span class="submission-label">Name:</span>
                <span class="submission-value">${escapeHtml(query.name)}</span>
            </div>
            <div class="submission-field">
                <span class="submission-label">Mobile:</span>
                <span class="submission-value">${escapeHtml(query.mobile)}</span>
            </div>
            <div class="submission-field">
                <span class="submission-label">Message:</span>
                <span class="submission-value">${escapeHtml(query.message)}</span>
            </div>
            <div class="submission-date">Submitted: ${escapeHtml(query.date || new Date(query.timestamp).toLocaleString())}</div>
        </div>
    `;
}

function saveToLocalStorage(key, items) {
    try {
        localStorage.setItem(key, JSON.stringify(items));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function getFromLocalStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return [];
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== SERVICE CARDS CRUD =====
function initServiceCRUD() {
    const addServiceBtn = document.getElementById('addServiceBtn');
    const serviceModal = document.getElementById('serviceModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const serviceForm = document.getElementById('serviceForm');
    const serviceCardsList = document.getElementById('serviceCardsList');

    if (!addServiceBtn || !serviceModal) return;

    // Load and display service cards
    loadServiceCards();

    // Open modal to add new service
    addServiceBtn.addEventListener('click', () => {
        openServiceModal();
    });

    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', closeServiceModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeServiceModal);
    }

    // Close modal on overlay click
    if (serviceModal) {
        serviceModal.addEventListener('click', (e) => {
            if (e.target === serviceModal) {
                closeServiceModal();
            }
        });
    }

    // Handle form submission
    if (serviceForm) {
        serviceForm.addEventListener('submit', handleServiceSubmit);
    }
}

function loadServiceCards() {
    const serviceCards = getFromLocalStorage('serviceCards');
    const serviceCardsList = document.getElementById('serviceCardsList');

    if (!serviceCardsList) return;

    if (serviceCards.length === 0) {
        serviceCardsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <p>No service cards yet. Add your first service card!</p>
            </div>
        `;
        return;
    }

    serviceCardsList.innerHTML = serviceCards.map((service, index) => `
        <div class="service-crud-item">
            <div class="service-crud-preview">
                <div class="service-preview-image" style="background-image: url('${escapeHtml(service.image)}');"></div>
                <div class="service-preview-icon">
                    <i class="${escapeHtml(service.icon)}"></i>
                </div>
                <p class="service-preview-text">${escapeHtml(service.description)}</p>
            </div>
            <div class="service-crud-actions">
                <button class="edit-btn" onclick="editService('${service.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteService('${service.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="move-btn" onclick="moveService('${service.id}', 'up')" title="Move Up" ${index === 0 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button class="move-btn" onclick="moveService('${service.id}', 'down')" title="Move Down" ${index === serviceCards.length - 1 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-down"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function openServiceModal(serviceId = null) {
    const serviceModal = document.getElementById('serviceModal');
    const modalTitle = document.getElementById('modalTitle');
    const serviceForm = document.getElementById('serviceForm');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const imageInput = document.getElementById('serviceImage');
    const uploadLabel = document.querySelector('.image-upload-label');

    if (!serviceModal || !serviceForm) return;

    if (serviceId) {
        const serviceCards = getFromLocalStorage('serviceCards');
        const service = serviceCards.find(s => s.id === serviceId);
        
        if (service) {
            document.getElementById('serviceId').value = service.id;
            document.getElementById('serviceIcon').value = service.icon;
            document.getElementById('serviceDescription').value = service.description;
            
            // Show existing image preview
            if (service.image && previewImg && imagePreview) {
                previewImg.src = service.image;
                imagePreview.style.display = 'block';
                if (uploadLabel) {
                    uploadLabel.querySelector('.upload-text').textContent = 'Change Image';
                }
            }
            
            modalTitle.textContent = 'Edit Service';
        }
    } else {
        serviceForm.reset();
        document.getElementById('serviceId').value = '';
        if (imagePreview) imagePreview.style.display = 'none';
        if (previewImg) previewImg.src = '';
        if (uploadLabel) {
            uploadLabel.querySelector('.upload-text').textContent = 'Choose Image';
        }
        modalTitle.textContent = 'Add New Service';
    }

    // Setup image preview (only if not already set up)
    if (imageInput && !imageInput.hasAttribute('data-listener')) {
        imageInput.setAttribute('data-listener', 'true');
        imageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Validate file size (5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image size should be less than 5MB');
                    this.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (previewImg) previewImg.src = e.target.result;
                    if (imagePreview) imagePreview.style.display = 'block';
                    if (uploadLabel) {
                        uploadLabel.querySelector('.upload-text').textContent = 'Change Image';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Remove image button
    const removeImageBtn = document.getElementById('removeImage');
    if (removeImageBtn && !removeImageBtn.hasAttribute('data-listener')) {
        removeImageBtn.setAttribute('data-listener', 'true');
        removeImageBtn.addEventListener('click', function() {
            if (imageInput) imageInput.value = '';
            if (imagePreview) imagePreview.style.display = 'none';
            if (previewImg) previewImg.src = '';
            if (uploadLabel) {
                uploadLabel.querySelector('.upload-text').textContent = 'Choose Image';
            }
        });
    }

    serviceModal.classList.add('active');
}

function closeServiceModal() {
    const serviceModal = document.getElementById('serviceModal');
    const serviceForm = document.getElementById('serviceForm');
    
    if (serviceModal) {
        serviceModal.classList.remove('active');
    }
    
    if (serviceForm) {
        serviceForm.reset();
        document.getElementById('serviceId').value = '';
    }
}

function handleServiceSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const serviceId = form.serviceId.value;
    const icon = form.serviceIcon.value.trim();
    const imageFile = form.serviceImage.files[0];
    const description = form.serviceDescription.value.trim();

    if (!icon || !description) {
        alert('Please fill in all fields');
        return;
    }

    if (!serviceId && !imageFile) {
        alert('Please upload an image');
        return;
    }

    let serviceCards = getFromLocalStorage('serviceCards');
    let imageData = null;
    
    // Handle image upload
    if (imageFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageData = e.target.result; // Base64 data URL
            
            // Process the service card with image
            processServiceCard(serviceId, icon, imageData, description, serviceCards);
        };
        reader.readAsDataURL(imageFile);
    } else {
        // Update without changing image (use existing image)
        const existingService = serviceCards.find(s => s.id === serviceId);
        if (existingService) {
            imageData = existingService.image;
        }
        processServiceCard(serviceId, icon, imageData, description, serviceCards);
    }
}

function processServiceCard(serviceId, icon, imageData, description, serviceCards) {
    if (!imageData) {
        alert('Please upload an image');
        return;
    }

    if (serviceId) {
        // Update existing service
        const index = serviceCards.findIndex(s => s.id === serviceId);
        if (index !== -1) {
            serviceCards[index].icon = icon;
            serviceCards[index].image = imageData;
            serviceCards[index].description = description;
        }
    } else {
        // Add new service
        const newService = {
            id: generateId(),
            icon: icon,
            image: imageData,
            description: description,
            timestamp: new Date().toISOString()
        };
        serviceCards.push(newService);
    }

    saveToLocalStorage('serviceCards', serviceCards);
    loadServiceCards();
    updateCarouselServices();
    closeServiceModal();
    
    // Reset image preview
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const imageInput = document.getElementById('serviceImage');
    const uploadLabel = document.querySelector('.image-upload-label');
    
    if (imagePreview) imagePreview.style.display = 'none';
    if (previewImg) previewImg.src = '';
    if (imageInput) imageInput.value = '';
    if (uploadLabel) {
        uploadLabel.querySelector('.upload-text').textContent = 'Choose Image';
    }
}

window.editService = function(serviceId) {
    openServiceModal(serviceId);
};

window.deleteService = function(serviceId) {
    if (!confirm('Are you sure you want to delete this service card?')) {
        return;
    }

    let serviceCards = getFromLocalStorage('serviceCards');
    serviceCards = serviceCards.filter(s => s.id !== serviceId);
    
    saveToLocalStorage('serviceCards', serviceCards);
    loadServiceCards();
    updateCarouselServices();
};

window.moveService = function(serviceId, direction) {
    let serviceCards = getFromLocalStorage('serviceCards');
    const index = serviceCards.findIndex(s => s.id === serviceId);
    
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
        [serviceCards[index], serviceCards[index - 1]] = [serviceCards[index - 1], serviceCards[index]];
    } else if (direction === 'down' && index < serviceCards.length - 1) {
        [serviceCards[index], serviceCards[index + 1]] = [serviceCards[index + 1], serviceCards[index]];
    }
    
    saveToLocalStorage('serviceCards', serviceCards);
    loadServiceCards();
    updateCarouselServices();
};

function updateCarouselServices() {
    const serviceCards = getFromLocalStorage('serviceCards');
    const carouselTrack = document.getElementById('carouselTrack');
    
    if (!carouselTrack) return;
    
    // Only update if we're on the home page (not in admin)
    if (serviceCards && serviceCards.length > 0 && !document.getElementById('serviceCardsList')) {
        carouselTrack.innerHTML = serviceCards.map(service => `
            <div class="carousel-slide">
                <div class="service-card">
                    <div class="service-image-wrapper">
                        <div class="service-image" style="background-image: url('${escapeHtml(service.image)}');"></div>
                        <div class="service-overlay"></div>
                        <div class="service-icon">
                            <i class="${escapeHtml(service.icon)}"></i>
                        </div>
                    </div>
                    <div class="service-content">
                        <p>${escapeHtml(service.description)}</p>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Reinitialize carousel with new slides
        setTimeout(() => {
            setupCarouselFunctionality();
        }, 100);
    }
}

function setupCarouselFunctionality() {
    const carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) return;

    const slides = carouselTrack.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;
    
    if (totalSlides === 0) return;
    
    let currentSlide = 0;
    let autoSlideInterval;
    let isHovered = false;

    function updateCarousel() {
        carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
        resetAutoSlide();
    }

    function startAutoSlide() {
        if (!isHovered) {
            autoSlideInterval = setInterval(nextSlide, 3000);
        }
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    function resetAutoSlide() {
        stopAutoSlide();
        if (!isHovered) {
            startAutoSlide();
        }
    }

    // Pause on hover
    const carouselContainer = carouselTrack.closest('.carousel-container');
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            isHovered = true;
            stopAutoSlide();
        });

        carouselContainer.addEventListener('mouseleave', () => {
            isHovered = false;
            startAutoSlide();
        });
    }

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    carouselTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoSlide();
    }, { passive: true });

    carouselTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            }
        }
        resetAutoSlide();
    }, { passive: true });

    // Initialize
    updateCarousel();
    startAutoSlide();
}

