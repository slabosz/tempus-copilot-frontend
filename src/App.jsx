import { useState, useEffect } from 'react';
import { fetchProviders, generatePitch } from './api'; 
import './App.css'; 

function App() {
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [copilotOutput, setCopilotOutput] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const data = await fetchProviders();
        if (data.success) {
          setProviders(data.providers);
        }
      } catch (error) {
        console.error("Error loading providers:", error);
      }
    };
    loadProviders();
  }, []);

  const handleSelectProvider = (provider) => {
    setSelectedProvider(provider);
    setCopilotOutput(null); 
  };

  const handleGenerate = async () => {
    if (!selectedProvider) return;
    
    setIsGenerating(true);
    try {
      const data = await generatePitch(selectedProvider.name, selectedProvider.crm_note);
      
      if (data.success) {
        setCopilotOutput(data.copilot_data); 
      }
    } catch (error) {
      console.error("Error generating pitch:", error);
      setCopilotOutput({ error: "Error generating insights. Please try again." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className="app-container" 
      style={{ 
        backgroundColor: '#f8f9fc',
        background: 'linear-gradient(135deg, #ffffff 0%, #eef2f9 100%)',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        color: '#2B2D32'
      }}
    >
      
      {/* LEFT SIDEBAR: Ranked Provider List */}
      <div 
        className="sidebar" 
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.6)', 
          backdropFilter: 'blur(10px)',
          padding: '2rem 1.5rem', 
          boxShadow: '2px 0 20px rgba(0,0,0,0.02)'
        }}
      >
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1A1C21', marginBottom: '1.5rem', letterSpacing: '0.5px' }}>
          Tempus Targets
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {providers.map((provider, index) => {
            const isSelected = selectedProvider?.id === provider.id;
            return (
              <div 
                key={provider.id} 
                onClick={() => handleSelectProvider(provider)}
                style={{
                  padding: '16px', 
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#ffffff' : 'transparent',
                  borderRadius: '16px',
                  boxShadow: isSelected ? '0 10px 30px rgba(38, 99, 246, 0.1)' : 'none',
                  border: isSelected ? '1px solid rgba(38, 99, 246, 0.1)' : '1px solid transparent',
                  transition: 'all 0.2s ease-in-out',
                  transform: isSelected ? 'translateY(-2px)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 600, color: isSelected ? '#2663F6' : '#2B2D32', paddingRight: '10px' }}>
                    #{index + 1} {provider.name}
                  </h3>
                  
                  {/* Only render the badge if a score exists */}
                  {provider.impact_score !== undefined && provider.impact_score > 0 && (
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold', 
                      backgroundColor: isSelected ? '#2663F6' : '#EEF2F9', 
                      color: isSelected ? 'white' : '#2663F6', 
                      padding: '4px 8px', 
                      borderRadius: '999px',
                      whiteSpace: 'nowrap'
                    }}>
                      {Math.round(provider.impact_score)}%
                    </span>
                  )}
                </div>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#666' }}>
                  <strong>Volume:</strong> {provider.patient_population} pts/mo
                </p>
                <p style={{ margin: '0', fontSize: '0.85rem', color: '#666' }}>
                  <strong>Specialty:</strong> {provider.specialty}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN PANEL: Details and Copilot Generation */}
      <div className="main-panel">
        {selectedProvider ? (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
              <h1 className="provider-name" style={{ margin: 0, fontWeight: 300, color: '#1A1C21', letterSpacing: '-0.5px' }}>
                {selectedProvider.name}
              </h1>
              
              {selectedProvider.impact_score > 0 && (
                <span style={{ 
                  fontSize: '1rem', 
                  fontWeight: '600', 
                  backgroundColor: '#EEF2F9', 
                  color: '#2663F6', 
                  padding: '6px 16px', 
                  borderRadius: '999px',
                  border: '1px solid rgba(38, 99, 246, 0.15)'
                }}>
                  {Math.round(selectedProvider.impact_score)}% Match
                </span>
              )}
            </div>
            <h2 className="hospital-name" style={{ color: '#666', fontWeight: 400, marginTop: '-10px', marginBottom: '1rem' }}>
              {selectedProvider.hospital}
            </h2>
            <h3 className="specialty" style={{ color: '#666', fontWeight: 400, marginTop: '-10px', marginBottom: '2rem' }}>
              {selectedProvider.specialty}&nbsp; | &nbsp;{selectedProvider.patient_population} pts/mo
            </h3>
            
            <div className="crm-section" style={{ 
              backgroundColor: '#ffffff', 
              padding: '1.5rem 2rem', 
              borderRadius: '20px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.02)'
            }}>
              <h3 style={{ marginTop: 0, fontSize: '0.9rem', textTransform: 'uppercase', color: '#888', letterSpacing: '1px' }}>
                Latest CRM Note
              </h3>
              <p style={{ marginBottom: 0, color: '#444', lineHeight: '1.6', fontSize: '1.05rem' }}>
                {selectedProvider.crm_note}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                style={{ 
                  marginTop: '2.5rem', 
                  padding: '14px 32px', 
                  fontSize: '1rem', 
                  fontWeight: 600,
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  backgroundColor: isGenerating ? '#A0B6F9' : '#2663F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '999px',
                  boxShadow: isGenerating ? 'none' : '0 8px 25px rgba(38, 99, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isGenerating ? 'Synthesizing...' : 'Generate AI Insights'}
              </button>
            </div>

            {/* COPILOT OUTPUT */}
            {copilotOutput && !copilotOutput.error && (
              <div className="output-section" style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                <div className="output-card" style={{ padding: '1.5rem 2rem', backgroundColor: '#ffffff', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#f5a623', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
                    Known Concern
                  </h4>
                  <p style={{ margin: 0, color: '#333', lineHeight: '1.6' }}>{copilotOutput.known_concern}</p>
                </div>
                
                <div className="output-card" style={{ padding: '1.5rem 2rem', backgroundColor: '#ffffff', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#00C896', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
                    Objection Handler
                  </h4>
                  <p style={{ margin: 0, color: '#333', lineHeight: '1.6' }}>{copilotOutput.objection_response}</p>
                </div>

                <div className="output-card" style={{ padding: '2rem', backgroundColor: '#ffffff', borderRadius: '24px', boxShadow: '0 15px 50px rgba(38, 99, 246, 0.08)', border: '1px solid rgba(38, 99, 246, 0.1)' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#2663F6', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>
                    30-Second Meeting Script
                  </h4>
                  <p style={{ margin: 0, color: '#1A1C21', fontSize: '1.15rem', lineHeight: '1.7', fontWeight: 400 }}>
                    {copilotOutput.elevator_pitch}
                  </p>
                </div>

              </div>
            )}
            
            {copilotOutput && copilotOutput.error && (
               <div style={{ marginTop: '2rem', padding: '1.5rem', color: '#D32F2F', backgroundColor: '#FFEBEE', borderRadius: '16px', fontWeight: 500 }}>
                 {copilotOutput.error}
               </div>
            )}
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A0AAB5' }}>
            <h2 className="placeholder-text" style={{ fontWeight: 300 }}>Select a provider to begin preparation.</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;