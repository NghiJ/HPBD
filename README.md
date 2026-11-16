# 🎀 Birthday Surprise – A Little Gift for You (18.11) 💕

Website chúc mừng sinh nhật tương tác ngọt ngào, lãng mạn dành riêng cho ngày 18/11 với tone màu hồng pastel xinh xắn.

## ✨ Tính Năng Nổi Bật

1. **Birthday Welcome Screen**: Màn hình chào mừng với huy hiệu nơ hồng, hộp quà 3D hoạt hình và nút mở quà.
2. **Interactive 3D Cake**:
   - Bánh kem 3 tầng phủ dâu tây tươi và macaron.
   - 5 ngọn nến lung linh có khói bay khi thổi tắt.
   - Thổi nến bằng Microphone thực tế hoặc nút bấm tiện lợi.
   - Mưa pháo hoa confetti trái tim và thiệp chúc điều ước thành hiện thực.
3. **Polaroid Scrapbook Gallery**: 6 bức ảnh kỷ niệm vintage với washi tape, sticker gấu bông/nơ/dâu tây, xem phóng to và thả tim.
4. **Wax-Sealed Birthday Letter**: Phong bì niêm phong sáp vàng 18.11, mở phong bì xem lời chúc với hiệu ứng máy đánh chữ.
5. **Surprise Balloons Mini-Game**: Chùm bóng bay pastel thắt nơ, chạm nổ bóng để mở khóa những lời khen và lời chúc bí mật.
6. **Background Music Box**: Hộp nhạc đĩa than retro chơi giai điệu du dương bằng Web Audio API không phụ thuộc mạng.

---

## 🚀 Hướng Dẫn Deploy Lên Vercel

Dự án đã được cấu hình sẵn sàng 100% cho Vercel với `vercel.json` và `vite.config.js`.

### Cách 1: Deploy qua GitHub (Khuyên dùng - Nhanh nhất)

1. **Commit và đẩy code lên GitHub**:
   ```bash
   git add .
   git commit -m "feat: Birthday Surprise Website ready for Vercel"
   git push origin main
   ```
2. **Mở Vercel**:
   - Truy cập [vercel.com](https://vercel.com) và đăng nhập.
   - Nhấn **"Add New..."** ➔ **"Project"**.
   - Chọn repository **`HPBD`** từ danh sách GitHub của bạn.
   - Vercel sẽ tự động nhận diện:
     - **Framework Preset**: `Vite`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Nhấn **Deploy**! Chỉ sau ~30 giây, website sẽ online với đường link domain miễn phí dạng `https://hpbd-*.vercel.app`.

---

### Cách 2: Deploy trực tiếp bằng Vercel CLI

Nếu bạn đã cài đặt Vercel CLI trên máy tính:
```bash
npx vercel
```
Chọn `Yes` cho các câu hỏi mặc định để deploy ngay lập tức!
