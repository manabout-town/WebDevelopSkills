import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { signUpWithEmail } from "@/lib/actions/auth";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ "check-email"?: string }>;
}) {
  const { "check-email": checkEmail } = await searchParams;

  if (checkEmail) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-xl font-semibold">이메일을 확인해 주세요</h1>
        <p className="text-sm text-gray-500">
          가입을 완료하려면 보내드린 확인 메일의 링크를 클릭해 주세요.
        </p>
        <Link href="/login" className="text-sm font-medium underline">
          로그인 페이지로 이동
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold">회원가입</h1>
        <p className="mt-1 text-sm text-gray-500">
          가입 후 구매자 또는 판매자 역할을 선택하게 됩니다.
        </p>
      </div>

      <GoogleSignInButton />

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        또는
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <AuthForm mode="signup" action={signUpWithEmail} />

      <p className="text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-medium text-black underline">
          로그인
        </Link>
      </p>
    </main>
  );
}
