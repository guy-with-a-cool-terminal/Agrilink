// Handles delivery location mapping and real-time tracking
// Replaced Google Maps with MapLibre GL JS + OpenStreetMap + Photon API,google maps became unreliable
let map = null;
let markers = [];
let deliveryData = [];

// Initialize MapLibre Map
function initializeMap() {
    console.log('Initializing MapLibre...');
    
    // Check if MapLibre is loaded
    if (typeof maplibregl === 'undefined') {
        console.error('MapLibre GL JS not loaded. Please check your script inclusion.');
        showMapError('MapLibre GL JS not available. Please check your configuration.');
        return;
    }
    
    // Default center (Nairobi, Kenya for AgriLink)
    const defaultCenter = [36.817223, -1.286389]; // [lng, lat] format for MapLibre
    
    // Create map
    const mapContainer = document.getElementById('deliveryMap');
    if (!mapContainer) {
        console.error('Map container not found');
        return;
    }
    
    map = new maplibregl.Map({
        container: mapContainer,
        style: {
            version: 8,
            sources: {
                'osm': {
                    type: 'raster',
                    tiles: [
                        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                    ],
                    tileSize: 256,
                    attribution: '© agrilink logistics'
                }
            },
            layers: [
                {
                    id: 'osm',
                    type: 'raster',
                    source: 'osm'
                }
            ]
        },
        center: defaultCenter,
        zoom: 11
    });
    
    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl());
    
    map.on('load', () => {
        console.log('MapLibre initialized successfully');
        loadDeliveryLocations();
    });
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
        
        // Adjust map bounds to show all markers after all are loaded
        setTimeout(() => {
            if (markers.length > 0) {
                const bounds = new maplibregl.LngLatBounds();
                markers.forEach(marker => {
                    bounds.extend(marker.getLngLat());
                });
                
                if (markers.length === 1) {
                    // For single marker, center and set reasonable zoom
                    map.flyTo({
                        center: markers[0].getLngLat(),
                        zoom: 15
                    });
                } else {
                    // Fit all markers
                    map.fitBounds(bounds, { padding: 50 });
                }
            }
        }, 1000); // Wait for geocoding to complete
        
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
        const position = [parseFloat(delivery.longitude), parseFloat(delivery.latitude)]; // [lng, lat]
        createMarker(delivery, position, address);
    } else {
        // Use geocoding to get coordinates from address
        geocodeAddress(delivery, address);
    }
}

// Geocode address using Photon API
async function geocodeAddress(delivery, address) {
    try {
        // Add "Kenya" to the address for better geocoding results
        const fullAddress = address.includes('Kenya') ? address : `${address}, Kenya`;
        
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(fullAddress)}&limit=1`);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
            const coordinates = data.features[0].geometry.coordinates; // [lng, lat]
            createMarker(delivery, coordinates, address);
        } else {
            console.warn(`Geocoding failed for delivery ${delivery.id}:`, address);
            // Use default location with offset for ungeocodable addresses
            const defaultPosition = [
                36.817223 + (Math.random() - 0.5) * 0.1,
                -1.286389 + (Math.random() - 0.5) * 0.1
            ];
            createMarker(delivery, defaultPosition, address + ' (Approximate)');
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        // Use default location with offset for failed requests
        const defaultPosition = [
            36.817223 + (Math.random() - 0.5) * 0.1,
            -1.286389 + (Math.random() - 0.5) * 0.1
        ];
        createMarker(delivery, defaultPosition, address + ' (Approximate)');
    }
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
    
    // Create custom marker element
    const markerElement = document.createElement('div');
    markerElement.style.width = '20px';
    markerElement.style.height = '20px';
    markerElement.style.borderRadius = '50%';
    markerElement.style.backgroundColor = statusColors[delivery.status] || '#9CA3AF';
    markerElement.style.border = '2px solid #374151';
    markerElement.style.cursor = 'pointer';
    markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    markerElement.title = `Delivery #${delivery.id} - ${delivery.status}`;
    
    // Create MapLibre marker
    const marker = new maplibregl.Marker(markerElement)
        .setLngLat(position)
        .addTo(map);
    
    // Create popup content
    // Get customer name from delivery data directly
    const customerName = delivery.customer_name || 
                         delivery.order?.customer_name || 
                         delivery.order?.user?.name || 
                         'Unknown Customer';
    
    const popupContent = `
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
    
    // Create popup
    const popup = new maplibregl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
    }).setHTML(popupContent);
    
    // Add click listener to marker
    markerElement.addEventListener('click', () => {
        // Close other popups
        markers.forEach(m => {
            if (m.popup && m.popup.isOpen()) {
                m.popup.remove();
            }
        });
        
        popup.addTo(map).setLngLat(position);
    });
    
    // Store popup reference
    marker.popup = popup;
    markers.push(marker);
}

// Clear all markers from map
function clearMarkers() {
    markers.forEach(marker => {
        if (marker.popup) {
            marker.popup.remove();
        }
        marker.remove();
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
                    <p class="text-gray-500 text-sm mt-1">Please check your MapLibre configuration</p>
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
        
        // Initialize map directly (no API key needed)
        initializeMap();
    }
});

// Global functions for external access
window.initMap = initializeMap;
window.refreshDeliveryMap = refreshDeliveryMap;
window.loadDeliveryLocations = loadDeliveryLocations;