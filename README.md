# Resolve360 - AI-Powered Maintenance Management Platform

Resolve360 is a comprehensive maintenance management platform designed for large communities, universities, corporate campuses, and institutional environments. The platform leverages AI to automatically classify maintenance issues and route them to appropriate technicians, streamlining the entire maintenance workflow.

## Features

### 🤖 AI-Powered Classification
- Automatic issue categorization using image analysis
- Support for 5 main categories: Plumbing, Electrical, Civil, Common Area Maintenance/Housekeeping, and HVAC
- High accuracy classification with confidence scoring
- Integration with Cloudinary for image processing

### 👥 Multi-Role System
- **Residents/Users**: Report issues with image upload and track progress
- **Administrators**: Monitor all issues, manage users, and oversee operations
- **Technicians/Contractors**: Receive assignments and update issue status

### 📊 Real-time Tracking
- Live status updates (Open, Assigned, Resolved)
- Priority-based issue management
- Comprehensive analytics and reporting
- User-friendly dashboards for all roles

### 🔐 Secure Authentication
- Firebase Authentication integration
- Role-based access control
- Admin email verification system
- Secure data storage with Firestore

## Technology Stack

- **Frontend**: React 19, Tailwind CSS, Framer Motion
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **AI/ML**: Cloudinary AI, Custom classification algorithms
- **UI/UX**: Lucide React Icons, React Hot Toast
- **Deployment**: Ready for Vercel, Netlify, or Firebase Hosting

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project
- Cloudinary account (optional, for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Siddarth-01/Resolve360.git
   cd Resolve360
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Enable Authentication (Google Sign-in)
   - Enable Firestore Database
   - Copy your Firebase config to `src/firebase/config.js`

4. **Set up Firestore Indexes** (Required)
   - Go to your Firebase Console → Firestore Database → Indexes
   - Create the following composite indexes:
     - Collection: `issues`, Fields: `userId` (Ascending) + `createdAt` (Descending)
     - Collection: `issues`, Fields: `status` (Ascending) + `createdAt` (Descending)
     - Collection: `issues`, Fields: `assignedContractor` (Ascending) + `createdAt` (Descending)
   - Or use the provided `firestore.indexes.json` file with Firebase CLI

5. **Configure Cloudinary** (Optional)
   - Create a Cloudinary account
   - Create an upload preset
   - Update `src/cloudinary/config.js` with your credentials

6. **Start the development server**
   ```bash
   npm start
   ```

### Firebase Indexes Setup

The application requires specific Firestore indexes for optimal performance. You can create them manually or use Firebase CLI:

**Manual Setup:**
1. Go to Firebase Console → Firestore Database → Indexes
2. Click "Create Index"
3. Create these indexes:
   - Collection: `issues`, Fields: `userId` (Ascending) + `createdAt` (Descending)
   - Collection: `issues`, Fields: `status` (Ascending) + `createdAt` (Descending)
   - Collection: `issues`, Fields: `assignedContractor` (Ascending) + `createdAt` (Descending)

**Using Firebase CLI:**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Deploy indexes
firebase deploy --only firestore:indexes
```

The application will be available at `http://localhost:3000`

## Usage

### For Residents
1. Navigate to the home page
2. Click "Login as Resident"
3. Create an account or sign in
4. Click "Report New Issue" to upload an image and description
5. The AI will automatically classify the issue and assign it to a technician
6. Track the progress of your reported issues

### For Administrators
1. Navigate to the home page
2. Click "Login as Administrator"
3. Sign in with an admin account (email must be in the admins collection)
4. View all issues, users, and analytics
5. Monitor system performance and user activity

### For Technicians
1. Navigate to the home page
2. Click "Login as Technician"
3. Create an account or sign in
4. View assigned issues
5. Update issue status as work progresses

## AI Classification Categories

The platform automatically classifies issues into the following categories:

1. **Plumbing** - Water leaks, clogs, fixture problems
2. **Electrical** - Wiring, outlets, power issues
3. **Civil** - Structural damage, walls, ceilings, floors
4. **Common Area Maintenance/Housekeeping** - General cleaning and maintenance
5. **HVAC** - Heating, ventilation, and air conditioning

## Deployment

### Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts to deploy

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

### Environment Variables
Create a `.env` file in the root directory:
```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name
REACT_APP_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Roadmap

- [ ] Real-time notifications
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Integration with external maintenance systems
- [ ] Machine learning model training interface
- [ ] Multi-language support
- [ ] Advanced reporting features
