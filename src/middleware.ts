import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Проверяем, есть ли у пользователя пропуск
  const authCookie = request.cookies.get('hr-auth-token');
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Если пропуска нет и он пытается зайти не на страницу логина -> гоним на логин
  if (!authCookie && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Если пропуск есть, но он зачем-то зашел на страницу логина -> пускаем сразу в архив
  if (authCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Указываем, какие страницы нужно защищать (защищаем ВСЁ, кроме системных файлов и картинок)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};