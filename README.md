# Welleni - Healthcare Management Platform

> Connecting to better health

A modern healthcare management platform for patients and hospitals, featuring appointment booking, emergency SOS, medical records, and real-time health monitoring.

## 🌟 Features

### For Patients
- 📅 **Appointment Booking** - Schedule appointments with doctors
- 🚨 **Emergency SOS** - Quick access to emergency services
- 📋 **Medical Records** - View and manage health records
- 💊 **Medication Tracking** - Track prescriptions and dosages
- 📊 **Health Vitals** - Monitor blood pressure, heart rate, and more
- 💳 **Razorpay Integration** - Secure payment processing

### For Hospitals
- 👥 **Patient Management** - Comprehensive patient database
- 🛏️ **Bed Management** - Real-time bed availability tracking
- 📊 **Dashboard Analytics** - Hospital statistics and insights
- 🔔 **Alert System** - Emergency and appointment notifications
- 📅 **Schedule Management** - Doctor and staff scheduling

## 🚀 Deployment

### Deploy to Render (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Static Site"
   - Connect your repository
   - Configure:
     - **Build Command**: (leave empty)
     - **Publish Directory**: `.`
   - Click "Create Static Site"

3. **Your site will be live at**: `https://welleni.onrender.com`

📖 See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed instructions.

### Deploy to Cloudflare Pages

📖 See [DEPLOYMENT.md](DEPLOYMENT.md) for Cloudflare deployment instructions.

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Database**: Supabase
- **Payments**: Razorpay
- **Fonts**: Google Fonts (Inter, Playfair Display)
- **Hosting**: Render / Cloudflare Pages

## 📁 Project Structure

```
welleni/
├── index.html              # Main application file
├── package.json            # Node.js metadata
├── render.yaml             # Render configuration
├── wrangler.toml          # Cloudflare configuration
├── _headers               # Custom HTTP headers
├── _redirects             # URL redirects
├── .gitignore             # Git ignore rules
├── README.md              # This file
├── RENDER_DEPLOYMENT.md   # Render deployment guide
└── DEPLOYMENT.md          # Cloudflare deployment guide
```

## 🔧 Local Development

1. **Clone the repository**
   ```bash
   git clone YOUR_REPO_URL
   cd welleni
   ```

2. **Install dependencies** (optional)
   ```bash
   npm install
   ```

3. **Run local server**
   ```bash
   npm start
   ```
   Or use any static server:
   ```bash
   npx serve .
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🔐 Environment Setup

If you're using Supabase and Razorpay, update the credentials in `index.html`:

```javascript
// Supabase Configuration
const SUPABASE_URL = 'your-project-url';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Razorpay Configuration
const RAZORPAY_KEY_ID = 'your-razorpay-key';
```

⚠️ **Security Note**: Since this is a client-side app, only use public/anonymous keys.

## 📱 Features Overview

### Authentication
- Patient and Hospital login/signup
- Role-based access control
- Secure session management

### Patient Dashboard
- Overview statistics
- Upcoming appointments
- Medical records access
- Medication reminders
- Health vitals tracking
- Profile management

### Hospital Dashboard
- Real-time alerts
- Patient management
- Bed availability
- Appointment scheduling
- Analytics and reports

### Emergency System
- One-tap SOS button
- GPS location sharing
- Emergency contact alerts
- Ambulance dispatch

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@welleni.com or open an issue in the repository.

## 🎨 Design Credits

- Color Scheme: Teal & Forest Green
- Typography: Inter (body), Playfair Display (headings)
- Icons: Unicode Emoji

---

**Made with ❤️ for better healthcare**
