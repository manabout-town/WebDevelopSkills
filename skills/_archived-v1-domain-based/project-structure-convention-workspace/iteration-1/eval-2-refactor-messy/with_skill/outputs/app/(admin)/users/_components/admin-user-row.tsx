export function AdminUserRow({ user }: { user: { id: string; email: string } }) {
  return (
    <tr>
      <td>{user.email}</td>
    </tr>
  );
}
