# Fender Guitars API

![Project logo](https://github.com/jlinville01/fender-api/blob/main/assets/Fender-Logo-JPG_1211322105.jpg)

## Setup

### Prerequisites
- Node.js (v14 or higher) - [Download here](https://nodejs.org/)
- npm (comes with Node.js)

### Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/jlinville01/fender-api.git
   cd fender-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   - The app will be available at `http://localhost:8080`
   
4. **Run automation**
   ```bash
   npm test
   ```

### Refresh Data
1. **Start the server again**
   ```bash
   Node: npm run dev
   nodemon: npm run dev
   ```
OR

2. **Use the /admin/refresh endpoint (no restart)**
   ```bash
   curl -X POST http://localhost:3000/admin/refresh
   ```

## This project is built with

- Node
- Express
