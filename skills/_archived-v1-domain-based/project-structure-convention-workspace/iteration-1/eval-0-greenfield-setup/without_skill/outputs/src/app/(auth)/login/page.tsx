import { login } from "./actions";

// 로그인 페이지 - 누구나 접근 가능하지만 인증을 수행하는 페이지입니다.
export default function LoginPage() {
  return (
    <form action={login}>
      <h1>로그인</h1>
      <input name="email" type="email" placeholder="이메일" required />
      <input name="password" type="password" placeholder="비밀번호" required />
      <button type="submit">로그인</button>
    </form>
  );
}
