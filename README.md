
# AgriLink - Smart Agricultural Platform

A comprehensive web-based platform connecting farmers, consumers, retailers, logistics managers, and administrators in the agricultural supply chain..

## Project Overview

AgriLink is a multi-role agricultural platform built with vanilla HTML, CSS, and JavaScript. It provides role-based dashboards and functionality for different stakeholders in the agricultural ecosystem.

## Features

- **Multi-Role Authentication**: Support for Farmers, Consumers, Retailers, Logistics Managers, and Admins
- **Role-Based Dashboards**: Customized interfaces for each user type
- **Responsive Design**: Mobile-friendly interface
- **Local Storage**: Client-side user session management
- **Analytics Dashboard**: Data visualization and reporting

## User Roles

1. **Farmer**: Manage crops, track production, view market prices
2. **Consumer**: Browse products, place orders, track deliveries
3. **Retailer**: Manage inventory, process orders, track sales
4. **Logistics Manager**: Coordinate deliveries, optimize routes
5. **Admin**: System oversight, user management, analytics

## Project Structure

```
/
├── index.html              # Main login/registration page
├── farmer-dashboard.html   # Farmer interface
├── consumer-dashboard.html # Consumer interface
├── retailer-dashboard.html # Retailer interface
├── logistics-dashboard.html# Logistics interface
├── admin-dashboard.html    # Admin interface
├── analytics.html          # Analytics dashboard
├── scripts/
│   ├── auth.js            # Authentication logic
│   ├── farmer-dashboard.js # Farmer functionality
│   ├── consumer-dashboard.js# Consumer functionality
│   ├── retailer-dashboard.js# Retailer functionality
│   ├── logistics-dashboard.js# Logistics functionality
│   ├── admin-dashboard.js  # Admin functionality
│   └── analytics.js       # Analytics functionality
└── styles/
    ├── main.css           # Global styles
    ├── auth.css           # Authentication styles
    └── dashboard.css      # Dashboard styles
```

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd agrilink-platform
   ```

2. **Open in browser**
   - Simply open `index.html` in your web browser
   - Or use a local server like Live Server extension in VS Code

3. **Test the application**
   - Use any email/password combination to login
   - Select different roles to access various dashboards
   - Data is stored locally in browser's localStorage

## Development

### Local Development
- No build process required
- Use any local server for development
- Recommended: VS Code with Live Server extension

### File Serving
Make sure all files are served from a web server (not file:// protocol) to avoid CORS issues with local storage and script loading.



## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
# Dashboard refresh
