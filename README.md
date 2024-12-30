# Next.js Django SDK

A comprehensive SDK for integrating Next.js 15+ applications with Django REST Framework backends using Simple JWT authentication. Built with TypeScript and featuring full support for React Server Components, Client Components, and SWR data fetching.

## Features

- 🔐 Built-in JWT authentication handling
- 🔄 Automatic token refresh
- 🎯 Server Component support
- ⚡ SWR integration for efficient data fetching
- 🔒 CSRF protection
- 🍪 Secure cookie handling
- 📱 TypeScript support
- 🚀 React Server Components & Server Actions ready
- 🎭 Built for Next.js 15+

## Installation

```bash
npm install nextjs-django-client
# or
yarn add nextjs-django-client
# or
pnpm add nextjs-django-client
```

## Quick Start

### 1. Set up the Provider

```typescript
// app/providers.tsx
'use client';

import { ApiProvider } from 'nextjs-django-client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApiProvider config={{
      baseUrl: process.env.NEXT_PUBLIC_API_URL!,
      // Optional configurations
      tokenPrefix: 'Bearer',
      accessTokenLifetime: 300, // 5 minutes
      refreshTokenLifetime: 86400, // 24 hours
      autoRefresh: true,
      csrfEnabled: true
    }}>
      {children}
    </ApiProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 2. Authentication in Client Components

```typescript
// app/components/LoginForm.tsx
'use client';

import { useAuth, useApiClient } from 'nextjs-django-client';

export function LoginForm() {
  const apiClient = useApiClient();
  const { login, isLoading, user } = useAuth(apiClient);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await login(
        formData.get('username') as string,
        formData.get('password') as string
      );
      // Redirect or handle success
    } catch (error) {
      // Handle error
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" required />
      <input name="password" type="password" required />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
```

### 3. Data Fetching with SWR

```typescript
// app/components/Posts.tsx
'use client';

import { useApi, useApiClient } from 'nextjs-django-client';

interface Post {
  id: number;
  title: string;
  content: string;
}

export function Posts() {
  const apiClient = useApiClient();
  const { data: posts, error, isLoading } = useApi<Post[]>('/api/posts/', apiClient);

  if (error) return <div>Failed to load posts</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {posts?.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
```

### 4. Server Component Usage

```typescript
// app/posts/page.tsx
import { createServerAction } from 'nextjs-django-client';

interface Post {
  id: number;
  title: string;
  content: string;
}

export default async function PostsPage() {
  const api = await createServerAction({
    baseUrl: process.env.API_URL!
  });

  try {
    const posts = await api.fetch<Post[]>('/api/posts/');
    
    return (
      <div>
        {posts.map(post => (
          <article key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </article>
        ))}
      </div>
    );
  } catch (error) {
    return <div>Failed to load posts</div>;
  }
}
```

## Advanced Usage

### Custom Hooks with SWR

```typescript
// hooks/usePosts.ts
'use client';

import { useApi, useApiClient } from 'nextjs-django-client';

export function usePosts(page = 1) {
  const apiClient = useApiClient();
  return useApi(`/api/posts/?page=${page}`, apiClient, {
    revalidateOnFocus: false,
    refreshInterval: 30000 // Refresh every 30 seconds
  });
}
```

### File Uploads

```typescript
// app/components/FileUpload.tsx
'use client';

import { useApiClient } from 'nextjs-django-client';

export function FileUpload() {
  const apiClient = useApiClient();

  async function handleUpload(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiClient.fetch('/api/upload/', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type, let the browser set it with the boundary
        },
      });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }

  return (
    <input 
      type="file" 
      onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} 
    />
  );
}
```

### Protected Routes

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export function middleware(request: NextRequest) {
  const accessToken = cookies().get('access_token');

  if (!accessToken && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard/:path*',
};
```

### Error Handling

```typescript
// utils/api-errors.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
  }
}

// Using with the SDK
try {
  const data = await apiClient.fetch('/api/protected-resource/');
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        // Handle unauthorized
        break;
      case 403:
        // Handle forbidden
        break;
      default:
        // Handle other errors
    }
  }
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| baseUrl | string | required | The base URL of your Django API |
| tokenPrefix | string | 'Bearer' | The prefix used in Authorization header |
| accessTokenLifetime | number | 300 | Access token lifetime in seconds |
| refreshTokenLifetime | number | 86400 | Refresh token lifetime in seconds |
| autoRefresh | boolean | true | Automatically refresh expired tokens |
| csrfEnabled | boolean | true | Enable CSRF protection |

## Django Backend Setup

Ensure your Django REST Framework backend is configured with Simple JWT:

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Your Next.js development server
    "https://your-production-domain.com",
]

CORS_ALLOW_CREDENTIALS = True
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

