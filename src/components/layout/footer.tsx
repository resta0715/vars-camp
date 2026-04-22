import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                vars <span className="text-brand-600">camp</span>
              </span>
            </div>
            <p className="mt-3 max-w-md text-sm text-gray-500">
              美容室の経営を学ぶオンライン研修プラットフォーム。
              一流の講師陣から、経営・技術・集客のすべてを学べます。
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">サービス</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/schedule" className="text-sm text-gray-500 hover:text-brand-600">
                  研修スケジュール
                </Link>
              </li>
              <li>
                <Link href="/seminars" className="text-sm text-gray-500 hover:text-brand-600">
                  研修一覧
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-500 hover:text-brand-600">
                  料金プラン
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900">会社情報</h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-500 hover:text-brand-600">
                  vars について
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-brand-600">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-500 hover:text-brand-600">
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-center text-xs text-gray-400">
            &copy; {new Date().getFullYear()} vars inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
