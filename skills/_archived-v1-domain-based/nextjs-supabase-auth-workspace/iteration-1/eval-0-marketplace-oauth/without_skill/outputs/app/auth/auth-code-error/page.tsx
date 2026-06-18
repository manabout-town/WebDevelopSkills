import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">로그인에 문제가 발생했어요</h1>
      <p className="text-sm text-gray-500">
        인증 코드가 만료되었거나 잘못되었습니다. 다시 로그인을 시도해 주세요.
      </p>
      <Link
        href="/login"
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        로그인 페이지로 돌아가기
      </Link>
    </main>
  );
}
