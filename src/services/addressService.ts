import apiClient from './apiClient';    

export interface CreateAddressDto {
  recipientName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface Address {
  id: string;
  recipientName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  userId: string;
}

class AddressService {
  private baseUrl = '/profile/addresses';

  async createAddress(dto: CreateAddressDto): Promise<Address> {
    const response = await apiClient.request('post', this.baseUrl, dto);
    // apiClient.request already unwraps { data: ... }, so response is the Address object
    return response;
  }

  async getAddresses(): Promise<Address[]> {
    const response = await apiClient.request('get', this.baseUrl);
    return response;
  }

  async getAddressById(id: string): Promise<Address> {
    const response = await apiClient.request('get', `${this.baseUrl}/${id}`);
    return response;
  }

  async updateAddress(id: string, dto: Partial<CreateAddressDto>): Promise<Address> {
    const response = await apiClient.request('put', `${this.baseUrl}/${id}`, dto);
    return response;
  }

  async deleteAddress(id: string): Promise<void> {
    await apiClient.request('delete', `${this.baseUrl}/${id}`);
  }

  async setDefaultAddress(id: string): Promise<Address> {
    const response = await apiClient.request('put', `${this.baseUrl}/${id}/default`);
    return response;
  }
}

export const addressService = new AddressService();
