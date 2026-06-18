"use client";

// 2개 이상의 컴포넌트에서 쓰는 커스텀 훅 예시.
// 특정 컴포넌트 한 곳에서만 쓰는 로직이면 그 컴포넌트 파일 안에 두고,
// 여기로 미리 옮겨두지 않는다.

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  return user;
}
