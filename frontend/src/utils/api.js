const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export async function fetchCertificates(studentAddress = null) {
  const url = studentAddress
    ? `${API_BASE_URL}/certificates?studentAddress=${studentAddress}`
    : `${API_BASE_URL}/certificates`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to fetch certificates');
  }
  const data = await response.json();
  return data;
}

export async function fetchCertificate(id) {
  const response = await fetch(`${API_BASE_URL}/certificates/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch certificate');
  }
  return response.json();
}

export async function createCertificate(certificateData) {
  const response = await fetch(`${API_BASE_URL}/certificates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(certificateData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create certificate');
  }
  
  return response.json();
}

export async function mintCertificate(id) {
  const response = await fetch(`${API_BASE_URL}/certificates/${id}/mint`, {
    method: 'PATCH',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to mint certificate');
  }
  
  return response.json();
}
