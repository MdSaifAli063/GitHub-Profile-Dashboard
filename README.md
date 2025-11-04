# GitHub Profile Dashboard

A modern, beautiful, and feature-rich GitHub profile viewer built with pure HTML, CSS, and JavaScript. This single-page application provides a comprehensive overview of any GitHub user's profile with an elegant, light-themed interface.

![GitHub Profile Dashboard](https://img.shields.io/badge/GitHub-Profile%20Dashboard-blue?style=for-the-badge&logo=github)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

### 🎯 Core Features
- **User Profile Display**: View avatar, name, bio, and GitHub handle
- **Statistics Overview**: Followers, following, and repository count
- **Top Repositories**: Display top 6 repositories sorted by stars
- **Achievement Badges**: Automatic achievement detection based on profile metrics
- **GitHub Trophies**: Visual trophy display for GitHub accomplishments

### 🆕 Enhanced Features
- **📊 Contribution Graph**: Interactive contribution activity graph
- **💻 Programming Languages**: Analysis of programming languages used across repositories
- **📈 Activity Statistics**: 
  - Total commits estimate
  - Commits this year
  - Average repository size
  - Most used programming language
- **🔗 Social Links**: Quick access to GitHub profile, website, Twitter, and location
- **🎨 Modern UI**: Clean, light-themed design with smooth animations
- **📱 Responsive Design**: Fully responsive layout for all screen sizes

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server or build tools required - works directly in the browser!

### Installation

1. **Clone or download the repository**
   ```bash
   git clone <repository-url>
   cd HTML
   ```

2. **Open the file**
   - Simply open `card.html` in your web browser
   - Or serve it using a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js (http-server)
     npx http-server
     
     # Using PHP
     php -S localhost:8000
     ```

3. **Start exploring!**
   - Enter any GitHub username in the search box
   - Click "Show" or press Enter
   - Enjoy the beautiful profile dashboard!

## 📖 Usage

1. **Search for a User**
   - Type a GitHub username in the input field
   - Click the "Show" button or press Enter
   - The dashboard will fetch and display all profile information

2. **URL Parameters**
   - You can also load a profile directly via URL:
     ```
     card.html?u=username
     ```

3. **Explore Features**
   - Scroll through different sections to see:
     - User profile information
     - Top repositories
     - Achievement badges
     - Contribution graph
     - Programming languages used
     - Activity statistics
     - Social links

## 🎨 Design Features

- **Light Theme**: Beautiful, modern light theme with excellent readability
- **Smooth Animations**: Subtle hover effects and transitions
- **Card-Based Layout**: Clean, organized card-based design
- **Responsive Grid**: Adaptive grid layout that works on all devices
- **Color-Coded Elements**: Visual language indicators and status badges
- **Interactive Elements**: Hover effects on cards, buttons, and links

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables, flexbox, and grid
- **Vanilla JavaScript**: No frameworks or dependencies
- **GitHub API**: RESTful API integration for data fetching

### API Endpoints Used
- `https://api.github.com/users/{username}` - User profile data
- `https://api.github.com/users/{username}/repos` - Repository data
- `https://github-profile-trophy.vercel.app/` - Trophy images
- `https://github-readme-activity-graph.vercel.app/` - Contribution graphs

### Browser Support
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📁 Project Structure

```
.
├── card.html          # Main application file
├── README.md          # This file
└── (other HTML files) # Other project files
```

## 🔧 Customization

### Changing Colors
Edit the CSS variables in the `:root` selector:
```css
:root{
  --primary:#2563eb;      /* Primary blue color */
  --accent:#10b981;       /* Accent green color */
  --secondary:#6366f1;     /* Secondary indigo color */
  --text-dark:#1e293b;    /* Dark text color */
  /* ... more variables */
}
```

### Modifying Layout
Adjust the grid columns in the `.cols` and `.row-container` classes:
```css
.cols{
  grid-template-columns:380px 1fr; /* Left panel width */
}
```

## 🐛 Known Issues

- Contribution graph may take a few seconds to load
- Some users may have rate limiting restrictions (GitHub API)
- Contribution graph may not be available for all users

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

1. **Report Bugs**: Open an issue if you find any bugs
2. **Suggest Features**: Share your ideas for new features
3. **Improve Code**: Submit pull requests with improvements
4. **Documentation**: Help improve documentation

## 📝 License

This project is open source and available for personal and commercial use.

## 🙏 Acknowledgments

- **GitHub API** for providing the data
- **GitHub Profile Trophy** service for trophy images
- **GitHub Readme Activity Graph** for contribution graphs
- **Poppins Font** from Google Fonts

## 📊 Features Breakdown

### Profile Information
- ✅ Avatar with hover effects
- ✅ Full name and username
- ✅ Bio description
- ✅ Followers, following, and repos count

### Repository Information
- ✅ Top 6 repositories by stars
- ✅ Repository descriptions
- ✅ Star and fork counts
- ✅ Programming language indicators
- ✅ Direct links to repositories

### Statistics & Analytics
- ✅ Total stars across all repos
- ✅ Total forks
- ✅ Largest repository
- ✅ Average repository size
- ✅ Most used programming language

### Visual Elements
- ✅ Contribution activity graph
- ✅ GitHub trophy display
- ✅ Achievement badges
- ✅ Programming language breakdown with color coding

### Social & Links
- ✅ GitHub profile link
- ✅ Personal website/blog
- ✅ Twitter profile (if available)
- ✅ Location with map link

## 🎯 Future Enhancements

Potential features for future versions:
- [ ] Dark mode toggle
- [ ] Export profile as PDF
- [ ] Share profile feature
- [ ] Compare two profiles
- [ ] Repository search and filtering
- [ ] More detailed commit statistics
- [ ] Star history graph
- [ ] Issue and PR statistics

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the code comments for technical details

## ⚡ Performance

- **Fast Loading**: Optimized API calls with Promise.all
- **Caching**: URL parameter support for quick reloads
- **Responsive**: Works smoothly on mobile and desktop
- **Lightweight**: No external dependencies except Google Fonts

---

**Made with ❤️ using GitHub API**

Enjoy exploring GitHub profiles! 🚀

