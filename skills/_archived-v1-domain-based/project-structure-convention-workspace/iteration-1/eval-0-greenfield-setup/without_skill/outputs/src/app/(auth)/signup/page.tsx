import { signup } from "./actions";

// 회원가입 페이지 - 로그인 페이지와 동일한 패턴
export default function SignupPage() {
  return (
    <form action={signup}>
      <h1>회원가입</h1>
      <input name="email" type="email" placeholder="이메일" required />
      <input name="password" type="password" placeholder="비밀번호" required />
      <button type="submit">가입하기</button>
    </form>
  );
}
