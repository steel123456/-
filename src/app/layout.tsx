import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';
import { UserProvider } from '@/contexts/UserContext';

export const metadata: Metadata = {
  title: {
    default: '蔡小作业平台',
    template: '%s | 蔡小作业平台',
  },
  description:
    '蔡小作业平台 - 智能作业管理与自动批改系统',
  keywords: [
    '作业平台',
    '在线作业',
    '自动批改',
    'AI判题',
    '教育平台',
  ],
  authors: [{ name: '蔡小作业平台' }],
  generator: 'Coze Code',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        <UserProvider>
          {isDev && <Inspector />}
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
