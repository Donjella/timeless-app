## Table of Contents

- [Important Links and Information](#important-links-and-information)
- [Test Accounts](#test-accounts)
- [Overview](#overview)
- [Technologies Used (Frontend)](#technologies-used-frontend)
  - [Core Dependencies](#core-dependencies)
  - [Development Dependencies](#development-dependencies)
  - [Dependency Management](#dependency-management)
- [Hardware Requirements](#hardware-requirements)
  - [Development Environment (Local Machine)](#1-development-environment-local-machine)
  - [Production Environment](#2-production-environment)
- [Coding Style Guide and Conventions](#coding-style-guide-and-conventions)
  - [ESLint Configuration](#eslint-configuration)
  - [Prettier Formatting](#prettier-formatting)
  - [Editor Setup](#editor-setup)
- [Project Setup Instructions](#project-setup-instructions)
- [Image Credits](#image-credits)

---

## Important Links and Information

### macOS Users

If you see a warning like `"rollup.darwin-x64.node” cannot be opened because the developer cannot be verified`, it's a macOS security feature.

To fix it, run:

```bash
sudo xattr -r -d com.apple.quarantine .
```
### Important Links

- 🔗 **Live Deployment**: [https://timeless-front-end.netlify.app/](https://timeless-front-end.netlify.app/)
- 🖥️ **Local Development**: http://localhost:5173 (or another available port such as 5174, depending on your local setup)
- 🌐 **Backend API**: [https://timeless-back-end.onrender.com/](https://timeless-back-end.onrender.com/) _(If the app fails to load, it may be due to cold start delays on Render)_

## Test Accounts

Use these accounts to quickly test the application with different user roles:

| Role | Email | Password |
|------|-------|----------|
| 👑 **Admin** | admin@timeless.com | Admin123 |
| 👤 **Customer** | customer@example.com | TestUser |

---

## Overview

The **Timeless Watch Rental Frontend** is a modern, scalable React application that offers a smooth user interface for browsing luxury watches, managing rentals, and securely interacting with a backend API. It is built using React 19 and Vite 6 for high performance and rapid development.

---

## Technologies Used (Frontend)

### Core Dependencies

The frontend relies on modern industry-standard tools for component-based UI development and user interaction.

**React (v19)** is a declarative, component-based JavaScript library developed by Meta (Facebook) and widely used across the tech industry. It is known for its virtual DOM and performance optimizations. React's industry relevance is significant, with companies like Airbnb, Netflix, and Instagram using it in production.

- **Purpose in this project**: Core library for building reusable UI components.
- **Alternatives Comparison**:
  - **Vue.js**: Simpler learning curve and smaller size but less ecosystem maturity.
  - **Svelte**: Compiles away the framework, resulting in leaner bundles, but has a smaller community.
  - **Angular**: More opinionated and suited to enterprise-level applications, but heavier and more complex.
- **License**: MIT License — permissive for commercial and personal use.

**React DOM** is used to interact with the browser DOM, mounting components and updating them efficiently.

**React Router DOM (v7)** enables client-side routing, essential for single-page applications. It supports dynamic route parameters, protected routes, and nested layouts.

- **Purpose in this project**: Handles navigation between pages such as home, login, profile, and admin dashboard.
- **Alternatives Comparison**:
  - **Wouter**: Lightweight alternative but lacks full features.
  - **Reach Router**: Easier to use, but no longer actively maintained.
- **License**: MIT License.

**PropTypes** is a runtime type-checking utility for React props.

- **Purpose**: Validates component props to prevent unintended data types.
- **Alternative**: **TypeScript**, which offers static typing and IDE support but increases complexity.
- **Industry Relevance**: Still used in many non-TypeScript projects for basic safety.
- **License**: MIT.

**Lucide React** provides icon components based on SVGs.

- **Purpose**: Delivers scalable and customizable icons.
- **Alternatives**:
  - **React Icons**: Broader icon set from multiple sources.
  - **Heroicons**: Tailwind-first icons but limited styles.
- **Industry Relevance**: Gaining popularity as a well-maintained Feather icons successor.
- **License**: ISC License — similar to MIT.

### Development Dependencies

**Vite (v6)** is a fast modern build tool created by Evan You (Vue.js creator). It uses native ES modules in development and Rollup for production.

- **Purpose**: Enables lightning-fast development startup, live reloading, and optimized builds.
- **Alternatives**:
  - **Webpack**: More mature and flexible but slower.
  - **Parcel**: Zero-config but slower rebuilds.
- **Industry Relevance**: Rapidly becoming the de-facto choice for React, Vue, and Svelte apps.
- **License**: MIT.

**@vitejs/plugin-react** integrates React-specific optimizations into the Vite workflow.

- **Purpose**: Enables JSX, Fast Refresh, and development tools.
- **Alternatives**: Manually configuring Babel, which is less efficient.
- **License**: MIT.

**ESLint** and its suite of plugins enforce code quality.

- **Purpose**: Automatically detect and report code issues during development.
- **Industry Relevance**: ESLint is the industry standard for JavaScript linting.
- **Alternatives**:
  - **JSHint**: Legacy tool, less powerful.
  - **StandardJS**: Zero-config, but less customizable.
- **License**: MIT.

**Airbnb Style Guide** (`eslint-config-airbnb`) is a popular, opinionated JavaScript style guide.

- **Purpose**: Defines strict rules for clean, maintainable code.
- **Industry Relevance**: Used by large tech teams and respected in the community.
- **Alternatives**:
  - **Google Style Guide**: More strict.
  - **XO**: Extremely opinionated and simpler.
- **License**: MIT.

**ESLint Plugins**:
- `eslint-plugin-react`, `react-hooks`, `import`, `jsx-a11y`, `prettier`, `react-refresh`
- These plugins provide React-specific linting, import/export validation, accessibility suggestions, and Prettier integration.
- **Purpose**: Helps catch bad practices and enforce consistent codebase.
- **Industry Relevance**: Commonly used together with React projects.
- **License**: All are MIT.

**Prettier** (via plugin) auto-formats code according to configured rules.

- **Purpose**: Maintains consistent formatting across contributors.
- **Industry Relevance**: Widely used in both frontend and backend JavaScript ecosystems.
- **Alternatives**: ESLint-only formatting (less consistent), `beautify` (legacy).
- **License**: MIT.

**Vitest (v3)** is a fast unit test runner optimized for Vite.

- **Purpose**: Runs test suites quickly with native ES module support.
- **Alternatives**:
  - **Jest**: Feature-rich but slower.
  - **Mocha**: Requires additional config.
- **Industry Relevance**: Gaining popularity for frontend projects using Vite.
- **License**: MIT.

**Testing Library** tools:

- `@testing-library/react`, `jest-dom`, and `user-event` simulate realistic user interaction.
- **Purpose**: Promote tests that reflect how users interact with the app.
- **Alternatives**:
  - **Enzyme**: Provides more control over shallow rendering and component internals but is considered outdated and no longer actively maintained for newer versions of React.
  - **Playwright**: End-to-end testing with real browser but more setup.
- **Industry Relevance**: Encouraged by React core team.
- **License**: MIT.

**jsdom** simulates a DOM in Node.js for running tests.

- **Purpose**: Enables DOM testing without a browser, making it suitable for headless environments and CI pipelines.
- **Alternatives**: 
  - **happy-dom**: Lightweight and faster than jsdom, but less mature and lacks full API support.
  - **Puppeteer**: Uses a real browser (Chrome/Chromium) for more accurate rendering; better for E2E tests.
  - **Linkedom**: Fast and resource-efficient, but limited in complex DOM API support.
- **Industry Relevance**: jsdom remains the standard for React test environments in Node.js.
- **License**: MIT


### Dependency Management

The project uses **npm** for installing and managing JavaScript dependencies. All packages are version-pinned in `package.json` to ensure consistent builds across environments.

- **Purpose**: Handles installation, script running, and dependency resolution.
- **Alternatives Comparison**:
  - **Yarn**: Faster install speed, workspace support.
  - **pnpm**: Efficient disk usage with symlinked modules.
  - **Bun**: Extremely fast, newer but less stable.
- **Industry Relevance**: npm is bundled with Node.js and remains the most widely used package manager.
- **License**: npm CLI is open source under the Artistic License 2.0.

---

## Hardware Requirements

### 1. Development Environment (Local Machine)

To support local development with modern tooling like React and Vite, the following specifications are recommended:

* **Operating System**:
  * **Chosen Technology**: Windows, macOS, or Linux
  * **Purpose**: Provides the foundation for running development tools and services
  * **Industry Relevance**: All three are widely used in professional frontend development
  * **Alternatives Comparison**:
    * **Windows**: Greatest market share and tool compatibility but sometimes requires workarounds for certain npm packages
    * **macOS**: Preferred by many frontend developers for its Unix-based terminal and optimized developer experience
    * **Linux**: Most efficient resource usage and closest to production containers but steeper learning curve
  * **License**: Various (Windows is proprietary, macOS is proprietary, Linux is open-source under GPL)

* **Processor**: 
  * **Chosen Technology**: Intel Core i5 / AMD Ryzen 5 or higher
  * **Purpose**: Ensures fast compilation, hot module replacement, and smooth development experience
  * **Industry Relevance**: Standard specification for modern frontend development workstations
  * **Alternatives Comparison**:
    * **Intel Core i3/AMD Ryzen 3**: Sufficient for basic development but slower build times
    * **ARM-based processors (M1/M2)**: Excellent performance/power ratio but occasional compatibility issues
  * **License**: Hardware components with manufacturer warranties

* **Memory (RAM)**: 
  * **Chosen Technology**: At least 8GB (16GB recommended)
  * **Purpose**: Allows running Vite dev server, browser, code editor, and dev tools concurrently
  * **Industry Relevance**: Standard memory configuration for frontend development
  * **Alternatives Comparison**:
    * **4GB**: Minimum viable but significant performance degradation with multiple tools
    * **32GB**: Future-proof but unnecessary cost for most frontend projects
  * **License**: Hardware components with manufacturer warranties

* **Storage**: 
  * **Chosen Technology**: At least 5GB free space (SSD preferred)
  * **Purpose**: Provides fast read/write access for code, dependencies, and build artifacts
  * **Industry Relevance**: SSDs are now standard for development environments
  * **Alternatives Comparison**:
    * **HDD**: Significantly slower npm installs and build times
    * **NVMe SSD**: Faster but marginal real-world benefit for frontend projects
  * **License**: Hardware components with manufacturer warranties

* **Browser**:

- **Chosen Technology**: Latest versions of Chrome, Firefox, or Edge
- **Purpose & Relevance**: These browsers are essential for testing and debugging modern web applications, with Chrome being the industry standard due to its robust DevTools. The React Developer Tools Chrome extension enhances this by allowing inspection of the React component tree, real-time props/state monitoring, and performance profiling.
- **Alternatives Comparison**:
  - **Firefox**: Strong privacy features and excellent CSS tools; also supports React Developer Tools.
  - **Safari**: Essential for testing on WebKit but has limited developer tooling and lacks support for some React extensions.
  - **Edge**: Chromium-based and fully supports Chrome extensions, including React Developer Tools.
- **License**: Free to use (Chrome and Edge are proprietary, Firefox is open-source under MPL)


### 2. Production Environment

Deployment is handled through static site hosts:

* **Netlify (Free Tier)**
  * **Purpose**: Hosts the compiled React application with global CDN distribution
  * **Industry Relevance**: Netlify is a leading static deployment provider used by many frontend teams and startups
  * **Alternatives Comparison**:
    * **Vercel**: Tailored for Next.js but great for React too
    * **Render (Static Sites)**: Especially useful if backend is also hosted on Render
    * **GitHub Pages**: Easy to configure but lacks CI/CD features
  * **License**: Netlify's platform is proprietary, but free-tier projects remain free for open/public use

---

## Coding Style Guide and Conventions

This project adheres to the **Airbnb JavaScript + React Style Guide**, integrated with **ESLint** and **Prettier** for real-time linting and formatting enforcement.

### ESLint Configuration

- ESLint v8 with Airbnb config, plugins for:
  - `react`, `react-hooks`, `jsx-a11y`, `import`, `react-refresh`
- Linting rules extend:
  - `airbnb`, `plugin:react/recommended`, `plugin:jsx-a11y/recommended`, `plugin:react-hooks/recommended`
- Custom rule overrides for project preferences:
  ```js
  'react/react-in-jsx-scope': 'off',
  'prettier/prettier': ['error', { singleQuote: true, trailingComma: 'es5' }],
  'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
  ```

### Prettier Formatting

Integrated via `eslint-plugin-prettier`:
- **Single quotes**
- **Trailing commas (ES5)**
- **2-space indentation**
- **Max line width: 80**

### Editor Setup

- VS Code recommended with:
  - ESLint extension
  - Prettier extension
  - Auto format on save enabled
- Benefits:
  - Real-time linting and formatting
  - Immediate feedback during development

---

## Project Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/timeless-front-end.git
cd timeless-front-end
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
> This will start the Vite dev server at `http://localhost:5173` with hot module reloading enabled.

### 4. Run Tests
```bash
npm run test
```

### 5. Running Tests
```bash
npm run test
```
> This will run all tests using Vitest.

For running specific test files:
```bash
npm run test -- src/tests/path/to/test/file.test.jsx
```

The frontend implements comprehensive testing using:
* **Component Testing**: Verifies individual UI components render and behave correctly
* **Integration Testing**: Tests interactions between components and with the backend API
* **User Event Testing**: Simulates user interactions like clicks, form inputs, and navigation

Testing examples:

1. **Component Testing**
```javascript
it('renders checkout page initially', async () => {
  renderWithAuth(<Checkout />, { isAuthenticated: true, user: {} });
  
  const checkoutHeading = await screen.findByRole('heading', {
    name: /checkout/i,
  });
  expect(checkoutHeading).toBeTruthy();
});
```

2. **Integration Testing**
```javascript
it('loads authentication state from localStorage on initialization', async () => {
  // Set mock localStorage with auth data
  localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthData));
  
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
  
  await waitFor(() => {
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
  });
});
```

3. **User Event Testing**
```javascript
it('switches between payment methods correctly', async () => {
  // Test setup...
  await screen.findByText(/payment method/i);
  
  const paypalOption = screen.getByLabelText(/PayPal/i);
  fireEvent.click(paypalOption);
  
  expect(screen.getByText(/you will be redirected to paypal/i)).toBeTruthy();
  expect(screen.queryByLabelText(/card number/i)).toBeNull();
});
```

#### Test Coverage
To generate and view test coverage reports:
```bash
npm run coverage
```

#### Testing Strategies
The frontend implements comprehensive testing using:

- **Component Testing**: Verifies individual UI components render and behave correctly
- **Integration Testing**: Tests interactions between components and with the backend API
- **User Event Testing**: Simulates user interactions like clicks, form inputs, and navigation

Key testing practices:
- Tests are organized alongside components in `__tests__` directories
- Mock service workers intercept API calls to simulate backend responses
- User-centric testing with React Testing Library focusing on accessibility and DOM elements

### 6. Build for Production
```bash
npm run build
```
> This will generate the optimized static site in the `dist/` directory.

### 7. Preview Production Build (Optional)
```bash
npm run preview
```
> Useful for local testing before deployment.

---

## Image Credits

The following images are used in the application with credits to their original sources:

| Watch Model | Image Source |
|-------------|--------------|
| Rolex Submariner | [Watchfinder & Co.](https://images.watchfinder.co.uk/imgv3/stock/317622/Rolex-Submariner-16800-317622-241128-165654.jpg) |
| Omega Speedmaster Moonwatch | [Monochrome Watches](https://monochrome-watches.com/wp-content/uploads/2021/01/2021-Omega-Speedmaster-Moonwatch-Professional-Master-Chronometer-Hesalite-textile-strap.jpg) |
| Tag Heuer Carrera Chronograph | [Watchfinder & Co.](https://images.watchfinder.co.uk/imgv3/stock/321130/TagHeuer-Carrera-CV2A1V.BA0738-321130-241121-135810.jpg) |

*All images remain the property of their respective copyright holders and are used for demonstration purposes only.*


# Trigger workflow