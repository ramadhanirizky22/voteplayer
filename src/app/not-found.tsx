import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
      <h1 className="text-6xl font-extrabold text-sky-600">404</h1>
      <h2 className="text-2xl font-bold">Halaman Tidak Ditemukan</h2>
      <p className="text-slate-600 dark:text-slate-400">
        Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center h-10 px-4 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
