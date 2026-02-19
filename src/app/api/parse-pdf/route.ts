import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import os from 'os';

// Инициализируем нейросеть и файловый менеджер
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  let tempFilePath = '';

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });

    // 1. Сохраняем файл во временную папку сервера (требование Google File API)
    const buffer = Buffer.from(await file.arrayBuffer());
    // Создаем уникальное имя, чтобы файлы не склеились
    tempFilePath = path.join(os.tmpdir(), `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`);
    await writeFile(tempFilePath, buffer);

    // 2. Загружаем PDF в облако Google Gemini
    const uploadResponse = await fileManager.uploadFile(tempFilePath, {
      mimeType: 'application/pdf',
      displayName: file.name,
    });

    // 3. Подключаем модель (flash отлично и быстро справляется с документами)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Промпт для извлечения данных
    const prompt = `Ты HR-ассистент в ТОО «Астана-Зеленстрой». Прочитай этот отсканированный приказ и извлеки из него данные строго в формате JSON.
    Поля JSON:
    - orderNumber (строка, только номер приказа, например "45-К" или "12")
    - orderDate (строка, формат СТРОГО YYYY-MM-DD. Если дата 15 февраля 2026, верни "2026-02-15")
    - type (строка, выбери одно максимально подходящее из: "Отпуск", "Прием на работу", "Увольнение", "Командировка", "Основная деятельность")
    - employeeName (строка, ФИО полностью, если есть, иначе null)
    - description (строка, краткая суть приказа, 1-2 предложения)
    - basis (строка, основание, например "Личное заявление...", если есть, иначе null)
    
    Верни ТОЛЬКО чистый JSON, без маркдауна, кавычек \`\`\`json и лишних слов.`;

    // 4. Отправляем запрос, передавая ссылку на загруженный файл
    const result = await model.generateContent([
      prompt,
      { fileData: { mimeType: uploadResponse.file.mimeType, fileUri: uploadResponse.file.uri } }
    ]);

    // 5. Удаляем временный файл с нашего сервера, чтобы не забивать память
    await unlink(tempFilePath).catch(() => {});

    // 6. Парсим ответ
    const text = result.response.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json(parsedData);

  } catch (error) {
    // В случае любой ошибки обязательно удаляем временный файл
    if (tempFilePath) await unlink(tempFilePath).catch(() => {});
    
    console.error("Ошибка ИИ:", error);
    return NextResponse.json({ error: 'Не удалось распознать документ' }, { status: 500 });
  }
}