// Review utility functions and components
class ReviewUtils {
    static getStarDisplay(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '⭐';
        }
        if (halfStar) {
            stars += '⭐';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }
        return stars;
    }

    static getStarInput(name, currentRating = 0) {
        return `
            <div class="star-rating">
                <label class="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
                <div class="flex space-x-1">
                    ${[1, 2, 3, 4, 5].map(rating => `
                        <label class="cursor-pointer">
                            <input type="radio" name="${name}" value="${rating}" class="hidden star-input" ${currentRating === rating ? 'checked' : ''}>
                            <span class="star text-2xl text-gray-300 hover:text-yellow-400 transition-colors" data-rating="${rating}">☆</span>
                        </label>
                    `).join('')}
                </div>
                <p class="text-xs text-gray-500 mt-1">Click to rate from 1 to 5 stars</p>
            </div>
        `;
    }

    static formatReviewDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static getStatusBadge(status) {
        const badges = {
            approved: '<span class="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">Approved</span>',
            pending: '<span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">Pending Approval</span>',
            flagged: '<span class="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">Flagged</span>',
            rejected: '<span class="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">Rejected</span>'
        };
        return badges[status] || badges.pending;
    }

    static canOrderBeReviewed(order) {
        // Only completed/delivered orders can be reviewed
        return ['delivered', 'completed'].includes(order.status);
    }

    static setupStarRatingInputs() {
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('star')) {
                const rating = parseInt(e.target.dataset.rating);
                const container = e.target.closest('.star-rating');
                const radioInput = container.querySelector(`input[value="${rating}"]`);
                
                if (radioInput) {
                    radioInput.checked = true;
                    
                    // Update visual display
                    const stars = container.querySelectorAll('.star');
                    stars.forEach((star, index) => {
                        if (index < rating) {
                            star.textContent = '⭐';
                            star.classList.add('text-yellow-400');
                            star.classList.remove('text-gray-300');
                        } else {
                            star.textContent = '☆';
                            star.classList.add('text-gray-300');
                            star.classList.remove('text-yellow-400');
                        }
                    });
                }
            }
        });
    }

    static createReviewModal(orderId, reviewees, currentUser) {
        if (reviewees.length === 0) {
            showNotification('No users available to review for this order', 'info');
            return;
        }

        const modal = document.createElement('div');
        modal.id = 'reviewModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
                <h3 class="text-lg font-semibold mb-4">Write a Review</h3>
                <form id="reviewForm">
                    <div class="form-group mb-4">
                        <label class="text-sm font-medium text-gray-700 mb-2 block">Review For</label>
                        <select name="reviewee_id" class="w-full px-3 py-2 border border-gray-300 rounded-md" required>
                            <option value="">Select user to review</option>
                            ${reviewees.map(user => `
                                <option value="${user.id}">
                                    ${user.name} (${user.role.charAt(0).toUpperCase() + user.role.slice(1)})
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    ${this.getStarInput('rating')}
                    
                    <div class="form-group mb-4">
                        <label class="text-sm font-medium text-gray-700 mb-2 block">Comment (Optional)</label>
                        <textarea 
                            name="comment" 
                            rows="4" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                            placeholder="Share your experience..."
                            maxlength="1000"
                        ></textarea>
                        <p class="text-xs text-gray-500 mt-1">Maximum 1000 characters</p>
                    </div>
                    
                    <div class="flex space-x-3 mt-6">
                        <button type="submit" class="btn-primary flex-1">Submit Review</button>
                        <button type="button" onclick="ReviewUtils.closeModal('reviewModal')" class="btn-secondary flex-1">Cancel</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.setupStarRatingInputs();
        
        // Setup form submission
        const form = modal.querySelector('#reviewForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const reviewData = {
                order_id: orderId,
                reviewee_id: parseInt(formData.get('reviewee_id')),
                rating: parseInt(formData.get('rating')),
                comment: formData.get('comment').trim() || null
            };
            
            if (!reviewData.reviewee_id) {
                showNotification('Please select a user to review', 'error');
                return;
            }
            
            if (!reviewData.rating) {
                showNotification('Please provide a rating', 'error');
                return;
            }
            
            try {
                await apiClient.createReview(reviewData);
                showNotification('Review submitted successfully!', 'success');
                this.closeModal('reviewModal');
                
                // Refresh the current page data
                if (typeof loadOrderHistory === 'function') {
                    loadOrderHistory();
                }
            } catch (error) {
                console.error('Error submitting review:', error);
                showNotification(error.message || 'Failed to submit review', 'error');
            }
        });
    }

    static closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    }

    static createReviewsList(reviews) {
        if (!reviews || reviews.length === 0) {
            return '<div class="text-center py-8 text-gray-500">No reviews yet</div>';
        }

        return `
            <div class="space-y-4">
                ${reviews.map(review => `
                    <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h4 class="font-medium text-gray-900">${review.reviewer.name}</h4>
                                <p class="text-sm text-gray-600">${review.reviewer.role.charAt(0).toUpperCase() + review.reviewer.role.slice(1)}</p>
                            </div>
                            <div class="text-right">
                                <div class="text-lg">${this.getStarDisplay(review.rating)}</div>
                                <div class="text-xs text-gray-500">${this.formatReviewDate(review.created_at)}</div>
                            </div>
                        </div>
                        ${review.comment ? `<p class="text-gray-700 mt-2">${review.comment}</p>` : ''}
                        <div class="mt-2 flex justify-between items-center">
                            ${this.getStatusBadge(review.status)}
                            ${review.admin_notes ? `<p class="text-xs text-gray-500 italic">Admin: ${review.admin_notes}</p>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    static addReviewColumnToOrderTable() {
        // This will be called to add review buttons to existing order tables
        return `
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reviews
            </th>
        `;
    }

    static getReviewButtonForOrder(order, currentUser) {
        if (!this.canOrderBeReviewed(order)) {
            return '<span class="text-gray-400 text-sm">Order not completed</span>';
        }

        return `
            <button 
                class="btn-primary text-sm" 
                onclick="ReviewUtils.openReviewModal(${order.id})"
            >
                Add Review
            </button>
        `;
    }

    static async openReviewModal(orderId) {
        try {
            // Get current user
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                showNotification('Please log in to write reviews', 'error');
                return;
            }

            // Get potential reviewees for this order
            const response = await apiClient.getOrderReviewees(orderId);
            const reviewees = apiClient.extractArrayData(response) || [];
            
            this.createReviewModal(orderId, reviewees, currentUser);
        } catch (error) {
            console.error('Error opening review modal:', error);
            showNotification(error.message || 'Failed to load review options', 'error');
        }
    }

    static async loadUserReviews(userId, containerId) {
        try {
            const response = await apiClient.getUserReviews(userId);
            const data = response.data;
            
            const container = document.getElementById(containerId);
            if (!container) return;

            const avgRating = data.average_rating;
            const reviews = data.reviews || [];
            
            container.innerHTML = `
                <div class="mb-6">
                    <div class="flex items-center space-x-4 mb-4">
                        <h3 class="text-lg font-semibold">Reviews & Ratings</h3>
                        ${avgRating ? `
                            <div class="flex items-center space-x-2">
                                <span class="text-2xl">${this.getStarDisplay(avgRating)}</span>
                                <span class="text-gray-600">${avgRating}/5 (${data.total_reviews} reviews)</span>
                            </div>
                        ` : '<span class="text-gray-500">No reviews yet</span>'}
                    </div>
                    ${this.createReviewsList(reviews)}
                </div>
            `;
        } catch (error) {
            console.error('Error loading user reviews:', error);
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = '<div class="text-red-500">Failed to load reviews</div>';
            }
        }
    }
}

// Initialize star rating system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    ReviewUtils.setupStarRatingInputs();
});

// Make ReviewUtils globally available
if (typeof window !== 'undefined') {
    window.ReviewUtils = ReviewUtils;
}