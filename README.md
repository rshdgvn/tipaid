🛒 TipAid — Smart Shopping Assistant
====================================

**TipAid** is an intelligent shopping companion designed to help users shop smarter and save money. By leveraging the power of **Generative AI**, TipAid analyzes recipes, compares ingredient prices across multiple local stores (like O-Save, Dali, and Pampanga Market), and calculates the most cost-effective shopping list based on your specific budget.

Stop guessing prices—TipAid helps you visualize cost breakdowns, find the best deals, and download your optimized shopping list instantly.

🚀 Tech Stack
-------------

We utilize a modern, high-performance stack to deliver real-time calculations and a seamless user experience.

**Component Technology Description Frontend** Dynamic user interface and state management.**Styling** Responsive, utility-first design system.**Backend** Robust API handling and business logic.**AI Engine** Recipe generation and ingredient analysis.**Data Processing** Complex price calculations and data manipulation.

✨ Key Features
--------------

*   **🥗 Recipe to Ingredients:** Automatically extracts ingredient lists from selected dishes using Gemini AI.
    
*   **💰 Smart Budgeting:** Checks if your shopping list fits your budget in real-time.
    
*   **🏆 Store Comparison:** Generates a "Price Leaderboard" to show which store offers the cheapest total.
    
*   **📉 Best Price Highlighting:** Intelligently highlights better deals if individual items are cheaper at other stores.
    
*   **📥 Export to Image:** Download a clean, formatted PNG of your shopping list for offline use.
    

🛠️ Setup Instructions
----------------------
Follow the steps below to set up the project locally.

---

## 1. Clone the Repository

```bash
git clone https://github.com/7078-cj/TipAid.git
cd TipAid
```

---

## 2. Backend Setup

```bash
cd backend
```

### Create Virtual Environment

```bash
python -m venv venv
```

Activate it:

**Windows**

```bash
venv\Scripts\activate
```

**Mac/Linux**

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Environment Variables

If the project includes `.env.example`:

```bash
cp .env.example .env
```

Then fill in all required values.

### Run Migrations (if applicable)

```bash
python manage.py migrate
```

### Start Backend Server

```bash
python manage.py runserver
```

Backend URL:

```
http://127.0.0.1:8000
```

---

## 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
```

### Install Dependencies

```bash
npm install
# or
yarn install
```

### Configure API URL (if required)

In `.env` or configuration:

```
VITE_API_URL=http://127.0.0.1:8000
```

### Start Frontend Server

```bash
npm start
# or
yarn start
```

Frontend URL:

```
http://localhost:3000
```

---

## 4. Optional: Docker Setup

If Docker is available:

```bash
docker-compose up --build
```

This starts both backend and frontend.

---

## 5. Setup Complete

* Frontend running at: **[http://localhost:3000](http://localhost:3000)**
* Backend running at: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

You now have TipAid running locally.
