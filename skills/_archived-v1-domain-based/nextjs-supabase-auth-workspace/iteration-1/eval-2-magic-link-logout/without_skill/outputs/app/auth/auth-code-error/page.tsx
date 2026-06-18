import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">로그인 링크가 만료되었거나 유효하지 않습니다</h1>
      <p className="text-sm text-gray-500">
        링크는 발송 후 일정 시간이 지나면 만료됩니다. 다시 로그인을 시도해주세요.
      </p>
      <Link href="/login" className="rounded-md bg-black px-4 py-2 text-sm text-white">
        로그인 페이지로 이동
      </Link>
    </div>
  );
}
