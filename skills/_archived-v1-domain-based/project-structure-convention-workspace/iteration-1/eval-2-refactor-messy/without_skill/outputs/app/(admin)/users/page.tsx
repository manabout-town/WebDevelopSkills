import { AdminUserRow } from "@/components/admin/admin-user-row";

export default function AdminUsersPage() {
  const users = [{ id: "1", email: "a@example.com" }];
  return (
    <table>
      <tbody>
        {users.map((u) => (
          <AdminUserRow key={u.id} user={u} />
        ))}
      </tbody>
    </table>
  );
}
