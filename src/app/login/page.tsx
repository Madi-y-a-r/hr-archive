'use client'

import { useState } from 'react';
import { login } from '@/app/actions';
import { Lock } from 'lucide-react';

export default function LoginPage() {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError('');
        try {
            await login(formData);
        } catch (e: any) {
            setError(e.message || 'Ошибка входа');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Шапка карточки логина */}
                <div className="bg-green-600 p-8 text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center text-green-600 font-black text-3xl shadow-lg mb-4">
                        АЗ
                    </div>
                    <h1 className="text-2xl font-bold text-white">Астана-Зеленстрой</h1>
                    <p className="text-green-100 mt-1">Электронный архив приказов</p>
                </div>

                {/* Форма */}
                <div className="p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                        <Lock size={20} className="text-gray-400" /> Авторизация
                    </h2>

                    <form action={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ключ доступа (Пароль)</label>
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="Введите пароль..."
                                className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition text-gray-900"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition shadow-md disabled:bg-green-400"
                        >
                            {loading ? 'Проверка...' : 'Войти в систему'}
                        </button>
                    </form>
                </div>

            </div>
            <p className="mt-8 text-gray-400 text-sm">© 2026 ТОО «Астана-Зеленстрой». Все права защищены.</p>
        </div>
    );
}