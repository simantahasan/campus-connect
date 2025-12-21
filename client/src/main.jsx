import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; 

// 🛡️ ERROR BOUNDARY COMPONENT
// This catches the crash and shows the red error box
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("CRITICAL ERROR:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#fff0f0', minHeight: '100vh' }}>
          <h1 style={{ color: '#d32f2f' }}>⚠️ The App Crashed</h1>
          <p style={{ fontSize: '18px' }}>Please copy the error below and share it:</p>
          
          <div style={{ background: '#ffebee', padding: '20px', borderRadius: '8px', border: '1px solid #ffcdd2', marginTop: '20px' }}>
            <code style={{ display: 'block', whiteSpace: 'pre-wrap', color: '#c62828', fontWeight: 'bold' }}>
              {this.state.error && this.state.error.toString()}
            </code>
          </div>
          
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            style={{ marginTop: '30px', padding: '12px 24px', background: '#333', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px'}}
          >
            Reset & Go to Login
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);