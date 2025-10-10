import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface SellerReviewProps {
  sellerId: number;
}

const SellerReview: React.FC<SellerReviewProps> = ({ sellerId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem(`sellerReviews_${sellerId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const buyer = localStorage.getItem('userName') || 'Buyer';
    const newReview = { id: Date.now(), user: buyer, rating, comment };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(`sellerReviews_${sellerId}`, JSON.stringify(updated));
    setSuccess(true);
    setRating(0);
    setComment('');
    setTimeout(() => setSuccess(false), 1200);
  };

  return (
    <div className="mb-8">
      <h3 className="font-semibold text-gray-800 mb-2">Đánh giá & nhận xét Seller</h3>
      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <div className="flex items-center mb-2">
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <Star className={`w-6 h-6 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>
        <textarea
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          value={comment}
          onChange={e => setComment(e.target.value)}
          required
          rows={2}
          placeholder="Nhận xét về Seller..."
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700"
        >Gửi đánh giá</button>
        {success && <div className="text-green-600 text-sm mt-2">Đã gửi đánh giá!</div>}
      </form>
      <div className="space-y-3">
        {reviews.map((r: any) => (
          <div key={r.id} className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-center mb-1">
              <span className="font-medium text-gray-900 mr-2">{r.user}</span>
              <span className="flex items-center text-yellow-500">
                {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-4 h-4" />)}
              </span>
            </div>
            <div className="text-gray-700 text-sm">{r.comment}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerReview;
