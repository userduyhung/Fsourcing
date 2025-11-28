/**
 * Gemini AI Service
 * Tích hợp Google Gemini API để tạo chatbot tư vấn khách hàng
 * 
 * Cách lấy API Key miễn phí:
 * 1. Truy cập: https://aistudio.google.com/app/apikey
 * 2. Đăng nhập bằng Google Account
 * 3. Click "Get API Key" → "Create API Key"
 * 4. Copy API Key và paste vào file .env
 * 
 * Giới hạn miễn phí:
 * - 60 requests/phút
 * - 1,500 requests/ngày
 * - 1 triệu tokens/phút
 */

// Cấu hình API
const GEMINI_CONFIG = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '', // Lấy từ .env
  model: 'gemini-1.5-flash', // Model miễn phí nhanh nhất
  apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
};

// Context về Fsourcing cho AI
const SYSTEM_CONTEXT = `
Bạn là trợ lý ảo của Fsourcing - nền tảng B2B thương mại điện tử Việt Nam.

THÔNG TIN VỀ FSOURCING:
- Nền tảng kết nối người mua (Buyer) và người bán (Seller)
- Các danh mục sản phẩm: Bia/nước giải khát, Bánh kẹo/trà/cà phê, Thực phẩm khô/gia vị, Chăm sóc cá nhân, Sữa
- Thanh toán: Chuyển khoản ngân hàng qua VietQR
- Phí giao hàng: TP.HCM miễn phí, Miền Nam 5,000đ, Miền Trung 7,000đ, Miền Bắc 10,000đ

CHỨC NĂNG CHÍNH:
- Buyer: Mua sắm sản phẩm, theo dõi đơn hàng, thanh toán online
- Seller: Đăng sản phẩm, quản lý đơn hàng, nhận thanh toán
- Admin: Quản lý user, duyệt seller, thống kê

NHIỆM VỤ CỦA BẠN:
1. Trả lời các câu hỏi về sản phẩm, giá cả, phí ship
2. Hướng dẫn đăng ký tài khoản Buyer/Seller
3. Giải thích quy trình mua hàng và thanh toán
4. Hỗ trợ khách hàng giải quyết thắc mắc

YÊU CẦU:
- Trả lời ngắn gọn (2-3 câu), thân thiện, chuyên nghiệp
- Dùng tiếng Việt có dấu
- Nếu không biết, hãy đề xuất liên hệ hotline: 1900-xxxx
`;

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

/**
 * Gửi tin nhắn đến Gemini AI và nhận phản hồi
 */
export async function sendMessageToGemini(userMessage: string): Promise<{ success: boolean; message: string }> {
  try {
    // Kiểm tra API Key
    if (!GEMINI_CONFIG.apiKey) {
      return {
        success: false,
        message: '⚠️ API Key chưa được cấu hình. Vui lòng thêm VITE_GEMINI_API_KEY vào file .env'
      };
    }

    // Tạo prompt với context
    const fullPrompt = `${SYSTEM_CONTEXT}\n\nKhách hàng hỏi: ${userMessage}\n\nTrả lời:`;

    // Gọi API Gemini
    const response = await fetch(
      `${GEMINI_CONFIG.apiEndpoint}/${GEMINI_CONFIG.model}:generateContent?key=${GEMINI_CONFIG.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7, // Độ sáng tạo (0-1)
            maxOutputTokens: 200, // Giới hạn độ dài câu trả lời
            topP: 0.8,
            topK: 10
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API Error:', errorData);
      
      // Xử lý các lỗi phổ biến
      if (response.status === 400) {
        return { success: false, message: 'Yêu cầu không hợp lệ. Vui lòng thử lại.' };
      } else if (response.status === 429) {
        return { success: false, message: 'Đã vượt quá giới hạn yêu cầu. Vui lòng thử lại sau.' };
      } else if (response.status === 403) {
        return { success: false, message: 'API Key không hợp lệ hoặc đã bị vô hiệu hóa.' };
      }
      
      return { success: false, message: 'Không thể kết nối với trợ lý AI. Vui lòng thử lại sau.' };
    }

    const data: GeminiResponse = await response.json();

    // Kiểm tra response có hợp lệ
    if (!data.candidates || data.candidates.length === 0) {
      return { success: false, message: 'Xin lỗi, tôi không thể trả lời câu hỏi này.' };
    }

    const aiMessage = data.candidates[0].content.parts[0].text;

    return {
      success: true,
      message: aiMessage.trim()
    };

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      success: false,
      message: 'Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.'
    };
  }
}

/**
 * Kiểm tra xem Gemini service đã được cấu hình chưa
 */
export function isGeminiConfigured(): boolean {
  return !!GEMINI_CONFIG.apiKey && GEMINI_CONFIG.apiKey.length > 0;
}

/**
 * Lấy thông tin cấu hình hiện tại (dùng cho debug)
 */
export function getGeminiConfig() {
  return {
    isConfigured: isGeminiConfigured(),
    model: GEMINI_CONFIG.model,
    hasApiKey: !!GEMINI_CONFIG.apiKey
  };
}
