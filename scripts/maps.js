
// Google Maps Integration for Logistics Dashboard
// Handles delivery location mapping and real-time tracking

let map = null;
let markers = [];
let deliveryData = [];

// Initialize Google Maps
function initializeMap() {
    console.log('Initializing Google Maps...');
    
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps) {
        console.error('Google Maps API not loaded. Please check your API key and script inclusion.');
        showMapError('Google Maps API not available. Please check your configuration.');
        return;
    }
    
    // Default center (Nairobi, Kenya for AgriLink)
    const defaultCenter = { lat: -1.286389, lng: 36.817223 };
    
    // Create map
    const mapContainer = document.getElementById('deliveryMap');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }
    
    map = new google.maps.Map(mapContainer, {
        zoom: 11,
        center: defaultCenter,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });
    
    console.log('Google Maps initialized successfully');
    loadDeliveryLocations();
}

// Load delivery locations and plot on map
async function loadDeliveryLocations() {
    if (!map) {
        console.error('Map not initialized');
        return;
    }
    
    try {
        // Clear existing markers
        clearMarkers();
        
        // Get delivery data from the logistics dashboard
        if (typeof deliveries !== 'undefined' && deliveries.length > 0) {
            deliveryData = deliveries;
        } else {
            console.log('No delivery data available');
            return;
        }
        
        console.log('Processing deliveries for map:', deliveryData.length);
        
        // Process each delivery
        deliveryData.forEach((delivery, index) => {
            plotDeliveryMarker(delivery, index);
        });
        
        // Adjust map bounds to show all markers
        if (markers.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            markers.forEach(marker => {
                bounds.extend(marker.getPosition());
            });
            map.fitBounds(bounds);
            
            // Don't zoom too close if there's only one marker
            if (markers.length === 1) {
                map.setZoom(Math.min(map.getZoom(), 15));
            }
        }
        
    } catch (error) {
        console.error('Error loading delivery locations:', error);
        showMapError('Failed to load delivery locations');
    }
}

// Plot individual delivery marker
function plotDeliveryMarker(delivery, index) {
    // Try to get coordinates from delivery address or use geocoding
    const address = delivery.delivery_address || 'Unknown Address';
    
    // Check if delivery has coordinates
    if (delivery.latitude && delivery.longitude) {
        const position = {
            lat: parseFloat(delivery.latitude),
            lng: parseFloat(delivery.longitude)
        };
        createMarker(delivery, position, address);
    } else {
        // Use geocoding to get coordinates from address
        geocodeAddress(delivery, address);
    }
}

// Geocode address to get coordinates
function geocodeAddress(delivery, address) {
    if (!google.maps || !google.maps.Geocoder) {
        console.error('Geocoding service not available');
        return;
    }
    
    const geocoder = new google.maps.Geocoder();
    
    // Add "Kenya" to the address for better geocoding results
    const fullAddress = address.includes('Kenya') ? address : `${address}, Kenya`;
    
    geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const position = results[0].geometry.location;
            createMarker(delivery, position, address);
        } else {
            console.warn(`Geocoding failed for delivery ${delivery.id}:`, status, address);
            // Use default location with offset for ungeocodable addresses
            const defaultPosition = {
                lat: -1.286389 + (Math.random() - 0.5) * 0.1,
                lng: 36.817223 + (Math.random() - 0.5) * 0.1
            };
            createMarker(delivery, defaultPosition, address + ' (Approximate)');
        }
    });
}

// Create marker on map
function createMarker(delivery, position, address) {
    const statusColors = {
        'pending': '#FEF3C7',
        'assigned': '#DBEAFE', 
        'picked_up': '#E9D5FF',
        'in_transit': '#FED7AA',
        'out_for_delivery': '#D1FAE5',
        'delivered': '#A7F3D0',
        'failed': '#FECACA'
    };
    
    const priorityIcons = {
        'low': '🟢',
        'medium': '🟡', 
        'high': '🟠',
        'urgent': '🔴'
    };
    
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: `Delivery #${delivery.id} - ${delivery.status}`,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: statusColors[delivery.status] || '#9CA3AF',
            fillOpacity: 0.8,
            strokeColor: '#374151',
            strokeWeight: 2
        }
    });
    
    // Create info window content
    const order = orders.find(o => o.id === delivery.order_id);
    const customerName = order?.user?.name || order?.customer_name || 'Unknown Customer';
    
    const infoContent = `
        <div class="p-3 max-w-sm">
            <h3 class="font-semibold text-gray-900 mb-2">
                ${priorityIcons[delivery.priority] || '🟡'} Delivery #${delivery.id}
            </h3>
            <div class="space-y-1 text-sm text-gray-600">
                <p><strong>Customer:</strong> ${customerName}</p>
                <p><strong>Status:</strong> <span class="px-2 py-1 rounded text-xs" style="background-color: ${statusColors[delivery.status]};">${delivery.status}</span></p>
                <p><strong>Priority:</strong> ${delivery.priority || 'medium'}</p>
                <p><strong>Address:</strong> ${address}</p>
                ${delivery.scheduled_date ? `<p><strong>Scheduled:</strong> ${new Date(delivery.scheduled_date).toLocaleString()}</p>` : ''}
                ${delivery.current_location ? `<p><strong>Current Location:</strong> ${delivery.current_location}</p>` : ''}
                ${delivery.notes ? `<p><strong>Notes:</strong> ${delivery.notes}</p>` : ''}
            </div>
            <div class="mt-2 pt-2 border-t border-gray-200">
                <button onclick="updateDeliveryLocation(${delivery.id})" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Update Location
                </button>
            </div>
        </div>
    `;
    
    const infoWindow = new google.maps.InfoWindow({
        content: infoContent
    });
    
    marker.addListener('click', () => {
        // Close other info windows
        markers.forEach(m => {
            if (m.infoWindow) {
                m.infoWindow.close();
            }
        });
        
        infoWindow.open(map, marker);
    });
    
    // Store info window reference
    marker.infoWindow = infoWindow;
    markers.push(marker);
}

// Clear all markers from map
function clearMarkers() {
    markers.forEach(marker => {
        if (marker.infoWindow) {
            marker.infoWindow.close();
        }
        marker.setMap(null);
    });
    markers = [];
}

// Refresh map with updated delivery data
function refreshDeliveryMap() {
    console.log('Refreshing delivery map...');
    loadDeliveryLocations();
}

// Show map error
function showMapError(message) {
    const mapContainer = document.getElementById('deliveryMap');
    if (mapContainer) {
        mapContainer.innerHTML = `
            <div class="flex items-center justify-center h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <div class="text-center">
                    <div class="text-red-500 text-2xl mb-2">⚠️</div>
                    <p class="text-gray-600 font-medium">${message}</p>
                    <p class="text-gray-500 text-sm mt-1">Please check your Google Maps configuration</p>
                </div>
            </div>
        `;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the logistics dashboard
    if (window.location.pathname.includes('logistics-dashboard') || 
        document.getElementById('deliveryMap')) {
        
        // Wait for Google Maps API to load
        if (typeof google !== 'undefined' && google.maps) {
            initializeMap();
        } else {
            // Wait for API to load
            window.initMap = initializeMap;
        }
    }
});

// Global functions for external access
window.initMap = initializeMap;
window.refreshDeliveryMap = refreshDeliveryMap;
window.loadDeliveryLocations = loadDeliveryLocations;
