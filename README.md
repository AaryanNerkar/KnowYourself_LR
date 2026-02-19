# Know Yourself - Digital Consciousness Decoder

A sophisticated web application that uses a real-time Logistic Regression inference engine to analyze behavioral vectors and construct a high-fidelity psychological profile. The interface features a stunning 3D background and modern Glassmorphism UI.

![Project Preview](https://via.placeholder.com/800x400?text=Know+Yourself+App+Preview)

## 🚀 Features

- **Real-time Inference**: Runs Logistic Regression locally in the browser to predict personality archetypes based on 26 behavioral inputs.
- **Interactive 3D Background**: Immersive particle system powered by Three.js.
- **Modern UI/UX**: Premium Glassmorphism design with dynamic animations and gradients using Tailwind CSS.
- **Responsive Design**: Fully optimized for both Desktop (grid layout) and Mobile devices.
- **Privacy First**: All analysis happens client-side; no data is sent to external servers.

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) (via [Vite](https://vitejs.dev/))
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **3D Graphics**: [Three.js](https://threejs.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: JavaScript (ES6+)

## 📦 Installation & Setup

1.  **Clone the repository** (or unzip the project folder):
    ```bash
    git clone <repository-url>
    cd logistic-reg-1-know-yourself
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

4.  **Open in Browser**:
    Navigate to `http://localhost:5173` to view the application.

## 📂 Project Structure

```
src/
├── components/     # (Structure ready for modularization)
├── assets/         # Static assets
├── App.jsx         # Main application logic & UI
├── index.css       # Global styles & Tailwind imports
└── main.jsx        # Entry point
```

## 🧠 Model Details

The application uses a pre-trained Logistic Regression model structure with the following parameters hardcoded for demonstration:
- **Classes**: Analytical Introvert, Adaptive Ambivert, Dynamic Extrovert
- **Features**: 26 dimensions covering Social, Cognitive, Behavioral, and Lifestyle traits.

## 📝 License

This project is open-source and available for personal and educational use.
