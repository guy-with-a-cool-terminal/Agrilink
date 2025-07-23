# Google Maps Integration Setup Guide

This guide explains how to set up Google Maps integration for the AgriLink Logistics Dashboard.

## Overview

The logistics dashboard uses Google Maps to display delivery locations and provide real-time tracking capabilities. Each delivery is plotted as a marker on the map with color-coded status indicators and detailed information windows.

## Prerequisites

1. A Google Cloud Platform account
2. A Google Maps JavaScript API key
3. Basic understanding of HTML and JavaScript

## Step 1: Create a Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create or Select a Project**
   - Create a new project or select an existing one
   - Note your project name/ID for reference

3. **Enable the Required APIs**
   - Go to "APIs & Services" > "Library"
   - Search for and enable the following APIs:
     - **Maps JavaScript API** (required for map display)
     - **Geocoding API** (required for address-to-coordinates conversion)
     - **Places API** (optional, for enhanced location search)

4. **Create API Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key (keep it secure!)

5. **Restrict Your API Key (Recommended)**
   - Click on your API key to edit it
   - Under "Application restrictions":
     - Select "HTTP referrers (web sites)"
     - Add your website domains (e.g., `yourdomain.com/*`, `localhost:*` for development)
   - Under "API restrictions":
     - Select "Restrict key"
     - Choose only the APIs you enabled above

## Step 2: Configure the AgriLink Application

1. **Update the HTML File**
   - Open `logistics-dashboard.html`
   - Find this line near the bottom:
   ```html
   <script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap&libraries=geometry"></script>
   ```
   - Replace `YOUR_API_KEY` with your actual Google Maps API key:
   ```html
   <script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&callback=initMap&libraries=geometry"></script>
   ```

2. **Verify File Structure**
   - Ensure you have the following files:
     - `logistics-dashboard.html` (main dashboard)
     - `scripts/maps.js` (Google Maps integration)
     - `scripts/logistics-dashboard.js` (dashboard functionality)

## Step 3: Test the Integration

1. **Development Testing**
   - Open the logistics dashboard in your browser
   - Log in as a logistics user
   - The map should load and display delivery markers
   - Click on markers to see delivery information

2. **Common Issues and Solutions**
   - **Map not loading**: Check browser console for API key errors
   - **"Google Maps API not loaded"**: Verify the script tag and API key
   - **Geocoding failures**: Ensure Geocoding API is enabled
   - **Quota exceeded**: Check your API usage in Google Cloud Console

## Step 4: Production Deployment

1. **Security Best Practices**
   - Never expose your API key in public repositories
   - Use environment variables or server-side injection for API keys
   - Set up proper domain restrictions on your API key
   - Monitor API usage regularly

2. **Billing Setup**
   - Google Maps APIs require billing to be enabled
   - Set up billing alerts to monitor costs
   - Consider usage quotas to prevent unexpected charges

## Features Included

### Map Functionality
- **Interactive map** centered on Nairobi, Kenya
- **Color-coded markers** based on delivery status:
  - 🟡 Pending/Assigned
  - 🟠 In Transit/Out for Delivery  
  - 🟢 Delivered
  - 🔴 Failed
- **Info windows** with delivery details
- **Auto-zoom** to fit all delivery markers
- **Real-time updates** when delivery data changes

### Delivery Tracking
- **Geocoding support** for address-to-coordinates conversion
- **Fallback handling** for addresses that can't be geocoded
- **Priority indicators** (🟢 Low, 🟡 Medium, 🟠 High, 🔴 Urgent)
- **Status updates** directly from map markers
- **Customer information** display

### Integration Points
- Connects to existing logistics dashboard data
- Uses the same authentication and API structure
- Refreshes automatically when delivery data updates
- Maintains consistent styling with the rest of the application

## API Usage and Costs

**Estimated monthly costs for typical usage:**
- Small operation (100 deliveries/month): $10-20
- Medium operation (1000 deliveries/month): $50-100
- Large operation (10000+ deliveries/month): $200+

**Ways to optimize costs:**
- Cache geocoding results for repeated addresses
- Use static maps for non-interactive displays
- Implement client-side clustering for many markers
- Set up usage quotas and alerts

## Customization Options

You can customize the map by editing `scripts/maps.js`:

```javascript
// Change default map center
const defaultCenter = { lat: YOUR_LATITUDE, lng: YOUR_LONGITUDE };

// Modify marker colors
const statusColors = {
    'delivered': '#10B981', // Change to your preferred color
    // ... other statuses
};

// Adjust map styling
styles: [
    // Add your custom map styles here
]
```

## Support and Troubleshooting

**Common Error Messages:**
- `Google Maps API not loaded`: Check API key and script inclusion
- `Geocoding failed`: Verify Geocoding API is enabled and has quota
- `RefererNotAllowedMapError`: Add your domain to API key restrictions

**Getting Help:**
- Google Maps Platform Documentation: https://developers.google.com/maps/documentation
- Google Cloud Support: Available with paid support plans
- Community Forums: Stack Overflow, Google Maps Platform Community

## Development vs Production

**Development Setup:**
```html
<!-- Allow localhost for development -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_DEV_API_KEY&callback=initMap"></script>
```

**Production Setup:**
```html
<!-- Restrict to your domain -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_PROD_API_KEY&callback=initMap"></script>
```

Remember to use different API keys for development and production environments, each with appropriate domain restrictions.
