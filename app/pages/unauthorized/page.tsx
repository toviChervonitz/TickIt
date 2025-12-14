"use client";

import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-10 text-center max-w-md">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Unauthorized</h1>
        <p className="text-gray-700 mb-6">
          You do not have permission to view this page.
        </p>

        <Link
          href="/pages/login"
          className="inline-block bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}
