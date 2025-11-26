import React, { useEffect } from 'react';
import { Star, TrendingUp, Users, Award, Quote } from 'lucide-react';

interface Story {
  id: number;
  companyName: string;
  industry: string;
  logo: string;
  testimonial: string;
  representative: string;
  position: string;
  metrics: {
    label: string;
    value: string;
  }[];
  image: string;
}

const SuccessStories: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const stories: Story[] = [
    {
      id: 1,
      companyName: 'Công ty TNHH Điện tử Việt Nam',
      industry: 'Điện tử - Công nghệ',
      logo: 'https://ui-avatars.com/api/?name=VE&background=0D8ABC&color=fff&size=100',
      testimonial: 'Fsourcing đã giúp chúng tôi kết nối với các nhà cung cấp linh kiện điện tử chất lượng cao từ Trung Quốc và Đài Loan. Chi phí nhập khẩu giảm 30% và thời gian giao hàng nhanh hơn 40%.',
      representative: 'Nguyễn Văn An',
      position: 'Giám đốc Mua hàng',
      metrics: [
        { label: 'Giảm chi phí', value: '30%' },
        { label: 'Tăng hiệu suất', value: '40%' },
        { label: 'Số nhà cung cấp', value: '15+' }
      ],
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=500&fit=crop'
    },
    {
      id: 2,
      companyName: 'Nhà máy May mặc Hồng Hà',
      industry: 'Dệt may - Thời trang',
      logo: 'https://ui-avatars.com/api/?name=HH&background=F59E0B&color=fff&size=100',
      testimonial: 'Nền tảng B2B của Fsourcing giúp chúng tôi tìm được nguồn vải chất lượng cao với giá cạnh tranh. Hệ thống quản lý đơn hàng rất tiện lợi, giúp chúng tôi theo dõi và kiểm soát dễ dàng.',
      representative: 'Trần Thị Bích',
      position: 'Trưởng phòng Kế hoạch',
      metrics: [
        { label: 'Tăng lợi nhuận', value: '25%' },
        { label: 'Giảm thời gian', value: '50%' },
        { label: 'Đơn hàng/tháng', value: '200+' }
      ],
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=500&fit=crop'
    },
    {
      id: 3,
      companyName: 'Tập đoàn Thực phẩm Á Châu',
      industry: 'Thực phẩm - Đồ uống',
      logo: 'https://ui-avatars.com/api/?name=AC&background=10B981&color=fff&size=100',
      testimonial: 'Chúng tôi đã mở rộng mạng lưới nhà cung cấp nguyên liệu thực phẩm trên toàn châu Á thông qua Fsourcing. Hệ thống xác minh nhà cung cấp rất chặt chẽ, đảm bảo chất lượng và an toàn thực phẩm.',
      representative: 'Lê Minh Tuấn',
      position: 'Phó Tổng Giám đốc',
      metrics: [
        { label: 'Mở rộng thị trường', value: '12 nước' },
        { label: 'Tăng doanh thu', value: '45%' },
        { label: 'Nhà cung cấp mới', value: '30+' }
      ],
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=500&fit=crop'
    },
    {
      id: 4,
      companyName: 'Công ty Cơ khí Chính xác Việt Tiến',
      industry: 'Cơ khí - Sản xuất',
      logo: 'https://ui-avatars.com/api/?name=VT&background=8B5CF6&color=fff&size=100',
      testimonial: 'Fsourcing không chỉ là nền tảng tìm kiếm nhà cung cấp mà còn là đối tác chiến lược của chúng tôi. Hệ thống RFQ giúp chúng tôi so sánh báo giá nhanh chóng và đưa ra quyết định tốt nhất.',
      representative: 'Phạm Đức Thắng',
      position: 'Giám đốc Vận hành',
      metrics: [
        { label: 'Tiết kiệm chi phí', value: '35%' },
        { label: 'Cải thiện chất lượng', value: '28%' },
        { label: 'RFQ/tháng', value: '50+' }
      ],
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=500&fit=crop'
    }
  ];

  const stats = [
    { icon: Users, label: 'Doanh nghiệp thành công', value: '5,000+' },
    { icon: TrendingUp, label: 'Tăng trưởng trung bình', value: '35%' },
    { icon: Award, label: 'Đối tác tin cậy', value: '10,000+' },
    { icon: Star, label: 'Đánh giá trung bình', value: '4.8/5' }
  ];

  return (
    <div className="min-h-screen bg-app font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Câu chuyện thành công
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Khám phá cách các doanh nghiệp đã chuyển đổi và phát triển nhờ nền tảng B2B của Fsourcing
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {stories.map((story, index) => (
              <div
                key={story.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                  index % 2 === 0 ? 'md:flex' : 'md:flex md:flex-row-reverse'
                }`}
              >
                {/* Image */}
                <div className="md:w-1/2">
                  <img
                    src={story.image}
                    alt={story.companyName}
                    className="w-full h-full object-cover min-h-[400px]"
                  />
                </div>

                {/* Content */}
                <div className="md:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center space-x-4 mb-6">
                    <img
                      src={story.logo}
                      alt={story.companyName}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{story.companyName}</h3>
                      <p className="text-gray-600">{story.industry}</p>
                    </div>
                  </div>

                  {/* Testimonial */}
                  <div className="mb-6">
                    <Quote className="w-10 h-10 text-blue-600 mb-4 opacity-50" />
                    <p className="text-lg text-gray-700 italic leading-relaxed">
                      "{story.testimonial}"
                    </p>
                  </div>

                  {/* Representative */}
                  <div className="mb-6">
                    <p className="font-semibold text-gray-900">{story.representative}</p>
                    <p className="text-gray-600 text-sm">{story.position}</p>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                    {story.metrics.map((metric, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{metric.value}</div>
                        <div className="text-sm text-gray-600 mt-1">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Sẵn sàng viết câu chuyện thành công của bạn?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Tham gia cùng hàng nghìn doanh nghiệp đã tin tưởng và phát triển cùng Fsourcing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Đăng ký ngay
            </a>
            <a
              href="/about"
              className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors border-2 border-white"
            >
              Tìm hiểu thêm
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SuccessStories;
