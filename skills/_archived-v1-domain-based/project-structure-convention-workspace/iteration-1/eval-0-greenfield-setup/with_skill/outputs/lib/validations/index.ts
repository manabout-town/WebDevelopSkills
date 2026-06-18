// zod 등으로 작성하는 공유 스키마 모음.
// 폼(클라이언트)과 Server Action(서버) 양쪽에서 같은 스키마를 import해
// 검증 로직이 어긋나지 않게 한다.
//
// 예시:
// import { z } from "zod";
//
// export const signInSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(8),
// });
