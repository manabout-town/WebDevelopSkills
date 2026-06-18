// app/onboarding/page.tsx
// Role picker + role-specific extra fields. Buyer needs nothing extra in
// this generic example; seller has one optional extra field (store name)
// to illustrate where marketplace-specific fields (business registration,
// portfolio, etc.) would go for a real seller-verification flow.
import { completeOnboarding } from "./actions"

export default function OnboardingPage() {
  return (
    <main style={{ maxWidth: 480, margin: "64px auto" }}>
      <h1>역할을 선택해주세요</h1>
      <p>판매자로 물건을 등록해서 팔 건가요, 구매자로 둘러보고 구매할 건가요?</p>

      <form action={completeOnboarding}>
        <label>
          이름(닉네임)
          <input type="text" name="displayName" required />
        </label>

        <fieldset>
          <legend>역할</legend>
          <label>
            <input type="radio" name="role" value="buyer" defaultChecked />
            구매자로 시작하기
          </label>
          <label>
            <input type="radio" name="role" value="seller" />
            판매자로 시작하기
          </label>
        </fieldset>

        <label>
          상점 이름 (판매자만 해당, 비워두면 닉네임 사용)
          <input type="text" name="storeName" />
        </label>

        <button type="submit">시작하기</button>
      </form>
    </main>
  )
}
