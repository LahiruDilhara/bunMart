import { api } from '@/service/api';

export async function debugApi(endpoint: string) {
  try {
    console.log(`🔍 Testing endpoint: ${endpoint}`);
    const response = await api.get(endpoint);
    
    console.log('✅ Response Status:', response.status);
    console.log('📦 Response Headers:', response.headers);
    console.log('📊 Response Data:', response.data);
    console.log('🔢 Is Array:', Array.isArray(response.data));
    console.log('📋 Type:', typeof response.data);
    
    if (Array.isArray(response.data)) {
      console.log('📏 Array Length:', response.data.length);
      if (response.data.length > 0) {
        console.log('📝 First Item:', response.data[0]);
      }
    } else if (response.data && typeof response.data === 'object') {
      console.log('🔑 Object Keys:', Object.keys(response.data));
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log('📦 Nested Array Length:', response.data.data.length);
      }
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('🔴 Response Error:', error.response.status, error.response.data);
    }
    throw error;
  }
}