# Protractor Test App 

This was a quick and dirty app to test Protractor's API.


## Installation

To install and run this app, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/your-username/protractor-test-app.git
   cd protractor-test-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your Protractor API credentials:
   ```
   VITE_connId=your_connection_id
   VITE_apiKey=your_api_key
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173` to view the app.

## Usage

- Use the date pickers to select a date range.
- Click the "GET" button to fetch data from the Protractor API.
- View the fetched data in the table.
- Use the export buttons to download data as CSV files.

