// Supabase CLI의 `supabase gen types typescript`로 생성되는 타입 파일의 자리.
// 실제 프로젝트에서는 이 파일 전체가 자동 생성 결과로 교체된다 — 수동으로 편집하지 않는다.
//
// 예시 (생성 후 형태):
// export type Database = {
//   public: {
//     Tables: {
//       // ...
//     };
//   };
// };

export type Database = Record<string, unknown>;
