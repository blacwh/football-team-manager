# ⚽ Football Team Manager

A modern web application for managing Saturday football sessions with complete game scheduling, real-time scoring, and league management.

## 🌟 Features

### ✅ Currently Available
- **🏠 Professional Homepage**: Modern yellow-themed design with smooth animations
- **📅 Smart Game Scheduler**: 
  - Support for 3-4 teams with customizable names
  - Team photo and logo placeholders
  - Complete 4-hour session scheduling (~34 games)
  - Sequential gameplay (one game at a time)
- **🏆 Live League Table**: 
  - Automatic points calculation (3-1-0 system)
  - Goal difference tracking
  - Real-time ranking updates
- **🎮 Game Management**: 
  - 7-minute match duration
  - Manual game completion with "Finish" button
  - Score input with validation
- **📊 Game History**: 
  - Complete session tracking
  - Historical statistics
  - Session management and review
- **🎨 Yellow Team Branding**: Professional yellow color scheme throughout
- **📱 Mobile Responsive**: Optimized for all devices

## 🚀 Tech Stack

- **Frontend**: Next.js 14 + TypeScript
- **Styling**: SCSS + Tailwind CSS
- **Icons**: Heroicons
- **Storage**: Browser localStorage
- **Deployment**: Vercel

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18.17 or later
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/football-team-manager.git
   cd football-team-manager
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**: Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Use

### Setting Up a Game Session
1. **Navigate to Game Scheduler**
2. **Select number of teams** (3 or 4)
3. **Enter team names** (photo placeholders available)
4. **Click "Generate Schedule"** to create complete 4-hour session

### Playing Games
1. **View the complete schedule** organized by rounds
2. **Play games sequentially** (one at a time)
3. **Enter scores** for each match
4. **Click "Finish Game"** to update league table
5. **Continue through all 34+ games**

### Managing Sessions
1. **Save completed sessions** for history
2. **View detailed statistics** in Game History
3. **Review past performance** and results

## 📊 Game Format

### 4-Hour Session Structure
- **Game Duration**: 7 minutes per match
- **Total Games**: ~34 games (252 minutes = 4.2 hours)
- **Format**: Sequential round-robin tournament

### Team Configurations
- **3 Teams**: 12 rounds × 3 games = 36 total games
- **4 Teams**: 6 rounds × 6 games = 36 total games

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # SCSS stylesheets
```

## 🚀 Deployment

This app is optimized for deployment on Vercel:

1. **Build the project**: `npm run build`
2. **Deploy to Vercel**: Connect your GitHub repository
3. **Automatic deployments**: Updates deploy automatically on push

## 🎯 Roadmap

### Phase 2 (Planned)
- **☁️ Cloud Database**: MongoDB integration for permanent storage
- **🔄 Cross-device Sync**: Access history from any device  
- **📄 Export Features**: PDF reports and CSV data export
- **📈 Advanced Analytics**: Team performance trends and statistics

### Phase 3 (Future)
- **🏆 Tournament Mode**: Multi-session tournaments
- **👥 Player Management**: Individual player statistics
- **📅 Season Tracking**: Long-term competition management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Support

For support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for Saturday football sessions** ⚽🟡