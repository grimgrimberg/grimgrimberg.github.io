# 🚀 Yuval Grimberg - Portfolio Website

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://grimgrimberg.github.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.1.4-blue)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/Tested%20with-Playwright-green)](https://playwright.dev/)

## 🎯 Overview

This is my personal portfolio website showcasing my expertise as a **Control Systems Engineer** and **Autonomous Vehicle Specialist**. The site combines professional engineering credentials with interactive features and a touch of humor.

🌐 **Live Demo**: [grimgrimberg.github.io](https://grimgrimberg.github.io)

## ✨ Features

### 🔧 Professional Sections
- **Hero Section** - Dynamic introduction with animated background
- **About Me** - Engineering background and mission
- **Technical Expertise** - Skills in Control Systems, Autonomous Vehicles, ML/AI
- **Featured Projects** - Showcase of engineering solutions
- **Contact Form** - Interactive email client integration

### 🎮 Interactive Elements
- **Real Microsoft Clippy** - Authentic Office Assistant integration
- **Photography Gallery** - Professional travel photography with EXIF data
- **Retro Gaming Zone** - Downloadable classic PC games
- **Animated Goose Assistant** - Debugging duck with personality
- **Easter Eggs** - Hidden features and interactive elements

### 🎨 Technical Features
- **Responsive Design** - Mobile-first approach with TailwindCSS
- **Smooth Animations** - AOS (Animate On Scroll) library
- **Glass Morphism UI** - Modern glassmorphic design elements
- **Custom Color Palette** - Tech-themed gradient colors
- **Performance Optimized** - Local Tailwind build, optimized images

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **TailwindCSS v4.1.4** - Utility-first CSS framework
- **JavaScript (ES6+)** - Interactive functionality
- **AOS Library** - Scroll animations

### Development Tools
- **PostCSS** - CSS processing
- **Playwright** - End-to-end testing
- **PowerShell** - Image optimization scripts
- **Git** - Version control

### External Libraries
- **ClippyJS** - Microsoft Office Assistant
- **Lottie** - Animation rendering
- **Font Awesome** - Icon library
- **Google Fonts** - Typography (Inter, JetBrains Mono)

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/grimgrimberg/grimgrimberg.github.io.git
   cd grimgrimberg.github.io
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the CSS**
   ```bash
   npm run build
   ```

4. **Start development server**
   ```bash
   # For local development, use a simple HTTP server
   npx serve .
   # Or use Python
   python -m http.server 8000
   ```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Build optimized TailwindCSS |
| `npm run watch` | Watch for CSS changes during development |
| `npm test` | Run Playwright tests |
| `npm run test:headed` | Run tests in headed mode |

## 🏗️ Project Structure

```
├── 📁 assets/
│   ├── 📁 css/
│   │   ├── styles.css        # Source Tailwind CSS
│   │   └── output.css        # Compiled CSS
│   ├── 📁 images/
│   │   ├── 📁 optimized/     # Compressed images
│   │   └── ...               # Original photos and assets
│   ├── 📁 js/
│   │   └── scripts.js        # Custom JavaScript
│   └── 📁 sounds/            # Audio effects
├── 📁 _includes/             # Reusable components
├── 📁 _layouts/              # Layout templates
├── 📁 tests/                 # Playwright test suites
├── 📁 playwright-report/     # Test reports
├── index.html                # Main portfolio page
├── photo.html                # Photography showcase
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # TailwindCSS configuration
├── playwright.config.js      # Testing configuration
└── README.md                 # This file
```

## 🎯 Key Pages

### 🏠 Main Portfolio (`index.html`)
- **Hero Section** - Animated introduction
- **About** - Professional background
- **Skills** - Technical expertise
- **Projects** - Featured engineering work
- **Testimonials** - Humorous "reviews"
- **Fun Zone** - Interactive elements
- **Retro Games** - Downloadable classics
- **Contact** - Professional contact form

### 📸 Photography Gallery (`photo.html`)
- **Professional Travel Photography**
- **Real EXIF Data** - Camera settings from Sony α7 II
- **Authentic Lens Information** - Sigma and Sony lenses
- **Interactive Slideshow** - Swiper.js integration
- **Technical Details** - ISO, aperture, focal length

## 🧪 Testing

The project includes comprehensive end-to-end testing with Playwright:

```bash
# Run all tests
npm test

# Run tests with browser UI
npm run test:headed

# View test reports
npx playwright show-report
```

### Test Coverage
- ✅ Portfolio navigation
- ✅ Contact form functionality
- ✅ Interactive elements
- ✅ Photography gallery
- ✅ Responsive design
- ✅ Performance metrics

## 🎨 Design System

### Color Palette
```css
--tech-blue: #0066ff
--tech-dark: #0a0f1c
--tech-purple: #6366f1
--tech-cyan: #06b6d4
--tech-green: #10b981
```

### Typography
- **Display Font**: Inter (300-900 weights)
- **Monospace**: JetBrains Mono (300-600 weights)
- **Icons**: Font Awesome 6.4.0

### Animations
- **Fade In**: Smooth element entrance
- **Slide Animations**: Left/right transitions
- **Pulse Glow**: Attention-grabbing effects
- **Float**: Subtle background animations

## 📱 Responsive Design

The website is fully responsive with breakpoints:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+
- **Large**: 1280px+

## 🔧 Performance Optimizations

- **Image Optimization** - PowerShell script for batch processing
- **Local CSS Build** - No CDN dependencies in production
- **Minified Assets** - Compressed CSS and JavaScript
- **Lazy Loading** - Progressive image loading
- **Efficient Animations** - Hardware-accelerated transforms

## 🎮 Easter Eggs & Features

- **Alt + Shift + C** - Summon Microsoft Clippy
- **Click Counter** - Find the magic number
- **Goose Assistant** - Interactive debugging duck
- **Photography EXIF** - Real camera metadata
- **Retro Games** - Downloadable classics

## 📧 Contact Integration

The contact form uses native `mailto:` functionality:
- **Form Validation** - Client-side validation
- **Email Pre-filling** - Structured message format
- **Fallback Options** - Direct email links
- **Professional Templates** - Pre-written subjects

## 🌟 Unique Features

### Real EXIF Data
Photography gallery includes authentic camera metadata:
- **Camera**: Sony α7 II
- **Lenses**: Sigma 16mm F1.4, Sony FE 28-70mm, Tamron 28-75mm
- **Settings**: Real ISO, aperture, and focal length data

### Interactive Elements
- **Microsoft Clippy** - Authentic Office Assistant
- **Lottie Animations** - Smooth vector animations
- **Sound Effects** - Audio feedback for interactions
- **Dynamic Backgrounds** - Animated gradient effects

## 🚀 Deployment

The site is automatically deployed via GitHub Pages:

1. **Push to main branch**
2. **GitHub Actions builds the site**
3. **Live at**: `https://grimgrimberg.github.io`

### Manual Deployment
```bash
# Build production assets
npm run build

# Commit changes
git add .
git commit -m "Update production build"
git push origin main
```

## 🤝 Contributing

While this is a personal portfolio, suggestions and improvements are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ About Me

I'm **Yuval Grimberg**, a Mechanical Engineer specializing in:
- 🚗 **Autonomous Vehicle Systems**
- ⚙️ **Control Theory & Systems**
- 🤖 **Robotics & Automation**
- 🧠 **Machine Learning Integration**

### Connect With Me
- 📧 **Email**: [yuval.grimberg@gmail.com](mailto:yuval.grimberg@gmail.com)
- 💼 **LinkedIn**: [yuval-grimberg-933215173](https://www.linkedin.com/in/yuval-grimberg-933215173)
- 💻 **GitHub**: [grimgrimberg](https://github.com/grimgrimberg)

---

<div align="center">

**Built with ❤️ and lots of ☕**

*Ready to innovate together?* 🚀

</div>
