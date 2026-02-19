import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Проверяем, есть ли уже глобальное подключение. Если нет - создаем новое.
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

// В режиме разработки сохраняем подключение в глобальную переменную, 
// чтобы оно не стиралось при перезагрузке файлов
if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;