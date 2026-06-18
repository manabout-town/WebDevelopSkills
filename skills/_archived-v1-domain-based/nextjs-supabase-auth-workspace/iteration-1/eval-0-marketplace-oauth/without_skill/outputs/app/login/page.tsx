import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { signInWithEmail } from "@/lib/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold">로그인</h1>
        <p className="mt-1 text-sm text-gray-500">
          중고 거래 플랫폼에 다시 오신 것을 환영합니다.
        </p>
      </div>

      <GoogleSignInButton next={redirectTo} />

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        또는
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <AuthForm mode="login" action={signInWithEmail} />

      <p className="text-center text-sm text-gray-500">
        아직 계정이 없으신가요?{" "}
        <Link href="/signup" className="font-medium text-black underline">
          회원가입
        </Link>
      </p>
    </main>
  );
}
