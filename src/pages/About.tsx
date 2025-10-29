import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">Về Fsourcing</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nền tảng kết nối doanh nghiệp hàng đầu Việt Nam
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-blue-600">Sứ mệnh của chúng tôi</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            Fsourcing là sàn giao dịch B2B toàn cầu kết nối người mua với các nhà cung cấp đã được xác minh. 
            Sứ mệnh của chúng tôi là làm cho việc tìm nguồn cung ứng trở nên đơn giản, minh bạch và đáng tin cậy 
            cho các doanh nghiệp trên toàn thế giới.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            Chúng tôi tin rằng mọi doanh nghiệp, dù lớn hay nhỏ, đều xứng đáng có được nguồn cung ứng chất lượng 
            với giá cả hợp lý và quy trình minh bạch.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-blue-600">Câu chuyện của chúng tôi</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            Được thành lập bởi các chuyên gia trong ngành với hơn 15 năm kinh nghiệm, Fsourcing ra đời từ nhu cầu 
            thực tế của thị trường - một nền tảng kết nối đáng tin cậy giữa người mua và nhà cung cấp.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            Chúng tôi kết hợp công nghệ hiện đại với mạng lưới toàn cầu để giúp doanh nghiệp tìm kiếm nhà cung cấp 
            và sản phẩm phù hợp một cách nhanh chóng, tiết kiệm thời gian và chi phí.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            Từ những ngày đầu khởi nghiệp đến nay, chúng tôi đã phục vụ hàng ngàn doanh nghiệp và tạo ra hàng triệu 
            giao dịch thành công trên nền tảng.
          </p>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-blue-600">Giá trị cốt lõi</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Minh bạch</h3>
              <p className="text-gray-700">
                Mọi thông tin về nhà cung cấp, sản phẩm và giá cả đều được công khai rõ ràng, 
                giúp người mua đưa ra quyết định sáng suốt.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Uy tín</h3>
              <p className="text-gray-700">
                Tất cả nhà cung cấp đều được xác minh và đánh giá kỹ lưỡng trước khi tham gia nền tảng, 
                đảm bảo chất lượng và độ tin cậy.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Hiệu quả</h3>
              <p className="text-gray-700">
                Công nghệ AI và hệ thống tự động giúp kết nối nhanh chóng, 
                tiết kiệm thời gian tìm kiếm và đàm phán cho cả hai bên.
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Hỗ trợ toàn diện</h3>
              <p className="text-gray-700">
                Đội ngũ chăm sóc khách hàng chuyên nghiệp sẵn sàng hỗ trợ 24/7, 
                đảm bảo mọi giao dịch diễn ra suôn sẻ.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-8 text-center">Thành tựu của chúng tôi</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Nhà cung cấp</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-blue-100">Người mua</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-blue-100">Giao dịch thành công</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Khách hàng hài lòng</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
