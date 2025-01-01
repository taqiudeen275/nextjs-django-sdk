"use server"
import { cookies } from 'next/headers';

export const getCookie = async (name: string) => {
  return (await cookies()).get(name)?.value;
};

export const setCookie = async (name: string, value: string, maxAge?: number) => {
  (await cookies()).set({
    name: name,
    value: value,
    httpOnly: true,
    path: '/',
    maxAge: maxAge || 60 * 60 * 24 * 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};

export const deleteCookie = async (name: string) => {
  (await cookies()).delete(name);
};