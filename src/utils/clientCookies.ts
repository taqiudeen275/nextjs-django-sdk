// clientCookies.ts
'use client';

import Cookies from 'js-cookie';

export const getClientCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

export const setClientCookie = (name: string, value: string, maxAge?: number): void => {
  Cookies.set(name, value, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: maxAge ? new Date(Date.now() + maxAge * 1000) : undefined
  });
};

export const deleteClientCookie = (name: string): void => {
  Cookies.remove(name, {
    path: '/'
  });
};