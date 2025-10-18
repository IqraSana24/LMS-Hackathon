# LMS Hackathon Project

Learning Management System built with React (Frontend) and Node.js + Express (Backend).

## 🚀 Project Structure

```
LMS-Hackathon/
├── lms-portal/          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
│
└── lms-backend/         # Node.js + Express Backend
    ├── models/
    ├── server.js
    └── package.json
```

## 📦 Installation

### Backend Setup
```bash
cd lms-backend
npm install
```

### Frontend Setup
```bash
cd lms-portal
npm install
```

## 🔧 Configuration

### Backend Environment Variables
Create a `.env` file in `lms-backend/`:
```env
MONGO_URI=mongodb://localhost:27017/lms_hackathon
PORT=5000
```

For production, use MongoDB Atlas connection string.

## 🏃 Running Locally

### Start Backend
```bash
cd lms-backend
npm start
```
Backend runs on: http://localhost:5000

### Start Frontend
```bash
cd lms-portal
npm run dev
```
Frontend runs on: http://localhost:5173

## 🌐 Deployment

### Frontend (Vercel/Netlify)
1. Connect your GitHub repository
2. Set build command: `cd lms-portal && npm run build`
3. Set output directory: `lms-portal/dist`

### Backend (Render/Railway)
1. Connect your GitHub repository
2. Set build command: `cd lms-backend && npm install`
3. Set start command: `cd lms-backend && npm start`
4. Add environment variables (MONGO_URI, PORT)

## 🔗 API Endpoints

- Backend API: `/api/*`
- Swagger Documentation: `/api-docs`

## 👤 Author

**IqraSana24**
- GitHub: [@IqraSana24](https://github.com/IqraSana24)

## 📝 License

This project is open source and available under the MIT License.
