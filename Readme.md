# Learning Management System Backend

## Overview
This is the backend service for the Learning Management System (LMS), providing APIs and business logic to support the LMS platform.

## Technologies Used
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Cloudinary (for media storage)
- Multer (for file uploads)

## Prerequisites
- Node.js 
- MongoDB
- npm
- Cloudinary account
- Environment variables configured

## Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Create a `.env` file in the root directory
   - Add required environment variables:
     ```
     PORT=4000
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     FRONTEND_URL=your_frontend_url
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USERNAME=your_email
     SMTP_PASSWORD=your_app_password
     SMTP_FROM_EMAIL=your_from_email
     RAZORPAY_KEY_ID=your_razorpay_key_id
     RAZORPAY_SECRET=your_razorpay_secret
     RAZORPAY_PLAN_ID=your_razorpay_plan_id
     ```
4. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Courses
- `GET /api/v1/courses` - Get all courses
- `GET /api/v1/courses/:id` - Get course by ID
- `POST /api/v1/courses` - Create new course
- `PUT /api/v1/courses/:id` - Update course
- `DELETE /api/v1/courses/:id` - Delete course
- `POST /api/v1/courses/:id/lectures` - Add lecture to course
- `DELETE /api/v1/courses/:id/lectures/:lectureId` - Delete lecture from course

### Users
- `POST /api/v1/users/register` - Register new user
- `POST /api/v1/users/login` - Login user
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/update` - Update user profile


### Lectures
- `GET /api/v1/courses/:id/lectures` - Get all lectures for a course
- `GET /api/v1/courses/:id/lectures/:lectureId` - Get lecture by ID
- `POST /api/v1/courses/:id/lectures` - Add lecture to course
- `PUT /api/v1/courses/:id/lectures/:lectureId` - Update lecture
- `DELETE /api/v1/courses/:id/lectures/:lectureId` - Delete lecture from course

### Payments
- `POST /api/v1/payments/subscribe` - Subscribe to a course
- `GET /api/v1/payments/history` - Get payment history
- `POST /api/v1/payments/verify` - Verify payment status



## Features
- User authentication and authorization
- Course management
- Lecture management with video upload
- User profile management
- Error handling
- Input validation
- File upload handling
