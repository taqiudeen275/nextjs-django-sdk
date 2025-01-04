
# Next.js Django Client SDK

A modern, type-safe SDK for integrating Next.js 15+ applications with Django REST Framework backends using Simple JWT authentication. Built specifically for the Next.js App Router with full support for React Server Components, Server Actions, and Client Components.

## Features

-   🔐 **Secure JWT Authentication:** Automatic token refresh and secure cookie handling using the `HttpOnly` flag.
-   🎯 **Full Server Component & Server Actions Support:** Seamlessly fetch data and perform actions on the server with reliable authentication.
-   ⚡ **Built-in SWR Data Fetching:** Leverage SWR's caching, revalidation, and performance benefits with TypeScript support.
-   🔒 **CSRF Protection:** Built-in protection against Cross-Site Request Forgery attacks.
-   🚀 **Optimized for Next.js 15+ App Router:** Designed to work efficiently with the latest Next.js features.
-   📱 **Type-Safe API:** Enjoy a robust development experience with full TypeScript support.
-   🔄 **Automatic Token Management:** Handles token storage, refresh, and expiration transparently.
-   🎭 **Flexible Data Fetching:** Supports both client-side and server-side data fetching patterns.
-   ⚙️ **Configurable:** Customize token lifetimes, security options, and API request behavior.

## Installation

Install the package using your preferred package manager:

```bash
npm install nextjs-django-client
# or
yarn add nextjs-django-client
# or
pnpm add nextjs-django-client
```

## Quick Start

### 1. Set up the ApiProvider

Wrap your application with the `ApiProvider` to configure the SDK and provide API client access to your components:

```typescript
// app/providers.tsx (Client Component)
'use client';

import { ApiProvider } from 'nextjs-django-client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApiProvider
      config={{
        baseUrl: process.env.NEXT_PUBLIC_API_URL!, // Your Django API base URL
        // Optional configurations:
        tokenPrefix: 'Bearer', // Default: 'Bearer'
        accessTokenLifetime: 300, // Default: 300 (5 minutes)
        refreshTokenLifetime: 86400, // Default: 86400 (24 hours)
        autoRefresh: true, // Default: true
        csrfEnabled: true, // Default: true
      }}
    >
      {children}
    </ApiProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({
  children,
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

### 2. Client-Side Authentication

Use the `useAuth` hook to handle user login, logout, and access user information in your Client Components:

```typescript
// app/components/LoginForm.tsx (Client Component)
'use client';

import { useAuth, useApiClient } from 'nextjs-django-client';

export function LoginForm() {
  const apiClient = useApiClient();
  const { login, isLoading, user } = useAuth(apiClient);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      await login(username, password);
      // Handle successful login (e.g., redirect to dashboard)
    } catch (error) {
      // Handle login error (e.g., display error message)
      if (error instanceof Error) {
        console.error('Login error:', error.message);
      }
    }
  }

  if (user) {
    return <div>Welcome, {user.username}!</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username</label>
        <input id="username" name="username" type="text" required />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### 3. Server-Side Data Fetching

Use `createServerAction` to create an API client instance for secure data fetching within Server Components or Server Actions. **Pass the `serverAccessToken` from `useAuth` to `createServerAction` for reliable authentication.**

```typescript
// app/posts/page.tsx (Server Component)
import { createServerAction, useAuth } from 'nextjs-django-client';

interface Post {
  id: number;
  title: string;
  content: string;
}

export default async function PostsPage() {
  const { serverAccessToken } = useAuth(null); // Get the server-side access token
  const api = await createServerAction(
      {
        baseUrl: process.env.API_URL!, // Your Django API base URL (can be different from client-side)
      },
      serverAccessToken
    );

  try {
    const posts = await api.fetch<Post[]>('/api/posts/');

    return (
      <div>
        <h1>Posts</h1>
        {posts.map((post) => (
          <article key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </article>
        ))}
      </div>
    );
  } catch (error) {
    return <div>Failed to load posts.</div>;
  }
}
```

### 4. Client-Side Data Fetching with SWR

Use the `useApi` hook to fetch data on the client-side with SWR's caching and revalidation features:

```typescript
// app/components/Posts.tsx (Client Component)
'use client';

import { useApi, useApiClient } from 'nextjs-django-client';

interface Post {
  id: number;
  title: string;
  content: string;
}

export function Posts() {
  const apiClient = useApiClient();
  const {
    data: posts,
    error,
    isLoading,
  } = useApi<Post[]>('/api/posts/', apiClient, {
    revalidateOnFocus: true,
    refreshInterval: 30000, // Refresh every 30 seconds (optional)
  });

  if (error) return <div>Failed to load posts.</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Posts</h1>
      {posts?.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
```

## CRUD Operations Examples

Here's how to perform basic CRUD (Create, Read, Update, Delete) operations using the SDK:

**Assumptions:**

*   You have a Django REST Framework API with a `Post` model and corresponding endpoints (`/api/posts/`, `/api/posts/<id>/`).
*   You have defined a `Post` interface in your Next.js application (as shown in previous examples).

### Create (Client-Side)

```typescript
// app/components/CreatePost.tsx (Client Component)
'use client';

import { useState } from 'react';
import { useApiClient } from 'nextjs-django-client';

interface Post {
  id: number;
  title: string;
  content: string;
}

export function CreatePost() {
  const apiClient = useApiClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const newPost = await apiClient.fetch<Post>('/api/posts/', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
      });

      // Handle successful creation (e.g., clear form, redirect, update UI)
      console.log('Post created:', newPost);
      setTitle('');
      setContent('');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div>Error: {error}</div>}
      <div>
        <label htmlFor="title">Title:</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="content">Content:</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
}
```

### Read (Server-Side)

(See the Server-Side Data Fetching example in the Quick Start section.)

### Read (Client-Side)

(See the Client-Side Data Fetching with SWR example in the Quick Start section.)

### Update (Client-Side)

```typescript
// app/components/EditPost.tsx (Client Component)
'use client';

import { useState, useEffect } from 'react';
import { useApi, useApiClient } from 'nextjs-django-client';
import { useParams } from 'next/navigation';

interface Post {
  id: number;
  title: string;
  content: string;
}

export function EditPost() {
  const apiClient = useApiClient();
  const { id } = useParams<{ id: string }>(); // Assuming you're using dynamic routing
  const { data: post, error, isLoading, mutate } = useApi<Post>(
    id ? `/api/posts/${id}/` : null,
    apiClient
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
    }
  }, [post]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);

    try {
      const updatedPost = await apiClient.fetch<Post>(`/api/posts/${id}/`, {
        method: 'PUT',
        body: JSON.stringify({ title, content }),
      });

      // Update the local data with SWR (optional)
      mutate(updatedPost);

      // Handle successful update (e.g., display success message)
      console.log('Post updated:', updatedPost);
    } catch (error) {
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError('An unexpected error occurred.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (error) return <div>Error loading post.</div>;
  if (isLoading) return <div>Loading...</div>;
  if (!post) return null;

  return (
    <form onSubmit={handleUpdate}>
      {saveError && <div>Error: {saveError}</div>}
      <div>
        <label htmlFor="title">Title:</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="content">Content:</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
```

### Delete (Client-Side)

```typescript
// app/components/DeletePost.tsx (Client Component)
'use client';

import { useApiClient } from 'nextjs-django-client';
import { useState } from 'react';

interface Post {
    id: number;
    title: string;
    content: string;
  }
  

export function DeletePost({ post, onDelete }: { post: Post, onDelete: (id: number) => void }) {
  const apiClient = useApiClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(true);

    try {
      await apiClient.fetch(`/api/posts/${post.id}/`, {
        method: 'DELETE',
      });

      // Handle successful deletion (e.g., update UI, remove post from list)
      onDelete(post.id); // Call a callback function to update the parent component
      console.log('Post deleted:', post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button onClick={handleDelete} disabled={isDeleting}>
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```

## Advanced Usage

### Protected API Routes with Middleware

Create a `middleware.ts` file to protect routes that require authentication. This example protects all routes under `/dashboard`:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export function middleware(request: NextRequest) {
  const accessToken = cookies().get('access_token')?.value;

  // Protect routes starting with /dashboard
  if (!accessToken && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Matcher config to apply the middleware to specific paths
export const config = {
  matcher: '/dashboard/:path*',
};
```

### File Uploads

Handle file uploads using `FormData` and the `apiClient`:

```typescript
// app/components/FileUpload.tsx (Client Component)
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
      });
      // Handle successful upload
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }

  return (
    <input
      type="file"
      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
    />
  );
}
```

### Custom API Hooks

Create reusable custom hooks to encapsulate API calls and SWR logic:

```typescript
// hooks/usePosts.ts (Client Hook)
'use client';

import { useApi, useApiClient } from 'nextjs-django-client';
import type { Post } from '@/types'; // Assuming you have a Post type defined

export function usePosts(page = 1) {
  const apiClient = useApiClient();
  return useApi<Post[]>(
    `/api/posts/?page=${page}`,
    apiClient,
    {
      revalidateOnFocus: false,
      refreshInterval: 30000,
    }
  );
}
```

## Configuration Options

The `ApiProvider` accepts the following configuration options:

| Option                 | Type      | Default     | Description                                                                                                |
| :--------------------- | :-------- | :---------- | :--------------------------------------------------------------------------------------------------------- |
| `baseUrl`              | `string`  | **Required** | The base URL of your Django API.                                                                        |
| `tokenPrefix`          | `string`  | `'Bearer'`  | The prefix used in the `Authorization` header when sending requests.                                    |
| `accessTokenLifetime`  | `number`  | `300`       | The lifetime of the access token in seconds (5 minutes).                                                |
| `refreshTokenLifetime` | `number`  | `86400`     | The lifetime of the refresh token in seconds (24 hours).                                               |
| `autoRefresh`          | `boolean` | `true`      | Whether to automatically refresh the access token when it expires using the refresh token.               |
| `csrfEnabled`          | `boolean` | `true`      | Whether to enable CSRF protection. If enabled, the SDK will send the `X-CSRFToken` header with requests. |

## Django Backend Configuration

Configure your Django REST Framework backend to use `SimpleJWT` for authentication and set up CORS to allow requests from your Next.js application:

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
    'ROTATE_REFRESH_TOKENS': True,  # Rotate refresh tokens on each refresh
    'BLACKLIST_AFTER_ROTATION': True, # Invalidate old refresh tokens
    'UPDATE_LAST_LOGIN': True, # Update the user's last_login field on successful login

    # Token Signing Key (Keep this secret!)
    'SIGNING_KEY': os.environ.get('SECRET_KEY'), # Fetch from environment variable

    # Token Type
    'AUTH_HEADER_TYPES': ('Bearer',), # Default
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',), # Default
    'TOKEN_TYPE_CLAIM': 'token_type', # Default

    # User ID Field and Claim
    'USER_ID_FIELD': 'id', # Default
    'USER_ID_CLAIM': 'user_id', # Default

    # JTI (JWT ID) Claim
    'JTI_CLAIM': 'jti', # Default

    # SLIDING_TOKEN_LIFETIME, SLIDING_TOKEN_REFRESH_LIFETIME
    # are deprecated in favor of ACCESS_TOKEN_LIFETIME and REFRESH_TOKEN_LIFETIME
}

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Your Next.js development server
    "https://your-nextjs-app.com", # Your production Next.js domain
]

CORS_ALLOW_CREDENTIALS = True # Allow cookies to be sent with cross-origin requests

# CSRF Settings (Recommended)
CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "https://your-nextjs-app.com",
]
```

**Important Security Notes (Django):**

*   **`SECRET_KEY`:** Store your Django `SECRET_KEY` securely as an environment variable and **never** commit it to your code repository.
*   **`ROTATE_REFRESH_TOKENS` and `BLACKLIST_AFTER_ROTATION`:** These settings are highly recommended to improve the security of your refresh tokens.
*   **HTTPS:** Always use HTTPS in production to protect data transmitted between the client and server.

## TypeScript Support

The `nextjs-django-client` package is fully typed. You can extend the base `User` type to match your Django user model:

```typescript
import type { User } from 'nextjs-django-client';

// Define your custom user properties
interface CustomUser extends User {
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
}

// Use your custom user type with useAuth
const { user } = useAuth<CustomUser>(apiClient);
```

## Error Handling

The SDK provides detailed error information through the `ApiError` class. Handle errors gracefully in your components:

```typescript
try {
  const data = await apiClient.fetch('/api/protected/');
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        // Handle 401 Unauthorized (e.g., redirect to login)
        console.error('Unauthorized:', error.message);
        break;
      case 403:
        // Handle 403 Forbidden (e.g., show access denied message)
        console.error('Forbidden:', error.message);
        break;
      case 404:
        // Handle 404 Not Found
        console.error('Not Found:', error.message);
        break;
      case 500:
        // Handle 500 Internal Server Error
        console.error('Server Error:', error.message);
        break;
      default:
        // Handle other API errors
        console.error('API Error:', error.message, error.details);
    }
  } else {
    // Handle non-API errors (e.g., network issues)
    console.error('An unexpected error occurred:', error);
  }
}
```

## Contributing

We welcome contributions! If you'd like to contribute to the project, please follow these steps:

1. **Fork** the repository.
2. Create a new branch for your feature or bug fix: `git checkout -b feature/my-new-feature` or `git checkout -b bugfix/fix-some-issue`
3. Make your changes and commit them with clear, descriptive commit messages.
4. **Write tests** to ensure your code works as expected and prevents regressions.
5. **Document** any new features or changes in the README.
6. Open a **Pull Request** against the `main` branch, describing your changes and why they are necessary.

For major changes or new features, please open an **Issue** first to discuss your ideas with the maintainers.

## Support

If you encounter any issues or have questions about the package, please feel free to open an issue on the [GitHub repository](https://github.com/taqiudeen275/nextjs-django-sdk). We appreciate your feedback!
