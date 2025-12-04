import apiClient from './apiClient';

export interface CreatePaymentMethodDto {
  type: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: string;
  cardNumber?: string;
  expiryDate?: string;
  cardholderName?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

class PaymentMethodService {
  private baseUrl = '/payment/methods';

  async createPaymentMethod(dto: CreatePaymentMethodDto): Promise<PaymentMethod> {
    const response = await apiClient.request('post', this.baseUrl, dto);
    // apiClient.request already unwraps { data: ... }, so response is the PaymentMethod object
    return response;
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiClient.request('get', this.baseUrl);
    return response;
  }

  async getPaymentMethodById(id: string): Promise<PaymentMethod> {
    const response = await apiClient.request('get', `${this.baseUrl}/${id}`);
    return response;
  }

  async updatePaymentMethod(id: string, dto: Partial<CreatePaymentMethodDto>): Promise<PaymentMethod> {
    const response = await apiClient.request('put', `${this.baseUrl}/${id}`, dto);
    return response;
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await apiClient.request('delete', `${this.baseUrl}/${id}`);
  }

  async setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
    const response = await apiClient.request('put', `${this.baseUrl}/${id}/default`);
    return response;
  }
}

export const paymentMethodService = new PaymentMethodService();
