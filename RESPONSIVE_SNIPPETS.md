# Responsive Design Snippets & Patterns

## Quick Copy-Paste Responsive Patterns

### 1. Responsive Typography
```css
/* Fluid font sizing with clamp */
.heading {
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  /* Mobile: 1.5rem, scales up to 2.5rem on desktop */
}

.subheading {
  font-size: clamp(1rem, 3vw, 1.5rem);
}

.body-text {
  font-size: clamp(0.9rem, 2vw, 1rem);
}
```

### 2. Responsive Spacing
```css
/* Flexible padding and margins */
.container {
  padding: clamp(1rem, 4vw, 3rem);
  margin: clamp(0.5rem, 2vw, 2rem);
  gap: clamp(1rem, 3vw, 2rem);
}
```

### 3. Responsive Flex Layout
```css
/* Mobile-first flex layout */
.flex-container {
  display: flex;
  flex-direction: column;
  gap: clamp(0.8rem, 2vw, 1.5rem);
}

/* Switch to row on tablets and up */
@media (min-width: 768px) {
  .flex-container {
    flex-direction: row;
  }
}
```

### 4. Responsive Grid
```css
/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(1rem, 3vw, 2rem);
}

@media (min-width: 481px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### 5. Responsive Images
```css
/* Responsive image scaling */
img {
  width: 100%;
  height: auto;
  max-width: 100%;
  object-fit: cover;
}

.responsive-image {
  width: clamp(200px, 80vw, 600px);
  height: auto;
}
```

### 6. Responsive Buttons
```css
/* Mobile-friendly buttons */
button {
  min-height: 44px;
  min-width: 44px;
  padding: clamp(0.6rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem);
  font-size: clamp(0.85rem, 2vw, 1rem);
  border-radius: 8px;
  transition: all 0.2s ease;
}

button:active {
  transform: scale(0.98);
}

@media (max-width: 480px) {
  button {
    width: 100%;
  }
}
```

### 7. Responsive Navigation Bar
```css
/* Mobile-first navbar */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(0.8rem, 3vw, 1.5rem);
  flex-wrap: wrap;
  gap: 1rem;
}

.nav-menu {
  display: none;
}

/* Show menu on tablets and up */
@media (min-width: 768px) {
  .nav-menu {
    display: flex;
    gap: clamp(1rem, 3vw, 2rem);
  }
}
```

### 8. Responsive Container
```css
/* Max-width container with responsive padding */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 4vw, 2rem);
}
```

### 9. Responsive Hero Section
```css
/* Mobile-first hero */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: clamp(1rem, 5vw, 3rem);
  text-align: center;
  gap: 2rem;
}

/* Side-by-side on tablets and up */
@media (min-width: 768px) {
  .hero {
    flex-direction: row;
    text-align: left;
  }

  .hero-content {
    flex: 1;
  }

  .hero-image {
    flex: 1;
  }
}
```

### 10. Responsive Modal/Dialog
```css
/* Mobile-optimized modal */
.modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  padding: clamp(1rem, 4vw, 2rem);
  border-radius: 12px;
  overflow-y: auto;
}

@media (max-width: 480px) {
  .modal-content {
    width: 95%;
    border-radius: 8px;
  }
}
```

## Media Query Mixins (SCSS Style)

### Basic Breakpoints
```css
/* Mobile First */
/* Default styles are mobile */

/* Tablets and up */
@media (min-width: 481px) { }

/* Tablets only */
@media (min-width: 481px) and (max-width: 768px) { }

/* Desktops and up */
@media (min-width: 769px) { }

/* Large desktops */
@media (min-width: 1200px) { }
```

### Advanced Patterns
```css
/* High DPI screens */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  /* Larger assets for high-resolution displays */
}

/* Landscape orientation */
@media (orientation: landscape) {
  /* Landscape-specific styles */
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  /* Dark mode styles */
}

/* Touch-enabled devices */
@media (hover: none) and (pointer: coarse) {
  button {
    min-height: 48px; /* Larger on touch devices */
  }
}
```

## Common Component Patterns

### Responsive Card
```css
.card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  padding: clamp(1rem, 3vw, 1.5rem);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.card-title {
  font-size: clamp(1.1rem, 3vw, 1.3rem);
  font-weight: 600;
}

.card-text {
  font-size: clamp(0.9rem, 2vw, 1rem);
  color: #666;
}
```

### Responsive Form
```css
.form {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 3vw, 1.5rem);
  width: 100%;
  max-width: 600px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  font-size: clamp(0.9rem, 2vw, 1rem);
}

.form-input,
.form-textarea {
  padding: clamp(0.7rem, 2vw, 1rem);
  font-size: 16px; /* Prevents iOS zoom on input focus */
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

@media (min-width: 768px) {
  .form-row {
    display: flex;
    gap: 1rem;
  }

  .form-row .form-group {
    flex: 1;
  }
}
```

### Responsive Table
```css
/* Mobile: Stacked cards, Desktop: Traditional table */
.responsive-table {
  width: 100%;
  border-collapse: collapse;
}

.responsive-table tbody tr {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e0e0e0;
  padding: clamp(1rem, 3vw, 1.5rem);
  margin-bottom: 1rem;
}

.responsive-table td {
  padding: 0.5rem 0;
}

.responsive-table td:before {
  content: attr(data-label);
  font-weight: 600;
  display: block;
  font-size: 0.9rem;
  color: #666;
}

@media (min-width: 768px) {
  .responsive-table tbody tr {
    display: table-row;
    padding: 0;
    margin: 0;
  }

  .responsive-table td {
    padding: 1rem;
  }

  .responsive-table td:before {
    content: none;
  }
}
```

## Tips & Best Practices

1. **Test on Real Devices**: Emulators don't always match real device behavior
2. **Use Flexible Units**: Prefer `rem`, `em`, `%`, and `vw` over fixed `px`
3. **Mobile First**: Start with mobile styles, then enhance for larger screens
4. **Progressive Enhancement**: Ensure basic functionality works on all devices
5. **Avoid Fixed Heights**: Use `min-height` instead of `height` for flexible layouts
6. **Test Touch Interaction**: Make sure buttons are at least 44px × 44px
7. **Optimize Images**: Use appropriate sizes for different devices
8. **Monitor Performance**: Use Lighthouse to check Core Web Vitals
9. **Consider Network**: Test on slow 3G connections
10. **Accessibility**: Maintain readable text sizes and adequate contrast

## Resources
- MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries
- CSS Tricks: https://css-tricks.com/
- Google Fonts: Responsive typography guidelines
- Apple: Human Interface Guidelines for iOS
- Material Design: Android responsive design patterns

---

**Keep these snippets handy for future responsive additions to your project!**
