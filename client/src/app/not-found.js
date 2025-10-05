// src/app/not-found.js
export default function NotFound() {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6">
          <h1 className="text-6xl font-bold mb-4">404</h1>
          <p className="text-lg mb-6">الصفحة اللي كتقلب عليها ما موجوداش.</p>
          <a
            href="/"
            className="inline-block px-5 py-2 rounded shadow hover:opacity-90 border"
          >
            الرجوع للصفحة الرئيسية
          </a>
        </div>
      </body>
    </html>
  );
}
