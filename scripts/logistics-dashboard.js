
// Logistics Dashboard JavaScript - Enhanced with Location Tracking and Real-time Data

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    console.log('Logistics Dashboard initializing...');
    initDashboard();
    loadUserData();
    loadDeliveries();
    loadLogisticsRealTimeStats();
    initializeMap();
});

// Data storage
let deliveries = [];
let currentUser = null;
let trackingData = {};

// Initialize dashboard with user authentication
async function initDashboard() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(user);
        console.log('Current user:', currentUser);
    } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = 'index.html';
    }
}

// Load user data and update UI
async function loadUserData() {
    try {
        const userData = await apiClient.getUser();
        console.log('User data loaded:', userData);
        
        document.getElementById('userName').textContent = userData.name || currentUser.name || 'Logistics Manager';
        document.getElementById('userRole').textContent = userData.role || 'Logistics';
    } catch (error) {
        console.error('Error loading user data:', error);
        document.getElementById('userName').textContent = currentUser.name || 'Logistics Manager';
    }
}

// Load real-time logistics statistics
async function loadLogisticsRealTimeStats() {
    try {
        const deliveriesResponse = await apiClient.getDeliveries();
        const deliveriesList = apiClient.extractArrayData(deliveriesResponse);
        
        const activeDeliveries = deliveriesList.filter(d => 
            ['assigned', 'picked_up', 'in_transit', 'out_for_delivery'].includes(d.status)
        ).length;
        
        const completedToday = deliveriesList.filter(d => {
            const deliveryDate = new Date(d.updated_at || d.created_at);
            const today = new Date();
            return deliveryDate.toDateString() === today.toDateString() && d.status === 'delivered';
        }).length;
        
        // Calculate total distance (simulated for now, will integrate with Google Maps later)
        const totalDistance = deliveriesList.reduce((sum, delivery) => {
            return sum + (delivery.estimated_distance || Math.floor(Math.random() * 20) + 5);
        }, 0);
        
        // Calculate efficiency based on completed vs assigned deliveries
        const totalAssigned = deliveriesList.filter(d => d.status !== 'pending').length;
        const totalCompleted = deliveriesList.filter(d => d.status === 'delivered').length;
        const efficiency = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;
        
        // Update stats display with real data
        document.getElementById('activeDeliveries').textContent = activeDeliveries;
        document.getElementById('completedToday').textContent = completedToday;
        document.getElementById('totalDistance').textContent = totalDistance;
        document.getElementById('efficiency').textContent = efficiency + '%';
        
    } catch (error) {
        console.error('Error loading logistics stats:', error);
        // Fallback values
        document.getElementById('activeDeliveries').textContent = '0';
        document.getElementById('completedToday').textContent = '0';
        document.getElementById('totalDistance').textContent = '0';
        document.getElementById('efficiency').textContent = '0%';
    }
}

// Initialize map placeholder (will integrate with Google Maps later)
function initializeMap() {
    const mapContainer = document.querySelector('.chart-placeholder');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full">
                <div class="text-6xl mb-4">🗺️</div>
                <h4 class="text-lg font-semibold mb-2">Delivery Route Map</h4>
                <p class="text-gray-600 text-center">
                    Interactive map with real-time delivery tracking<br>
                    <small>Google Maps integration will be added here</small>
                </p>
                <div class="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div class="flex items-center">
                        <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span>Completed Routes</span>
                    </div>
                    <div class="flex items-center">
                        <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span>Active Routes</span>
                    </div>
                    <div class="flex items-center">
                        <div class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        <span>Pending Routes</span>
                    </div>
                    <div class="flex items-center">
                        <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <span>Delayed Routes</span>
                    </div>
                </div>
            </div>
        `;
    }
}

// Load deliveries from API with enhanced location data
async function loadDeliveries() {
    try {
        const response = await apiClient.getDeliveries();
        deliveries = apiClient.extractArrayData(response);
        console.log('Deliveries loaded:', deliveries);
        
        // Enhance deliveries with location data (simulated for now)
        deliveries = deliveries.map(delivery => ({
            ...delivery,
            current_location: delivery.current_location || generateSimulatedLocation(),
            estimated_distance: delivery.estimated_distance || Math.floor(Math.random() * 20) + 5,
            estimated_arrival: delivery.estimated_arrival || generateEstimatedArrival(delivery.status)
        }));
        
        const tableBody = document.querySelector('#deliveriesTable');
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (deliveries.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-8">
                        <div class="text-gray-400 text-4xl mb-4">🚚</div>
                        <p class="text-gray-600">No deliveries assigned yet.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        deliveries.forEach(delivery => {
            const row = document.createElement('tr');
            const priorityClass = delivery.priority === 'high' ? 'priority-high' : 
                                 delivery.priority === 'low' ? 'priority-low' : 'priority-medium';
            
            row.innerHTML = `
                <td class="font-medium">#${delivery.id}</td>
                <td>
                    <div class="font-medium">${delivery.product_name || 'Order items'}</div>
                    <div class="text-sm text-gray-500">Order #${delivery.order_id}</div>
                </td>
                <td>
                    <div class="font-medium">${delivery.customer_name || 'Customer'}</div>
                    <div class="text-sm text-gray-500">${delivery.customer_phone || 'No phone'}</div>
                </td>
                <td class="text-sm">
                    <div class="font-medium">${delivery.delivery_address || 'Address not provided'}</div>
                    <div class="text-xs text-gray-500">📍 ${delivery.current_location}</div>
                </td>
                <td><span class="status-${delivery.status}">${delivery.status}</span></td>
                <td><span class="${priorityClass}">${delivery.priority || 'medium'}</span></td>
                <td class="text-sm text-gray-500">
                    <div>ETA: ${delivery.estimated_arrival}</div>
                    <div>${delivery.estimated_distance} km</div>
                </td>
                <td>
                    <div class="flex space-x-2">
                        ${delivery.status === 'assigned' ? 
                            `<button class="btn-primary text-sm" onclick="startDelivery('${delivery.id}')">Start</button>` :
                            `<button class="btn-secondary text-sm" onclick="updateStatus('${delivery.id}')">Update</button>`
                        }
                        <button class="btn-secondary text-sm" onclick="viewRoute('${delivery.id}')">Route</button>
                        <button class="btn-secondary text-sm" onclick="trackDelivery('${delivery.id}')">Track</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        // Update delivery select dropdown
        const deliverySelect = document.getElementById('deliverySelect');
        if (deliverySelect) {
            deliverySelect.innerHTML = '<option value="">Select Delivery</option>';
            deliveries.forEach(delivery => {
                const option = document.createElement('option');
                option.value = delivery.id;
                option.textContent = `${delivery.id} - ${delivery.customer_name || 'Customer'} (${delivery.product_name || 'Items'})`;
                deliverySelect.appendChild(option);
            });
        }
        
    } catch (error) {
        console.error('Error loading deliveries:', error);
        const tableBody = document.querySelector('#deliveriesTable');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-8">
                        <div class="text-red-400 text-4xl mb-4">⚠️</div>
                        <p class="text-gray-600 mb-4">Failed to load deliveries. Please try again.</p>
                        <button class="btn-primary" onclick="loadDeliveries()">Retry</button>
                    </td>
                </tr>
            `;
        }
    }
}

// Generate simulated location (will be replaced with real GPS data)
function generateSimulatedLocation() {
    const locations = [
        'Nairobi CBD', 'Westlands', 'Karen', 'Kileleshwa', 'Lavington',
        'Kilimani', 'Parklands', 'Kasarani', 'Embakasi', 'Donholm'
    ];
    return locations[Math.floor(Math.random() * locations.length)];
}

// Generate estimated arrival time
function generateEstimatedArrival(status) {
    const now = new Date();
    let minutes = 30;
    
    switch (status) {
        case 'assigned':
            minutes = Math.floor(Math.random() * 60) + 60; // 1-2 hours
            break;
        case 'picked_up':
            minutes = Math.floor(Math.random() * 45) + 45; // 45-90 minutes
            break;
        case 'in_transit':
            minutes = Math.floor(Math.random() * 30) + 15; // 15-45 minutes
            break;
        case 'out_for_delivery':
            minutes = Math.floor(Math.random() * 15) + 5; // 5-20 minutes
            break;
        default:
            minutes = Math.floor(Math.random() * 30) + 30;
    }
    
    const eta = new Date(now.getTime() + minutes * 60000);
    return eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Start delivery with location tracking
async function startDelivery(deliveryId) {
    try {
        const delivery = deliveries.find(d => d.id == deliveryId);
        if (!delivery) {
            alert('Delivery not found.');
            return;
        }
        
        // Start location tracking
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    trackingData[deliveryId] = {
                        lat: latitude,
                        lng: longitude,
                        lastUpdate: new Date().toISOString()
                    };
                    console.log(`Started tracking delivery ${deliveryId} at ${latitude}, ${longitude}`);
                },
                (error) => {
                    console.warn('Could not get current location:', error);
                }
            );
        }
        
        await apiClient.updateDeliveryStatus(deliveryId, { 
            status: 'picked_up',
            current_location: 'Starting location - GPS coordinates will be added',
            notes: 'Delivery started with location tracking enabled'
        });
        
        console.log('Started delivery:', deliveryId);
        
        alert(`Started delivery ${deliveryId}. Location tracking enabled. Status updated to "Picked Up"`);
        await Promise.all([loadDeliveries(), loadLogisticsRealTimeStats()]);
        
    } catch (error) {
        console.error('Error starting delivery:', error);
        alert('Failed to start delivery: ' + error.message);
    }
}

// Track delivery in real-time
function trackDelivery(deliveryId) {
    const delivery = deliveries.find(d => d.id == deliveryId);
    if (!delivery) {
        alert('Delivery not found.');
        return;
    }
    
    const trackingInfo = trackingData[deliveryId];
    let locationInfo = delivery.current_location;
    
    if (trackingInfo) {
        locationInfo += `\nGPS: ${trackingInfo.lat.toFixed(6)}, ${trackingInfo.lng.toFixed(6)}`;
        locationInfo += `\nLast Update: ${new Date(trackingInfo.lastUpdate).toLocaleTimeString()}`;
    }
    
    alert(`Delivery Tracking - #${deliveryId}
    
Status: ${delivery.status}
Customer: ${delivery.customer_name || 'N/A'}
Address: ${delivery.delivery_address}
Current Location: ${locationInfo}
ETA: ${delivery.estimated_arrival}
Distance: ${delivery.estimated_distance} km

In a real application, this would show a live map with the delivery route and real-time location updates.`);
}

// View route with enhanced location info
function viewRoute(deliveryId) {
    const delivery = deliveries.find(d => d.id == deliveryId);
    if (delivery) {
        alert(`Route Information - Delivery #${deliveryId}

From: Distribution Center
To: ${delivery.delivery_address}
Current Location: ${delivery.current_location}
Estimated Distance: ${delivery.estimated_distance} km
ETA: ${delivery.estimated_arrival}

Google Maps integration will provide:
- Turn-by-turn navigation
- Real-time traffic updates
- Alternative route suggestions
- Live location sharing with customer`);
    } else {
        alert('Delivery not found.');
    }
}

// Update status from table action
function updateStatus(deliveryId) {
    // Pre-select the delivery in the form
    const deliverySelect = document.getElementById('deliverySelect');
    if (deliverySelect) {
        deliverySelect.value = deliveryId;
    }
    
    // Pre-fill current location if available
    const locationInput = document.getElementById('location');
    const delivery = deliveries.find(d => d.id == deliveryId);
    if (locationInput && delivery) {
        locationInput.value = delivery.current_location || '';
    }
    
    // Scroll to update form
    const updateForm = document.querySelector('form[onsubmit="updateDeliveryStatus(event)"]');
    if (updateForm) {
        updateForm.scrollIntoView({ behavior: 'smooth' });
    }
}

// Update delivery status with enhanced location tracking
async function updateDeliveryStatus(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Updating...';
    submitBtn.disabled = true;
    
    const deliveryId = document.getElementById('deliverySelect').value;
    const newStatus = document.getElementById('newStatus').value;
    const location = document.getElementById('location').value;
    const notes = document.getElementById('statusNotes').value;
    
    try {
        // Get current GPS location if available
        let gpsLocation = null;
        if (navigator.geolocation && ['in_transit', 'out_for_delivery'].includes(newStatus)) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                });
                gpsLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
            } catch (gpsError) {
                console.warn('Could not get GPS location:', gpsError);
            }
        }
        
        const statusData = {
            status: newStatus,
            current_location: location,
            notes: notes,
            gps_coordinates: gpsLocation,
            updated_by: currentUser.id,
            timestamp: new Date().toISOString()
        };
        
        await apiClient.updateDeliveryStatus(deliveryId, statusData);
        console.log('Delivery status updated:', deliveryId, newStatus);
        
        // Update local tracking data
        if (gpsLocation) {
            trackingData[deliveryId] = {
                ...gpsLocation,
                lastUpdate: new Date().toISOString()
            };
        }
        
        alert(`Delivery ${deliveryId} status updated to: ${newStatus}${gpsLocation ? '\nGPS location recorded' : ''}`);
        
        // Reset form
        event.target.reset();
        await Promise.all([loadDeliveries(), loadLogisticsRealTimeStats()]);
        
    } catch (error) {
        console.error('Error updating delivery status:', error);
        alert('Failed to update delivery status: ' + error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Refresh deliveries
async function refreshDeliveries() {
    alert('Refreshing delivery data...');
    await Promise.all([loadDeliveries(), loadLogisticsRealTimeStats()]);
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Make functions globally available
window.startDelivery = startDelivery;
window.trackDelivery = trackDelivery;
window.viewRoute = viewRoute;
window.updateStatus = updateStatus;
window.updateDeliveryStatus = updateDeliveryStatus;
window.refreshDeliveries = refreshDeliveries;
window.logout = logout;
