# AI-Based Person Detection Surveillance System

A full-stack AI surveillance system prototype for attribute-based person search with path segmentation optimization. This is an FYP1 academic project demonstrating core technical feasibility.

## Features

- **Authentication System**: JWT-based authentication with role-based access control (admin, security_personnel)
- **Video Processing**: Upload and process surveillance videos with person detection
- **Attribute Recognition**: Extract clothing colors and gender from detected persons (STUB implementation)
- **Natural Language Search**: Search for people using natural language queries (e.g., "male wearing red shirt")
- **Advanced Filtering**: Filter detections by gender, upper/lower body colors, and confidence threshold
- **Performance Dashboard**: Real-time metrics and statistics visualization
- **Camera Management**: Configure and manage surveillance cameras (admin only)

## Tech Stack

### Frontend
- React.js 18+ with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- shadcn/ui component library
- React Query for state management
- Axios for API calls
- Recharts for data visualization

### Backend
- FastAPI (Python 3.10+)
- Pydantic for data validation
- SQLAlchemy ORM
- Alembic for migrations
- JWT authentication
- OpenCV for video processing

### Database
- PostgreSQL 15+
- Redis for caching (optional)

### DevOps
- Docker & Docker Compose
- Structured logging (loguru)

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.10+ (for local development)

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd surveillance-saraem
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Start all services:
```bash
docker-compose up -d
```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/docs

### Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Security | security | security123 |

## Local Development

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
export DATABASE_URL=postgresql://surveillance_user:secure_password@localhost:5432/surveillance_db

# Run migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Project Structure

```
surveillance-system/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Configuration and security
│   │   ├── db/            # Database setup
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic (STUB implementations)
│   │   └── utils/         # Utility functions
│   ├── alembic/           # Database migrations
│   └── requirements.txt
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - Register new user (admin only)
- `GET /api/v1/auth/me` - Get current user info

### Videos
- `POST /api/v1/videos/upload` - Upload video file
- `POST /api/v1/videos/{video_id}/process` - Start processing
- `GET /api/v1/videos/{video_id}/status` - Get processing status
- `GET /api/v1/videos` - List all videos
- `DELETE /api/v1/videos/{video_id}` - Delete video

### Search
- `POST /api/v1/search/query` - Natural language search
- `POST /api/v1/search/advanced` - Structured attribute search
- `GET /api/v1/search/history` - Get search history

### Metrics
- `GET /api/v1/metrics/summary` - System statistics
- `GET /api/v1/metrics/videos` - Per-video metrics
- `GET /api/v1/metrics/attributes` - Attribute distribution

### Cameras
- `GET /api/v1/cameras` - List cameras
- `POST /api/v1/cameras` - Create camera (admin)
- `PUT /api/v1/cameras/{id}` - Update camera (admin)
- `DELETE /api/v1/cameras/{id}` - Delete camera (admin)

## Natural Language Search Examples

The NLP parser supports queries like:
- "male wearing red shirt"
- "female with blue pants"
- "person with black top and white bottom"
- "man in green jacket"

## STUB Implementations

This prototype uses STUB implementations for ML components:

- **DetectorService**: Generates mock person detections with random bounding boxes
- **AttributeClassifier**: Returns random attributes (color, gender) with realistic confidence scores
- **SegmentationService**: Creates simple rectangular masks for walkable regions

These stubs are designed to be replaced with actual models in FYP2:
- YOLOv11 for person detection
- ResNet-50 for attribute classification
- DeepLabv3+ for semantic segmentation

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://... |
| REDIS_URL | Redis connection string | redis://redis:6379/0 |
| SECRET_KEY | JWT signing key | your-secret-key |
| UPLOAD_DIR | Video upload directory | /app/uploads |
| MAX_UPLOAD_SIZE_MB | Maximum upload size | 500 |
| DETECTION_CONFIDENCE_THRESHOLD | Minimum detection confidence | 0.6 |

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## Development Workflow

1. Create a feature branch
2. Make changes
3. Run tests
4. Submit pull request

## Acknowledgments

This project is developed as part of FYP1 (Final Year Project Phase 1) to demonstrate full-stack development capabilities and understanding of AI/ML pipeline architecture.

## License

MIT License - See LICENSE file for details
