import axiosClient from './axiosClient';

/**
 * UpdateBuyerProfileDto - matches backend DTO (PascalCase)
 * Backend expects: Name, CompanyName, Country, Phone
 */
export interface UpdateBuyerProfileDto {
  Name: string;              // Backend expects PascalCase
  CompanyName?: string;
  Country?: string;
  Phone?: string;
}

/**
 * Buyer Profile Response - matches backend BuyerProfileDto
 * Backend returns: Name, CompanyName, Country, Phone (all from BuyerProfile table)
 * Email comes from User table (retrieved separately via auth service)
 */
export interface BuyerProfileResponse {
  name: string;              // Backend: Name (PascalCase)
  companyName?: string;      // Backend: CompanyName (PascalCase)
  country?: string;          // Backend: Country (PascalCase)
  phone?: string;            // Backend: Phone (PascalCase)
}

/**
 * BuyerService - refactored to use axiosClient
 * All logging, token injection, and error handling now handled by axiosClient interceptors
 */
class BuyerService {
  /**
   * Update buyer profile
   * @param dto UpdateBuyerProfileDto
   * @returns Promise<BuyerProfileResponse>
   */
  async updateProfile(dto: UpdateBuyerProfileDto): Promise<BuyerProfileResponse> {
    // Wrap DTO in ProfileData object as required by backend
    const request = {
      ProfileData: dto
    };
    
    // axiosClient returns full response object: { data: { success, data: {...}, message } }
    const response = await axiosClient.put('/profile/buyer', request);
    
    // Backend returns: { success: true, data: { name, companyName, country, phone }, message }
    // Backend uses camelCase JSON serializer
    const backendData = response.data.data;
    return {
      name: backendData.name || '',
      companyName: backendData.companyName || '',
      country: backendData.country || '',
      phone: backendData.phone || ''
    };
  }

  /**
   * Get buyer profile
   * @returns Promise<BuyerProfileResponse>
   */
  async getProfile(): Promise<BuyerProfileResponse> {
    console.log('🔍 buyerService: Calling GET /profile/buyer...');
    
    // axiosClient returns full response object: { data: { success, data: {...}, message } }
    const response = await axiosClient.get('/profile/buyer');
    
    console.log('📦 buyerService: Full response:', response);
    console.log('📦 buyerService: response.data:', response.data);
    console.log('📦 buyerService: response.data.data:', response.data.data);
    
    // Backend returns: { success: true, data: { name, companyName, country, phone }, message }
    // Backend uses camelCase JSON serializer
    const backendData = response.data.data;
    
    console.log('📦 buyerService: backendData:', backendData);
    console.log('📦 buyerService: backendData.name:', backendData?.name);
    console.log('📦 buyerService: backendData.Name:', backendData?.Name);
    
    const result = {
      name: backendData?.name || backendData?.Name || '',
      companyName: backendData?.companyName || backendData?.CompanyName || '',
      country: backendData?.country || backendData?.Country || '',
      phone: backendData?.phone || backendData?.Phone || ''
    };
    
    console.log('✅ buyerService: Returning result:', result);
    
    return result;
  }
}

export const buyerService = new BuyerService();
