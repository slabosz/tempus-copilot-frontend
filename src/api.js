const API_BASE_URL = 'http://localhost:5001/api';

export const fetchProviders = async () => {
  const response = await fetch(`${API_BASE_URL}/providers`);
  if (!response.ok) throw new Error('Failed to fetch providers');
  return response.json();
};

export const generatePitch = async (physicianName, crmNote) => {
  const response = await fetch(`${API_BASE_URL}/generate-pitch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ physician_name: physicianName, crm_note: crmNote }),
  });
  if (!response.ok) throw new Error('Failed to generate pitch');
  return response.json();
};