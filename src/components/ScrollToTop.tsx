import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const scrollPositions = useRef<{ [path: string]: number }>({});
  const isPopState = useRef(false);

  useEffect(() => {
    // Lắng nghe sự kiện popstate (back/forward button)
    const handlePopState = () => {
      isPopState.current = true;
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (isPopState.current) {
      // Đang back/forward, khôi phục vị trí đã lưu
      isPopState.current = false;
      const savedPosition = scrollPositions.current[pathname];

      if (savedPosition !== undefined) {
        setTimeout(() => {
          window.scrollTo(0, savedPosition);
        }, 0);
      }
    } else {
      // Điều hướng bình thường, lưu vị trí hiện tại và scroll lên đầu
      const currentPath = window.location.pathname;
      scrollPositions.current[currentPath] = window.scrollY;
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  // Lưu vị trí scroll trước khi rời trang
  useEffect(() => {
    const handleBeforeUnload = () => {
      scrollPositions.current[pathname] = window.scrollY;
    };

    const handleScroll = () => {
      scrollPositions.current[pathname] = window.scrollY;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [pathname]);

  return null;
}
