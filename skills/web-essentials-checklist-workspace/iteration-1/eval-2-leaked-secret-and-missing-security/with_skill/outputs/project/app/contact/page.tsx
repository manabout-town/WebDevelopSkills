import { submitContact } from './actions'

export default function ContactPage() {
  return (
    <form action={submitContact}>
      <input name="email" type="email" />
      <textarea name="message" />
      <button type="submit">Send</button>
    </form>
  )
}
